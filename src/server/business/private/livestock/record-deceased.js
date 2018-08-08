'use strict';

/************************************
 * record deceased for livestocks
 * **********************************/

import Promise from 'bluebird';
import { find as _find, forEach as _forEach } from 'lodash';
import { tagStatusCodes, livestockActivityStatusCodes, eventTypes } from '../../../../shared/constants';
import { HttpStatus, getResponse } from '../../../lib/index';
import { uuidToBuffer, bufferToUUID } from '../../../../shared/uuid/index';

import models from '../../../schema';
import { LivestockEventMapper, LivestockStatusHistoryMapper, MobCountHistoryMapper } from '../../../schema/mapper';
import {
    getLivestockByCondition, bulkCreateLivestockEvent, bulkCreateLivestockStatusHistory,
    bulkCreateMobCountHistory,
    updateLivestock, updateLivestockAttr
} from '../../../repository/livestock';
import { getTagStatus, updateTag, getTagByCondition } from '../../../repository/tag';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { createAudit, updateAudit } from '../common';
import { killUpload } from '../../../lib/nlis/index';
import { getPropertyByCondition } from '../../../repository/property';

// root function
function recordDeceased(contactId, language, obj, trans = null, preventNLISErr) {
    if (obj.isMob == 0 || obj.isMob == false) {
        return recordForEID(obj.dateOfDeceased, obj.eventGps, obj.disposalMethodId, obj.disposalMethodCode,
            obj.deathReason, obj.propertyId, contactId, obj.livestockIds, obj.shouldPostNlis, language, trans, preventNLISErr);
    }
    else {
        return recordForMob(obj.dateOfDeceased, obj.eventGps, obj.disposalMethodId, obj.disposalMethodCode,
            obj.deathReason, obj.propertyId, contactId, obj.livestockIds, obj.livestockCount, language, trans);
    }
}

// for EID based livestocks
function recordForEID(dateOfDeceased, eventGps, disposalMethodId, disposalMethodCode, deathReason, propertyId, contactId, livestockIds, shouldPost, language, trans, preventNLISErr) {

    let str = null, retrievedEID = null, deceasedTagStatus = null, deceasedLivestockStatus = null;
    _forEach(livestockIds, function (i) {
        if (str) { str = str + `,'${i}'`; }
        else { str = `'${i}'`; }
    });

    let select = `
    l.Id, l.EID,l.UUID ,l.AuditLogId,l.CurrentTagId,
    t.AuditLogId as TagAuditLogId,t.UUID as TagUUID,la.Id as LivestockAttrId`;
    let join = ` 
    left join tag t on t.Id = l.CurrentTagId 
    left join livestockattribute la on la.LivestockId = l.Id `;
    let where = ` l.UUID IN (${str}) `;

    var p = getLivestockByCondition(where, join, select).then(function (livestocks) {
        retrievedEID = livestocks;
        if (retrievedEID.length == 0) {
            throw new Error("No livestock found");
        }
        return;
    }).then(function () {
        return postToNlis(shouldPost, propertyId, dateOfDeceased, retrievedEID);
    });
    return p.then(function (res) {
        if (res.status == HttpStatus.BAD_REQUEST && preventNLISErr) {
            return res;
        }
        else {
            return Promise.resolve().then(function () {
                return getTagStatus(language);
            }).then(function (tagStatus) {
                deceasedTagStatus = _find(tagStatus, function (i) {
                    return i.SystemCode == tagStatusCodes.Deceased;
                });

                if (deceasedTagStatus == null) {
                    throw new Error("Tag Status - Deceased not available");
                }
                return;
            }).then(function (deceasedStatus) {
                return getAllActivityStatus({ SystemCode: livestockActivityStatusCodes.Deceased });
            }).then(function (livestockStatus) {
                if (livestockStatus.length == 0) {
                    throw new Error("Livestock Status - Deceased not available");
                }
                deceasedLivestockStatus = livestockStatus[0];
                return;
            }).then(function () {
                let livestockStatusId = uuidToBuffer(deceasedLivestockStatus.Id);
                let tagObj = {
                    CurrentLivestockId: null, CurrentStatusId: deceasedTagStatus.Id
                };
                let livestockObj = {
                    ActivityStatusId: livestockStatusId
                };
                let livestockAttrObj = {
                    DisposalMethodId: disposalMethodId ? uuidToBuffer(disposalMethodId) : null,
                    DeathReason: deathReason
                }
                let updateAuditIds = [], createAuditIds = [], tagIds = [], livestockIds = [],
                    livestockEvents = [], statusHistories = [], livestockAttrIds = [];

                _forEach(retrievedEID, function (f) {

                    if (f.UUID) {
                        updateAuditIds.push(bufferToUUID(f.AuditLogId));
                        livestockIds.push(f.UUID);
                    }
                    if (f.TagUUID) {
                        updateAuditIds.push(bufferToUUID(f.TagAuditLogId));
                        tagIds.push(f.TagUUID);
                    }
                    if (f.LivestockAttrId) {
                        livestockAttrIds.push(new Buffer(f.LivestockAttrId));
                    }

                    let reference = `DisposalMethod: ${disposalMethodCode}`;
                    let livestockEvent = LivestockEventMapper(new Buffer(f.Id), uuidToBuffer(propertyId),
                        null, 1, eventTypes.RecordDeceased, dateOfDeceased, eventGps, reference);
                    createAuditIds.push(livestockEvent.LivestockEvent_AuditLogId);
                    livestockEvents.push(livestockEvent.LivestockEvent);

                    let statusHistory = LivestockStatusHistoryMapper(new Buffer(f.Id), uuidToBuffer(propertyId),
                        livestockStatusId, eventGps, null, livestockEvent.LivestockEvent.Id);
                    statusHistories.push(statusHistory);
                });
                return models.sequelize.transaction(function (t) {
                    return updateAudit(updateAuditIds, [], contactId, trans).then(function () {
                        return createAudit(createAuditIds, contactId, trans);
                    }).then(function () {
                        return updateTag(tagObj, { UUID: tagIds }, trans);
                    }).then(function () {
                        return updateLivestock(livestockObj, { UUID: livestockIds }, trans);
                    }).then(function () {
                        return updateLivestockAttr(livestockAttrObj, { Id: livestockAttrIds }, trans);
                    }).then(function () {
                        return bulkCreateLivestockEvent(livestockEvents, trans);
                    }).then(function () {
                        return bulkCreateLivestockStatusHistory(statusHistories, trans);
                    });
                })
            }).then(function () {
                return getResponse();
            }).catch(function (err) {
                throw new Error(err.toString());
            });
        }
    });

}

// for mob based livestocks
function recordForMob(dateOfDeceased, eventGps, disposalMethodId, disposalMethodCode, deathReason, propertyId, contactId,
    livestockId, livestockCount, language, trans) {

    let currentMob = null, deceasedLivestockStatus = null;

    let select = `l.Id, l.UUID,l.NumberOfHead ,l.AuditLogId,l.CurrentTagId,la.Id as LivestockAttrId`;
    let join = `     
    left join livestockattribute la on la.LivestockId = l.Id `;
    let where = ` l.UUID = ('${livestockId}') `;

    return getLivestockByCondition(where, join, select).then(function (livestocks) {
        currentMob = livestocks[0];
        if (currentMob == null) {
            throw new Error("No livestock found");
        }
        if (currentMob.NumberOfHead == null || currentMob.NumberOfHead == undefined) {
            currentMob.NumberOfHead = 0;
        }
        return;
    }).then(function () {
        return getAllActivityStatus({ SystemCode: livestockActivityStatusCodes.Deceased });
    }).then(function (livestockStatus) {
        if (livestockStatus.length == 0) {
            throw new Error("Livestock Status - Deceased not available");
        }
        deceasedLivestockStatus = livestockStatus[0];
        return;
    }).then(function () {
        let livestockId = new Buffer(currentMob.Id);
        let binPropertyId = uuidToBuffer(propertyId);
        let binDisposalMethodId = uuidToBuffer(disposalMethodId);
        let livestockStatusId = uuidToBuffer(deceasedLivestockStatus.Id);
        let livestockObj = {};
        let livestockAttrObj = null;
        let updateAuditIds = [], createAuditIds = [], livestockIds = [],
            livestockEvents = [], statusHistories = [], countHistories = [], livestockAttrIds = [];
        let numberOfLivestock = parseInt(livestockCount) == parseInt(currentMob.NumberOfHead) ? 0 :
            parseInt(currentMob.NumberOfHead) - parseInt(livestockCount);

        //  Livestock Event
        let reference = `DisposalMethod: ${disposalMethodCode}`;
        let livestockEventObj = LivestockEventMapper(livestockId, binPropertyId, null, numberOfLivestock,
            eventTypes.RecordDeceased, dateOfDeceased, eventGps, reference);
        createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
        livestockEvents.push(livestockEventObj.LivestockEvent);

        // if all counts are deceased    
        if (parseInt(livestockCount) == parseInt(currentMob.NumberOfHead)) {

            livestockObj = {
                ActivityStatusId: livestockStatusId, NumberOfHead: numberOfLivestock
            }

            let statusHistory = LivestockStatusHistoryMapper(livestockId, binPropertyId,
                livestockStatusId, eventGps, deathReason, livestockEventObj.LivestockEvent.Id);
            statusHistories.push(statusHistory);
        }
        else {
            livestockObj = {
                NumberOfHead: numberOfLivestock
            }
            livestockAttrObj = {
                DisposalMethodId: binDisposalMethodId,
                DeathReason: deathReason
            }
            livestockAttrIds.push(new Buffer(currentMob.LivestockAttrId));
        }

        let mobCountHistory = MobCountHistoryMapper(livestockId, binPropertyId, parseInt(livestockCount) * -1,
            binDisposalMethodId, deathReason, livestockEventObj.LivestockEvent.Id);
        countHistories.push(mobCountHistory);

        if (currentMob.UUID) {
            updateAuditIds.push(currentMob.UUID);
            livestockIds.push(currentMob.UUID);
        }
        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, trans).then(function () {
                return createAudit(createAuditIds, contactId, trans);
            }).then(function () {
                return updateLivestock(livestockObj, { UUID: livestockIds }, trans);
            }).then(function () {
                if (livestockAttrObj != null)
                    return updateLivestockAttr(livestockAttrObj, { Id: livestockAttrIds }, trans);
                else return true;
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEvents, trans);
            }).then(function () {
                if (statusHistories.length > 0)
                    return bulkCreateLivestockStatusHistory(statusHistories, trans);
                else return true;
            }).then(function () {
                return bulkCreateMobCountHistory(countHistories, trans);
            });
        });
    }).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// retrieve nlisusername | password and post tags to nlis
function postToNlis(shouldPost, propertyId, dateOfDeceased, livestocks) {

    if (shouldPost == false) {
        return true;
    }

    let property = null;
    return getPropertyByCondition(` p.Id = fn_UuidToBin('${propertyId}') `, '', `p.NLISUsername,p.NLISPassword`)
        .then(function (res) {

            property = res[0];
            if (property == null)
                throw new Error("Property does not exist");

            return livestocks.filter(function (f) {
                return f.EID != null && f.EID != undefined;
            }).map(function (f) { return f.EID; });
        }).then(function (eids) {
            return killUpload(property.NLISUsername, property.NLISPassword, dateOfDeceased, eids);
        }).catch(function (err) {
            throw new Error(err);
        });
}

function activateLivestock(contactId, language, obj, trans = null) {
    let livestockIdBuffer = [], createAuditIds = [], updateAuditIds = [], currentTagIds = [],
        str = null, activeTagStatus = null, livestocks = null;

    obj.livestockIds.forEach(function (element) {
        livestockIdBuffer.push(uuidToBuffer(element));
        if (str) { str = str + `,'${element}'`; }
        else { str = `'${element}'`; }
    }, this);
    return getTagByCondition({ CurrentLivestockId: livestockIdBuffer }).then(function (res) {
        if (res.length > 0) {
            throw new Error("Tag already assigned to another livestock.");
        }

        let select = `l.EID,l.UUID ,l.AuditLogId,l.CurrentTagId`;
        let where = ` l.UUID IN (${str}) `;

        return getLivestockByCondition(where, '', select);
    }).then(function (livestockObj) {
        livestocks = livestockObj;
        return getTagStatus(language);
    }).then(function (res) {
        activeTagStatus = res.filter((status) => {
            return status.SystemCode == tagStatusCodes.Active;
        })[0].Id;

        currentTagIds = livestocks.map((livestock) => {
            return bufferToUUID(livestock.CurrentTagId);
        });
        return getTagByCondition({ UUID: currentTagIds });
    }).then(function (res) {
        if (res.length > 0) {
            res.forEach(function (element) {
                updateAuditIds.push(bufferToUUID(element.AuditLogId));
            }, this);
        }

        let tagPromises = [];

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(createAuditIds, contactId, t);
            }).then(function () {
                livestocks.forEach(function (livestock) {
                    tagPromises.push(updateTag({ CurrentLivestockId: uuidToBuffer(livestock.UUID), CurrentStatusId: activeTagStatus },
                        { UUID: bufferToUUID(livestock.CurrentTagId) }, trans));
                }, this);
                return Promise.all(tagPromises);
            }).then(function (res) {
                return getResponse();
            }).catch(function (err) {
                throw new Error(err.toString());
            });
        });
    });
}

module.exports = {
    recordDeceased: Promise.method(recordDeceased),
    activateLivestock: Promise.method(activateLivestock)
}
