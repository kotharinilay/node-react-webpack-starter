'use strict';

/*****************************************
 * merge multiple mob into single
 * **************************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { map as _map } from 'lodash';

import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import { HttpStatus, getResponse } from '../../../lib/index';
import {
    bulkCreateLivestock, bulkCreateLivestockAttribute, updateLivestock, updateLivestockAttr, getLivestockByCondition,
    bulkCreateLivestockEvent, bulkCreateLivestockPropertyHistory, bulkCreateLivestockWeightHistory,
    bulkCreateLivestockStatusHistory, bulkCreateLivestockEnclosureHistory,
    bulkCreateMobCountHistory
} from '../../../repository/livestock';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { bulkCreateBreedComposition } from '../../../repository/breedcomposition';
import {
    LivestockEventMapper, LivestockEnclosureHistoryMapper, LivestockPropertyHistoryMapper,
    LivestockStatusHistoryMapper, LivestockWeightHistoryMapper, MobCountHistoryMapper, BreedCompositionMapper,
    MultipleLivestockMapper, MultipleLivestockAttributeMapper
} from '../../../schema/mapper.js';
import { createAudit, updateAudit } from '../common';
import { livestockActivityStatusCodes, eventTypes } from '../../../../shared/constants';

// perform merge mob into single mob
let mergeMob = (obj, language, contactId) => {
    let { resultMob, resultMobAttr, isIndividual, isSelected, selectedMobNames } = obj;
    let topPIC = resultMobAttr.topPIC;
    let livestockIds = resultMobAttr.livestockId;
    let livestockBufferIds = [];
    livestockIds.map(id => { livestockBufferIds.push(uuidToBuffer(id)) });

    let resultMobName = isSelected ? resultMob.mob.mob : resultMob.mob
    let selectedMobId = isSelected ? resultMob.mob.id : livestockIds[0];
    let newEntry = (!isIndividual && !isSelected); // Only for mob
    let updateSelectedMob = (!isIndividual && isSelected); // Only for mob
    let getActivityStatus = (newEntry && !resultMobAttr.ActivityStatusId);
    let updateEnclosureId = resultMob.enclosurename ? true : false;
    let updateBreedCompositionData = resultMobAttr.breedComposition ? true : false;

    let resLivestockObj = null;
    let resLivestockAttrObj = null;
    let resLivestocks = [];
    let livestockActivityId = null;

    return getLivestockByCondition(`l.UUID = '${selectedMobId}'`, '', 'l.*').then(function (resLivestock) {
        resLivestockObj = resLivestock[0];
        for (var key in resLivestockObj) {
            if (resLivestockObj[key] && resLivestockObj[key]['type'])
                resLivestockObj[key] = new Buffer(resLivestockObj[key]);
        }
        return getLivestockByCondition(`l.UUID = '${selectedMobId}'`, 'left join livestockattribute la on la.LivestockId = l.Id', 'la.*');
    }).then(function (resLivestockAttr) {
        resLivestockAttrObj = resLivestockAttr[0];
        for (var key in resLivestockAttrObj) {
            if (resLivestockAttrObj[key] && resLivestockAttrObj[key]['type'])
                resLivestockAttrObj[key] = new Buffer(resLivestockAttrObj[key]);
        }
        if (updateSelectedMob || (!newEntry && (updateEnclosureId || resultMobAttr.ActivityStatusId))) {
            let uuids = [];
            livestockIds.map(id => {
                if (id != selectedMobId || isIndividual)
                    uuids.push(`'${id}'`);
            });
            return getLivestockByCondition(` l.UUID in (${uuids.join()})`, '', 'l.Id, l.CurrentPropertyId, l.CurrentEnclosureId, l.NumberOfHead, l.CurrentWeight, l.InductionDate, l.DefaultGPS, l.UUID');
        }
        else return false;
    }).then(function (resLivestockData) {
        if (resLivestockData) {
            resLivestocks = resLivestockData;
            resLivestocks.map(obj => {
                for (var key in obj) {
                    if (obj[key] && obj[key]['type'])
                        obj[key] = new Buffer(obj[key]);
                }
            });
        }
        if (getActivityStatus)
            return getAllActivityStatus({ Language: language });
        else return false;
    }).then(function (resActivityStatus) {
        if (getActivityStatus) {
            livestockActivityId = uuidToBuffer(resActivityStatus.filter((status) => {
                return status.SystemCode == livestockActivityStatusCodes.Available;
            })[0].Id);
        }
        else if (resultMobAttr.ActivityStatusId) {
            livestockActivityId = uuidToBuffer(resultMobAttr.ActivityStatusId);
        }

        let livestockEvents = [];
        let propertyHistories = [];
        let statusHistories = [];
        let weightHistories = [];
        let enclosureHistories = [];
        let mobCountHistories = [];


        let livestockObj = MultipleLivestockMapper(resultMobAttr);
        let livestockAttrObj = MultipleLivestockAttributeMapper(resultMobAttr);

        let updateAuditIds = resultMobAttr.livestockAuditId;
        let createAuditIds = [];

        let updateLivestockObj = null;
        let updateSelectedLivestockObj = null;
        let breedCompositionBulk = '';

        if (isIndividual) {
            updateLivestockObj = { Mob: isSelected ? resultMob.mob.mob : resultMob.mob };
            if (updateEnclosureId)
                updateLivestockObj.CurrentEnclosureId = uuidToBuffer(resultMob.enclosurename);

            updateLivestockObj = Object.assign({}, livestockObj, livestockAttrObj, updateLivestockObj);
        }
        else {
            updateLivestockObj = { NumberOfHead: 0, CurrentWeight: 0 };
        }

        if (updateSelectedMob) {
            updateSelectedLivestockObj = {
                Mob: isSelected ? resultMob.mob.mob : resultMob.mob,
                CurrentWeight: resultMob.weight,
                NumberOfHead: parseInt(resultMob.quantity || 0)
            }
            if (updateEnclosureId)
                updateSelectedLivestockObj.CurrentEnclosureId = uuidToBuffer(resultMob.enclosurename);

            updateSelectedLivestockObj = Object.assign({}, livestockObj, livestockAttrObj, updateSelectedLivestockObj);

            let obj = Object.assign({}, resLivestockObj, updateSelectedLivestockObj);
            let reference = `Merged from Mob: ` + selectedMobNames.join();

            // Livestock Event
            let livestockEventObj = LivestockEventMapper(obj.Id, obj.CurrentPropertyId, obj.CurrentEnclosureId,
                obj.NumberOfHead, eventTypes.MergeMob, obj.InductionDate, obj.DefaultGPS, reference);
            createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
            livestockEvents.push(livestockEventObj.LivestockEvent);

            // Weight history
            let livestockWeightHistory = LivestockWeightHistoryMapper(obj.Id, obj.CurrentPropertyId,
                obj.CurrentEnclosureId, topPIC.PIC, obj.CurrentWeight, obj.InductionDate,
                livestockEventObj.LivestockEvent.Id);
            weightHistories.push(livestockWeightHistory);

            // Mob count history
            let mobCountHistory = MobCountHistoryMapper(obj.Id, obj.CurrentPropertyId,
                (resLivestockObj.NumberOfHead - obj.NumberOfHead),
                null, null, livestockEventObj.LivestockEvent.Id);
            mobCountHistories.push(mobCountHistory);
        }

        let livestocks = [];
        let livestocksAttr = [];
        if (newEntry) {
            let livestockId = newUUID();
            let livestockAttrId = newUUID();
            let livestockAuditId = newUUID();
            createAuditIds.push(livestockAuditId);

            let newObj = {
                Mob: isSelected ? resultMob.mob.mob : resultMob.mob,
                CurrentWeight: resultMob.weight,
                NumberOfHead: parseInt(resultMob.quantity || 0),
                InductionDate: resultMob.dateofmerge
            }
            if (updateEnclosureId)
                newObj.CurrentEnclosureId = uuidToBuffer(resultMob.enclosurename);

            newObj = Object.assign({}, resLivestockObj, livestockObj, newObj);
            newObj.Id = uuidToBuffer(livestockId);
            newObj.UUID = livestockId;
            newObj.AuditLogId = uuidToBuffer(livestockAuditId);
            newObj.ActivityStatusId = livestockActivityId;
            livestocks.push(newObj);

            let newAttrObj = Object.assign({}, resLivestockAttrObj, livestockAttrObj);
            newAttrObj.LivestockId = newObj.Id;
            newAttrObj.Id = uuidToBuffer(livestockAttrId);
            newAttrObj.UUID = livestockAttrId;
            livestocksAttr.push(newAttrObj);

            if (updateBreedCompositionData)
                breedCompositionBulk += BreedCompositionMapper(livestockId, resultMobAttr.breedComposition);

            let reference = `Merged from Mob: ` + selectedMobNames.join();
            // Livestock Event
            let livestockEventObj = LivestockEventMapper(newObj.Id, newObj.CurrentPropertyId,
                newObj.CurrentEnclosureId, newObj.NumberOfHead, eventTypes.MergeMob,
                newObj.InductionDate, newObj.DefaultGPS, reference);
            createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
            livestockEvents.push(livestockEventObj.LivestockEvent);

            // Enclosure history
            let livestockEnclosureHistory = LivestockEnclosureHistoryMapper(newObj.Id,
                newObj.CurrentPropertyId, newObj.CurrentEnclosureId, newObj.CurrentWeight, newObj.InductionDate,
                livestockEventObj.LivestockEvent.Id);
            enclosureHistories.push(livestockEnclosureHistory);

            // Property history
            let livestockPropertyHistory = LivestockPropertyHistoryMapper(newObj.Id, newObj.CurrentPropertyId,
                newObj.CurrentWeight, newObj.InductionDate, 0, livestockEventObj.LivestockEvent.Id);
            propertyHistories.push(livestockPropertyHistory);

            // Status history
            let livestockStatusHistory = LivestockStatusHistoryMapper(newObj.Id, newObj.CurrentPropertyId,
                newObj.ActivityStatusId, newObj.DefaultGPS, null, livestockEventObj.LivestockEvent.Id);
            statusHistories.push(livestockStatusHistory);

            // Weight history
            let livestockWeightHistory = LivestockWeightHistoryMapper(newObj.Id, newObj.CurrentPropertyId,
                newObj.CurrentEnclosureId, topPIC.PIC, newObj.CurrentWeight, newObj.InductionDate,
                livestockEventObj.LivestockEvent.Id);
            weightHistories.push(livestockWeightHistory);

            // Mob count history
            let mobCountHistory = MobCountHistoryMapper(newObj.Id, newObj.CurrentPropertyId,
                newObj.NumberOfHead, null, null, livestockEventObj.LivestockEvent.Id);
            mobCountHistories.push(mobCountHistory);

        }
        else if (updateBreedCompositionData) {
            breedCompositionBulk = `DELETE FROM breedcomposition WHERE LivestockId IN (`;
            livestockIds.forEach(function (ls) {
                breedCompositionBulk += `fn_UuidToBin('${ls}'),`;
            }, this);
            breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, ");");

            livestockIds.forEach(function (livestockId) {
                breedCompositionBulk += BreedCompositionMapper(livestockId, resultMobAttr.breedComposition);
            }, this);
        }

        // selected mob is not included for mob
        resLivestocks.map(obj => {
            if ((!newEntry && updateEnclosureId) ||
                (!newEntry && resultMobAttr.ActivityStatusId) ||
                !isIndividual) {
                let reference = `Merged to Mob: ${resultMobName}`;
                let enclosureId = !newEntry && updateEnclosureId ? uuidToBuffer(resultMob.enclosurename) :
                    obj.CurrentEnclosureId;
                // Livestock Event
                let livestockEventObj = LivestockEventMapper(obj.Id, obj.CurrentPropertyId,
                    enclosureId, obj.NumberOfHead, eventTypes.MergeMob, obj.InductionDate, obj.DefaultGPS,
                    reference);
                createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
                livestockEvents.push(livestockEventObj.LivestockEvent);

                // Enclosure history
                if (!newEntry && updateEnclosureId) {
                    let livestockEnclosureHistory = LivestockEnclosureHistoryMapper(obj.Id,
                        obj.CurrentPropertyId, uuidToBuffer(resultMob.enclosurename),
                        obj.CurrentWeight, obj.InductionDate, livestockEventObj.LivestockEvent.Id);
                    enclosureHistories.push(livestockEnclosureHistory);
                }

                if (!newEntry && resultMobAttr.ActivityStatusId) {
                    // Status history
                    let livestockStatusHistory = LivestockStatusHistoryMapper(obj.Id, obj.CurrentPropertyId,
                        resultMobAttr.ActivityStatusId, obj.DefaultGPS, null, livestockEventObj.LivestockEvent.Id);
                    statusHistories.push(livestockStatusHistory);
                }

                if (!isIndividual) {
                    // Mob count history
                    let mobCountHistory = MobCountHistoryMapper(obj.Id, obj.CurrentPropertyId,
                        (0 - obj.NumberOfHead), null, null, livestockEventObj.LivestockEvent.Id);
                    mobCountHistories.push(mobCountHistory);
                }
            }
        });

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                if (createAuditIds.length > 0)
                    return createAudit(createAuditIds, contactId, t);
                else return true;
            }).then(function () {
                return updateLivestock(updateLivestockObj, { UUID: livestockIds }, t);
            }).then(function () {
                // No need to update livestock attributes for Mob
                if (isIndividual)
                    return updateLivestockAttr(updateLivestockObj, { LivestockId: livestockBufferIds }, t);
                else return true;
            }).then(function () {
                if (updateSelectedMob)
                    return updateLivestock(updateSelectedLivestockObj, { UUID: selectedMobId }, t);
                else return true;
            }).then(function () {
                if (updateSelectedMob)
                    return updateLivestockAttr(updateSelectedLivestockObj, { LivestockId: uuidToBuffer(selectedMobId) }, t);
                else return true;
            }).then(function () {
                if (livestocks.length > 0)
                    return bulkCreateLivestock(livestocks, t);
                else return true;
            }).then(function () {
                if (updateBreedCompositionData) {
                    breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, "");
                    return bulkCreateBreedComposition(breedCompositionBulk, t);
                }
                else
                    return true;
            }).then(function () {
                if (livestocksAttr.length > 0)
                    return bulkCreateLivestockAttribute(livestocksAttr, t);
                else
                    return true;
            }).then(function () {
                if (livestockEvents.length > 0)
                    return bulkCreateLivestockEvent(livestockEvents, t);
                else return true;
            }).then(function () {
                if (propertyHistories.length > 0)
                    return bulkCreateLivestockPropertyHistory(propertyHistories, t);
                else return true;
            }).then(function () {
                if (weightHistories.length > 0)
                    return bulkCreateLivestockWeightHistory(weightHistories, t);
                else return true;
            }).then(function () {
                if (statusHistories.length > 0)
                    return bulkCreateLivestockStatusHistory(statusHistories, t);
                else return true;
            }).then(function () {
                if (enclosureHistories.length > 0)
                    return bulkCreateLivestockEnclosureHistory(enclosureHistories, t);
                else return true;
            }).then(function () {
                if (mobCountHistories.length > 0)
                    return bulkCreateMobCountHistory(mobCountHistories, t);
                else return true;
            }).catch(function (err) {
                throw new Error(err)
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    }).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

module.exports = { mergeMob: Promise.method(mergeMob) }