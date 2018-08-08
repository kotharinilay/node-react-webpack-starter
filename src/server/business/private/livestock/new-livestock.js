'use strict';

/***********************************
 * logic related to new/update livestock
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { isEmpty as _isEmpty } from 'lodash';

import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { getTagStatus, getTagByEID, updateTag, bulkCreateTagHistory, bulkCreateTag } from '../../../repository/tag';
import { createAudit, updateAudit } from '../common';
import { bulkCreateBreedComposition } from '../../../repository/breedcomposition';
import { getEnclosureTypeById } from '../../../repository/enclosuretype';
import {
    bulkCreateLivestock, bulkCreateLivestockAttribute,
    bulkCreateLivestockPropertyHistory, bulkCreateLivestockWeightHistory,
    bulkCreateLivestockStatusHistory, bulkCreateLivestockEnclosureHistory, bulkCreateLivestockEvent,
    updateLivestock, getLivestockByCondition, bulkCreateMobCountHistory,
    updateLivestockAttr
} from '../../../repository/livestock';
import { recordDeceased, activateLivestock } from './record-deceased';

import { HttpStatus, getResponse, resMessages, jsonToCSVConvertor } from '../../../lib/index';
import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import {
    livestockIdentifierCodes, livestockActivityStatusCodes,
    tagStatusCodes, eventTypes
} from '../../../../shared/constants';

import {
    LivestockMapper, LivestockAttributeMapper, LivestockEventMapper, LivestockEnclosureHistoryMapper,
    BreedCompositionMapper, LivestockPropertyHistoryMapper, LivestockStatusHistoryMapper, TagHistoryMapper,
    LivestockWeightHistoryMapper, MobCountHistoryMapper, MultipleLivestockMapper, MultipleLivestockAttributeMapper
} from '../../../schema/mapper';

// find duplicate livestock with specific identifier
let checkDuplicate = (type, eid, livestockId, language) => {
    let responseData = null;
    return getAllActivityStatus({ Language: language }).then(function (result) {
        responseData = { activityStatus: result };
        let condition = `l.${type} = '${eid}' and l.UUID != '${livestockId}'`;
        let columns = `l.UUID AS Id, l.CurrentPropertyId, l.ActivityStatusId, l.${type}, l.IsDeleted, 
        l.AuditLogId, l.CurrentWeight`;
        return getLivestockByCondition(condition, '', columns).then(function (result) {
            responseData.dupLivestock = result;
            return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
        });
    });
}

let createLivestock = (inductionObj, language, contactId, trans = null) => {
    let livestockObj = LivestockMapper(inductionObj);
    let livestockAttrObj = LivestockAttributeMapper(inductionObj);
    let livestockId = inductionObj.existLivestockId || newUUID(); // existLivestockId for new livestock from e-NVD
    let livestockAuditId = newUUID();
    let tagStatus = [];

    let auditIds = [];
    let updateAuditIds = [];
    let livestockBulk = [];
    let breedCompositionBulk = '';
    let livestockAttrBulk = [];
    let tagUpdateObj = null;
    let tagUpdateCondition = {};
    let tagBulk = [];
    let tagHistoryBulk = [];
    let livestockEventBulk = [];
    let propertyHistoryBulk = [];
    let weightHistoryBulk = [];
    let statusHistoryBulk = [];
    let enclosureHistoryBulk = [];
    let mobCountHistoryBulk = [];
    let livestockActivityId = null;

    return getAllActivityStatus({ Language: language }).then(function (res) {
        livestockActivityId = res.filter((status) => {
            return status.SystemCode == livestockActivityStatusCodes['Available'];
        })[0].Id;
        livestockObj.ActivityStatusId = inductionObj.existActivityId ? uuidToBuffer(inductionObj.existActivityId) :
            uuidToBuffer(livestockActivityId);
        livestockObj.Id = uuidToBuffer(livestockId);
        livestockObj.UUID = livestockId;
        if (inductionObj.livestockidentifier)
            livestockObj[inductionObj.livestockidentifier] = inductionObj.identifier;
        livestockObj.AuditLogId = uuidToBuffer(livestockAuditId);
        livestockObj.IsMob = inductionObj.type == '1' ? 0 : 1;
        auditIds.push(livestockAuditId);
        livestockBulk.push(livestockObj);

        if (inductionObj.breedComposition)
            breedCompositionBulk += BreedCompositionMapper(livestockId, inductionObj.breedComposition);

        let livestockAttrId = newUUID();
        livestockAttrObj.Id = uuidToBuffer(livestockAttrId);
        livestockAttrObj.UUID = livestockAttrId;
        livestockAttrObj.LivestockId = uuidToBuffer(livestockId);
        livestockAttrBulk.push(livestockAttrObj);

        if (inductionObj.livestockidentifier == livestockIdentifierCodes['EID'] ||
            inductionObj.livestockidentifier == livestockIdentifierCodes['NLISID'])
            return getTagStatus(language);
        else return true;
    }).then(function (res) {
        tagStatus = res;
        let activeStatusId = null;
        if (tagStatus.length > 0) {
            activeStatusId = tagStatus.filter((status) => {
                return status.SystemCode == tagStatusCodes['Active'];
            })[0].Id;
            if (inductionObj.tagId) {
                tagUpdateObj = { CurrentStatusId: activeStatusId, CurrentLivestockId: uuidToBuffer(livestockId) };
                tagUpdateCondition = { Id: uuidToBuffer(inductionObj.tagId) }
                updateAuditIds.push(inductionObj.tagAuditId);
            }
            else {
                inductionObj.tagId = newUUID();
                let tagAuditId = newUUID();
                auditIds.push(tagAuditId);
                let tagObj = {
                    Id: uuidToBuffer(inductionObj.tagId),
                    UUID: inductionObj.tagId,
                    IssueDate: new Date(),
                    OriginPropertyId: uuidToBuffer(inductionObj.topPIC.PropertyId),
                    CurrentLivestockId: uuidToBuffer(livestockId),
                    CurrentStatusId: activeStatusId,
                    TagYear: new Date().getFullYear(),
                    SpeciesId: uuidToBuffer(inductionObj.species),
                    AuditLogId: uuidToBuffer(tagAuditId),
                };
                tagObj[inductionObj.livestockidentifier] = inductionObj.identifier;
                tagBulk.push(tagObj);
            }
            let tagHistoryObj = TagHistoryMapper(inductionObj.tagId, livestockId)
            tagHistoryBulk.push(tagHistoryObj.TagHistory);
            auditIds.push(tagHistoryObj.TagHistory_AuditLogId);
        }
        if (inductionObj.enclosurename)
            return getEnclosureTypeById(inductionObj.enclosurename, language);
        else
            return false;
    }).then(function (res) {
        let enclosureCode = null;
        if (res) {
            enclosureCode = res[0].SystemCode;
        }

        // Livestock Event
        let reference = `Status: ${livestockActivityStatusCodes.Available}`;
        let livestockEventObj = LivestockEventMapper(uuidToBuffer(livestockId),
            uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
            inductionObj.livestockquantity, eventTypes.Inducted);
        auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

        // Property History
        let livestockPropHistoryObj = LivestockPropertyHistoryMapper(uuidToBuffer(livestockId),
            uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.livestockweight, new Date(),
            0, livestockEventObj.LivestockEvent.Id);
        propertyHistoryBulk.push(livestockPropHistoryObj);

        // Status History
        let livestockStatusHistoryObj = LivestockStatusHistoryMapper(uuidToBuffer(livestockId),
            uuidToBuffer(inductionObj.topPIC.PropertyId), uuidToBuffer(livestockActivityId),
            inductionObj.inductionGPS, null, livestockEventObj.LivestockEvent.Id);
        statusHistoryBulk.push(livestockStatusHistoryObj);

        // Weight History
        if (inductionObj.livestockweight) {
            reference += `, Weight: ${inductionObj.livestockweight}`;
            let livestockWeightHistoryObj = LivestockWeightHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
                inductionObj.topPIC.PIC, inductionObj.livestockweight, new Date(),
                livestockEventObj.LivestockEvent.Id);
            weightHistoryBulk.push(livestockWeightHistoryObj);
        }
        // Enclosure History
        if (inductionObj.enclosurename) {
            reference += `, Enclosure: ${enclosureCode}`;
            let livestockEnclosureHistoryObj = LivestockEnclosureHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), uuidToBuffer(inductionObj.enclosurename),
                inductionObj.livestockweight, new Date(), livestockEventObj.LivestockEvent.Id);
            enclosureHistoryBulk.push(livestockEnclosureHistoryObj);
        }

        // Mobcount History
        if (inductionObj.type == '2') {
            reference += `, LivestockCount: ${inductionObj.livestockquantity}`;
            let mobCountHistoryObj = MobCountHistoryMapper(uuidToBuffer(livestockId), uuidToBuffer(inductionObj.topPIC.PropertyId),
                inductionObj.livestockquantity, null, null, livestockEventObj.LivestockEvent.Id);
            mobCountHistoryBulk.push(mobCountHistoryObj);
        }
        livestockEventObj.LivestockEvent.Reference = reference;
        livestockEventBulk.push(livestockEventObj.LivestockEvent);

        return models.sequelize.transaction(function (t) {
            if (trans) t = trans;
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(auditIds, contactId, t);
            }).then(function () {
                return bulkCreateLivestock(livestockBulk, t);
            }).then(function () {
                if (breedCompositionBulk) {
                    breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, "");
                    return bulkCreateBreedComposition(breedCompositionBulk, t);
                }
                else
                    return true;
            }).then(function () {
                return bulkCreateLivestockAttribute(livestockAttrBulk, t);
            }).then(function () {
                if (tagUpdateObj)
                    return updateTag(tagUpdateObj, tagUpdateCondition, t);
                else return true
            }).then(function () {
                if (tagBulk.length > 0)
                    return bulkCreateTag(tagBulk, t);
                else
                    return true;
            }).then(function () {
                if (tagHistoryBulk.length > 0)
                    return bulkCreateTagHistory(tagHistoryBulk, t);
                else
                    return true;
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEventBulk, t);
            }).then(function () {
                return bulkCreateLivestockPropertyHistory(propertyHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockWeightHistory(weightHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(statusHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockEnclosureHistory(enclosureHistoryBulk, t);
            }).then(function () {
                return bulkCreateMobCountHistory(mobCountHistoryBulk, t);
            }).then(function () {
                if (inductionObj.tagId)
                    return updateLivestock({ CurrentTagId: uuidToBuffer(inductionObj.tagId) }, { UUID: livestockId }, t);
                else
                    return true;
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

let modifyLivestock = (inductionObj, language, contactId) => {
    let livestockObj = LivestockMapper(inductionObj);
    let livestockAttrObj = LivestockAttributeMapper(inductionObj);
    let livestockId = inductionObj.livestockId;
    let breedCompositionBulk = `DELETE FROM breedcomposition WHERE LivestockId = fn_UuidToBin('${livestockId}'); `;
    let auditIds = [];
    let updateAuditIds = [];

    let livestockEventBulk = [];
    let propertyHistoryBulk = [];
    let weightHistoryBulk = [];
    let statusHistoryBulk = [];
    let enclosureHistoryBulk = [];
    let mobCountHistoryBulk = [];
    let currentActivityStatusCode = null;

    return getAllActivityStatus({ Language: language }).then(function (res) {
        if (!inductionObj.activitystatus) {
            inductionObj.activitystatus = res.filter((status) => {
                return status.SystemCode == livestockActivityStatusCodes['Available'];
            })[0].Id;
        }
        else {
            currentActivityStatusCode = res.filter((status) => {
                return status.Id == inductionObj.activitystatus;
            })[0].SystemCode;

            if (!(currentActivityStatusCode == livestockActivityStatusCodes.Available || currentActivityStatusCode == livestockActivityStatusCodes.Deceased ||
                currentActivityStatusCode == livestockActivityStatusCodes.Killed) && inductionObj.activityHistory) {
                return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1132');
            }
        }

        livestockObj.ActivityStatusId = uuidToBuffer(inductionObj.activitystatus);

        breedCompositionBulk += BreedCompositionMapper(livestockId, inductionObj.breedComposition);
        updateAuditIds.push(inductionObj.livestockAuditId);

        if (inductionObj.enclosureHistory)
            return getEnclosureTypeById(inductionObj.enclosureHistory, language);
        else
            return false;
    }).then(function (res) {
        let enclosureCode = null;
        if (res) {
            enclosureCode = res[0].SystemCode;
        }

        // Livestock Event
        let reference = ``;
        let livestockEventObj = LivestockEventMapper(uuidToBuffer(livestockId),
            uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
            inductionObj.livestockquantity, eventTypes.ModifyLivestock, new Date(), inductionObj.inductionGPS,
            reference);
        auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

        // Property History
        if (inductionObj.propertyHistory) {
            let livestockPropHistoryObj = LivestockPropertyHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.livestockweight, new Date(),
                0, livestockEventObj.LivestockEvent.Id);
            propertyHistoryBulk.push(livestockPropHistoryObj);
        }

        // Status History
        if (inductionObj.activityHistory) {
            reference = `Status: ${currentActivityStatusCode}`;
            let livestockStatusHistoryObj = LivestockStatusHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), uuidToBuffer(inductionObj.activitystatus),
                inductionObj.inductionGPS, null, livestockEventObj.LivestockEvent.Id);
            statusHistoryBulk.push(livestockStatusHistoryObj);
        }

        // Weight History
        if (inductionObj.weightHistory && inductionObj.livestockweight) {
            reference += `, Weight: ${inductionObj.livestockweight}`;
            let livestockWeightHistoryObj = LivestockWeightHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
                inductionObj.topPIC.PIC, inductionObj.livestockweight, new Date(), livestockEventObj.LivestockEvent.Id);
            weightHistoryBulk.push(livestockWeightHistoryObj);
        }

        // Enclosure History
        if (inductionObj.enclosureHistory) {
            reference += `, Enclosure: ${enclosureCode}`;
            let livestockEnclosureHistoryObj = LivestockEnclosureHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), uuidToBuffer(inductionObj.enclosurename),
                inductionObj.livestockweight, new Date(), livestockEventObj.LivestockEvent.Id);
            enclosureHistoryBulk.push(livestockEnclosureHistoryObj);
        }

        // Mobcount History
        if (inductionObj.type == '2' && inductionObj.mobCountHistory) {
            reference += `, LivestockCount: ${inductionObj.mobCountDifference}`;
            let mobCountHistoryObj = MobCountHistoryMapper(uuidToBuffer(livestockId), uuidToBuffer(inductionObj.topPIC.PropertyId),
                inductionObj.mobCountDifference, null, null, livestockEventObj.LivestockEvent.Id);
            mobCountHistoryBulk.push(mobCountHistoryObj.MobCountHistory);
        }
        livestockEventObj.LivestockEvent.Reference = reference;
        livestockEventBulk.push(livestockEventObj.LivestockEvent);

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(auditIds, contactId, t);
            }).then(function () {
                return updateLivestock(livestockObj, { Id: uuidToBuffer(livestockId) }, t);
            }).then(function () {
                breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, "");
                return bulkCreateBreedComposition(breedCompositionBulk, t);
            }).then(function () {
                return updateLivestockAttr(livestockAttrObj, { LivestockId: uuidToBuffer(livestockId) }, t);
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEventBulk, t);
            }).then(function () {
                return bulkCreateLivestockPropertyHistory(propertyHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockWeightHistory(weightHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(statusHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockEnclosureHistory(enclosureHistoryBulk, t);
            }).then(function () {
                return bulkCreateMobCountHistory(mobCountHistoryBulk, t);
            }).then(function () {
                if (currentActivityStatusCode == livestockActivityStatusCodes.Deceased ||
                    currentActivityStatusCode == livestockActivityStatusCodes.Killed) {
                    let obj = {
                        isMob: inductionObj.type == '1' ? false : true,
                        eventGps: inductionObj.inductionGPS,
                        propertyId: inductionObj.topPIC.PropertyId,
                        livestockIds: [inductionObj.livestockId],
                        livestockCount: inductionObj.livestockquantity || 1
                    }
                    return recordDeceased(contactId, language, obj, t, false);
                }
                else if (currentActivityStatusCode == livestockActivityStatusCodes.Available &&
                    inductionObj.activityHistory && inductionObj.type == '1' &&
                    (inductionObj.prevActivityStatus == livestockActivityStatusCodes.Deceased ||
                        inductionObj.prevActivityStatus == livestockActivityStatusCodes.Killed)) {
                    let obj = {
                        livestockIds: [inductionObj.livestockId]
                    }
                    return activateLivestock(contactId, language, obj, t);
                }
                else return true;
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    })
}

let multipleModify = (inductionObj, language, contactId) => {
    let livestockObj = MultipleLivestockMapper(inductionObj);
    let livestockAttrObj = MultipleLivestockAttributeMapper(inductionObj);
    let livestockIds = inductionObj.livestockId;
    let livestockIdsBuffer = [];
    let breedCompositionBulk = `DELETE FROM breedcomposition WHERE LivestockId IN (`;
    livestockIds.forEach(function (ls) {
        livestockIdsBuffer.push(uuidToBuffer(ls));
        breedCompositionBulk += `fn_UuidToBin('${ls}'),`;
    }, this);
    breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, ");");
    let auditIds = [], updateAuditIds = inductionObj.livestockAuditId;
    let livestockEventBulk = [], weightHistoryBulk = [], statusHistoryBulk = [], currentActivityStatusCode = null,
        livestockActivityMaster = null;

    return getAllActivityStatus({ Language: language }).then(function (res) {
        livestockActivityMaster = res;
        if (inductionObj.activitystatus) {
            livestockObj.ActivityStatusId = uuidToBuffer(inductionObj.activitystatus);
            currentActivityStatusCode = res.filter((status) => {
                return status.Id == inductionObj.activitystatus;
            })[0].SystemCode;

            if (!(currentActivityStatusCode == livestockActivityStatusCodes.Available || currentActivityStatusCode == livestockActivityStatusCodes.Deceased ||
                currentActivityStatusCode == livestockActivityStatusCodes.Killed) && inductionObj.activityHistory) {
                return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1132');
            }
        }
        if (inductionObj.breedComposition) {
            livestockIds.forEach(function (livestockId) {
                breedCompositionBulk += BreedCompositionMapper(livestockId, inductionObj.breedComposition);
                // breedCompositionBulk += ',';
            }, this);
        }

        livestockIds.forEach(function (livestockId) {
            let reference = ``;
            let livestockEventObj = LivestockEventMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
                inductionObj.livestockquantity, eventTypes.modifyLivestock, new Date(), inductionObj.inductionGPS,
                reference);
            auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

            // Status History
            if (inductionObj.activityHistory) {
                reference = `Status: ${currentActivityStatusCode}`;
                let livestockStatusHistoryObj = LivestockStatusHistoryMapper(uuidToBuffer(livestockId),
                    uuidToBuffer(inductionObj.topPIC.PropertyId), uuidToBuffer(inductionObj.activitystatus),
                    inductionObj.inductionGPS, null, livestockEventObj.LivestockEvent.Id);
                statusHistoryBulk.push(livestockStatusHistoryObj.LivestockStatusHistory);
            }

            // Weight History
            if (inductionObj.weightHistory && inductionObj.livestockweight) {
                reference += `Weight: ${inductionObj.livestockweight}`;
                let livestockWeightHistoryObj = LivestockWeightHistoryMapper(uuidToBuffer(livestockId),
                    uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null,
                    inductionObj.topPIC.PIC, inductionObj.livestockweight, new Date(),
                    livestockEventObj.LivestockEvent.Id);
                weightHistoryBulk.push(livestockWeightHistoryObj.LivestockWeightHistory);
            }

            livestockEventObj.LivestockEvent.Reference = reference;
            livestockEventBulk.push(livestockEventObj.LivestockEvent);
        }, this);

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(auditIds, contactId, t);
            }).then(function () {
                return updateLivestock(livestockObj, { Id: livestockIdsBuffer }, t);
            }).then(function () {
                if (inductionObj.breedComposition) {
                    breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, "");
                    return bulkCreateBreedComposition(breedCompositionBulk, t);
                }
                else
                    return true;
            }).then(function () {
                if (!_isEmpty(livestockAttrObj))
                    return updateLivestockAttr(livestockAttrObj, { LivestockId: livestockIdsBuffer }, t);
                else return true;
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEventBulk, t);
            }).then(function () {
                return bulkCreateLivestockWeightHistory(weightHistoryBulk, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(statusHistoryBulk, t);
            }).then(function () {
                if (currentActivityStatusCode == livestockActivityStatusCodes.Deceased ||
                    currentActivityStatusCode == livestockActivityStatusCodes.Killed) {
                    let obj = {
                        isMob: inductionObj.type == '1' ? false : true,
                        eventGps: inductionObj.inductionGPS,
                        propertyId: inductionObj.topPIC.PropertyId,
                        livestockIds: livestockIds,
                        livestockCount: inductionObj.livestockquantity || 1
                    }
                    return recordDeceased(contactId, language, obj, t);
                }
                else if (currentActivityStatusCode == livestockActivityStatusCodes.Available &&
                    inductionObj.activityHistory && inductionObj.type == '1' && inductionObj.prevActivityStatus) {

                    if (typeof inductionObj.prevActivityStatus != 'string' && inductionObj.prevActivityStatus.length > 0) {
                        inductionObj.prevActivityStatus = inductionObj.prevActivityStatus.map((ele) => {
                            let filterStatus = livestockActivityMaster.filter((status) => {
                                return status.Id == bufferToUUID(ele.statusId);
                            })[0];
                            return { livestockId: ele.livestockId, statusId: filterStatus.Id, statusCode: filterStatus.SystemCode };
                        })
                        livestockIds = [];
                        inductionObj.prevActivityStatus.forEach(function (prevStatus) {
                            if (prevStatus.statusCode == livestockActivityStatusCodes.Deceased ||
                                prevStatus.statusCode == livestockActivityStatusCodes.Killed)
                                livestockIds.push(prevStatus.livestockId);
                        }, this);
                    }
                    let obj = {
                        livestockIds: livestockIds
                    }
                    return activateLivestock(contactId, language, obj);
                }
                else return true;
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    })
}

module.exports = {
    checkDuplicateEID: Promise.method(checkDuplicate),
    createLivestock: Promise.method(createLivestock),
    modifyLivestock: Promise.method(modifyLivestock),
    multipleModifyLivestock: Promise.method(multipleModify)
}