'use strict';

/*****************************************
 * split single mob into multiple
 * **************************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { map as _map } from 'lodash';

import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import { HttpStatus, getResponse } from '../../../lib/index';
import {
    bulkCreateLivestock, bulkCreateLivestockAttribute, updateLivestock, getLivestockByCondition,
    bulkCreateLivestockEvent, bulkCreateLivestockPropertyHistory, bulkCreateLivestockWeightHistory,
    bulkCreateLivestockStatusHistory, bulkCreateLivestockEnclosureHistory,
    bulkCreateMobCountHistory
} from '../../../repository/livestock';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { getBreedComposition, bulkCreateBreedComposition } from '../../../repository/breedcomposition';
import {
    LivestockEnclosureHistoryMapper, LivestockPropertyHistoryMapper, LivestockStatusHistoryMapper,
    LivestockWeightHistoryMapper, MobCountHistoryMapper, BreedCompositionMapper, LivestockEventMapper
} from '../../../schema/mapper.js';
import { createAudit, updateAudit } from '../common';
import { livestockActivityStatusCodes, eventTypes } from '../../../../shared/constants';

// perform split mob into multiple mobs
let splitMob = (obj, language, contactId) => {
    let livestockActivityId = null;

    let createAuditIds = [];
    let updateAuditIds = [];

    let livestocks = [];
    let livestockAttributes = [];
    let breedCompositions = '';

    let livestockEvents = [];
    let propertyHistories = [];
    let statusHistories = [];
    let weightHistories = [];
    let enclosureHistories = [];
    let mobCountHistories = [];

    let livestock = null;
    let livestockAttribute = null;
    let breedComposition = null;

    let condition = `l.IsMob = 1 and l.UUID = '${obj.id}'`;
    let joins = `left join livestockattribute la on la.LivestockId = l.Id`;
    let columns = `l.*`;

    return getAllActivityStatus({ Language: language }).then(function (resStatus) {
        livestockActivityId = uuidToBuffer(resStatus.filter((status) => { return status.SystemCode == livestockActivityStatusCodes['Available']; })[0].Id);
        return getBreedComposition(obj.id);
    }).then(function (resBreedComposition) {
        breedComposition = resBreedComposition;
        breedComposition.map(obj => {
            obj.LivestockId = bufferToUUID(obj.LivestockId);
            obj.BreedId = bufferToUUID(obj.BreedId);
        });
        return getLivestockByCondition(condition, '', 'l.*');
    }).then(function (resLivestock) {

        livestock = resLivestock[0];
        if (livestock.AuditLogId) {
            updateAuditIds.push(livestock.AuditLogId);
        }

        // add history for old mob
        let referenceOldMob = `Split to Mob: ${_map(obj.data, 'Mob').join()}`;
        let livestockEventOldMobObj = LivestockEventMapper(uuidToBuffer(obj.selectedMob.Id), new Buffer(obj.selectedMob.CurrentPropertyId), uuidToBuffer(obj.selectedMob.CurrentEnclosureId),
            obj.selectedMob.NumberOfHead, eventTypes.SplitMob, obj.selectedMob.InductionDate, obj.selectedMob.DefaultGPS, referenceOldMob);
        let oldMobCountHistory = MobCountHistoryMapper(uuidToBuffer(obj.selectedMob.Id), new Buffer(obj.selectedMob.CurrentPropertyId),
            (0 - obj.selectedMob.NumberOfHead), null, null, livestockEventOldMobObj.LivestockEvent.Id);
        createAuditIds.push(livestockEventOldMobObj.LivestockEvent_AuditLogId);
        livestockEvents.push(livestockEventOldMobObj.LivestockEvent);
        mobCountHistories.push(oldMobCountHistory);

        obj.data.map(d => {
            let data = { ...livestock };
            let livestockId = newUUID();
            let livestockAuditId = newUUID();
            data.Mob = d.Mob;
            data.CurrentWeight = d.Weight;
            data.NumberOfHead = d.Quantity;
            data.DefaultGPS = obj.defaultGPS;
            data.InductionDate = obj.dateOfSplit;
            data.ActivityStatusId = livestockActivityId;
            data.UUID = livestockId;
            data.Id = uuidToBuffer(livestockId);
            data.AuditLogId = uuidToBuffer(livestockAuditId);
            data.CurrentPropertyId = data.CurrentPropertyId ? new Buffer(data.CurrentPropertyId) : null;
            data.SpeciesId = data.SpeciesId ? new Buffer(data.SpeciesId) : null;
            data.SpeciesTypeId = data.SpeciesTypeId ? new Buffer(data.SpeciesTypeId) : null;
            data.MaturityStatusId = data.MaturityStatusId ? new Buffer(data.MaturityStatusId) : null;
            data.GenderId = data.GenderId ? new Buffer(data.GenderId) : null;

            if (d.Enclosure)
                data.CurrentEnclosureId = uuidToBuffer(d.Enclosure);
            else
                data.CurrentEnclosureId = data.CurrentEnclosureId ? new Buffer(data.CurrentEnclosureId) : null;

            createAuditIds.push(livestockAuditId);
            livestocks.push(data);

            let reference = `Split from Mob: ${obj.selectedMob.Mob}`;
            let livestockEventObj = LivestockEventMapper(data.Id, data.CurrentPropertyId, data.CurrentEnclosureId,
                data.NumberOfHead, eventTypes.SplitMob, data.InductionDate, obj.defaultGPS, reference);

            let livestockPropertyHistory = LivestockPropertyHistoryMapper(data.Id, data.CurrentPropertyId,
                data.CurrentWeight, data.InductionDate, 0, livestockEventObj.LivestockEvent.Id);
            let livestockStatusHistory = LivestockStatusHistoryMapper(data.Id, data.CurrentPropertyId,
                data.ActivityStatusId, obj.defaultGPS, null, livestockEventObj.LivestockEvent.Id);
            let livestockWeightHistory = LivestockWeightHistoryMapper(data.Id, data.CurrentPropertyId,
                data.CurrentEnclosureId, obj.PIC, data.CurrentWeight, data.InductionDate,
                livestockEventObj.LivestockEvent.Id);
            let mobCountHistory = MobCountHistoryMapper(data.Id, data.CurrentPropertyId, data.NumberOfHead,
                null, null, livestockEventObj.LivestockEvent.Id);

            if (data.CurrentEnclosureId) {
                let livestockEnclosureHistory = LivestockEnclosureHistoryMapper(data.Id, data.CurrentPropertyId,
                    data.CurrentEnclosureId, data.CurrentWeight, data.InductionDate, livestockEventObj.LivestockEvent.Id);
                enclosureHistories.push(livestockEnclosureHistory);
            }

            createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

            // record all events
            livestockEvents.push(livestockEventObj.LivestockEvent);

            // push relative histories
            propertyHistories.push(livestockPropertyHistory);
            statusHistories.push(livestockStatusHistory);
            weightHistories.push(livestockWeightHistory);
            mobCountHistories.push(mobCountHistory);

            if (breedComposition.length > 0) {
                breedCompositions += BreedCompositionMapper(data.UUID, breedComposition);
            }
        });

        return getLivestockByCondition(condition, joins, 'la.*');
    }).then(function (resLivestockAttr) {

        livestockAttribute = resLivestockAttr[0];
        livestocks.map(d => {
            let data = { ...livestockAttribute };
            let livestockAttrId = newUUID();
            data.UUID = livestockAttrId;
            data.Id = uuidToBuffer(livestockAttrId);
            data.LivestockId = d.Id;
            data.IsHGP = livestockAttribute.IsHGP == null ? false : livestockAttribute.IsHGP;
            data.IsCastrated = livestockAttribute.IsCastrated == null ? false : livestockAttribute.IsCastrated;
            data.IsFreeMartin = livestockAttribute.IsFreeMartin == null ? false : livestockAttribute.IsFreeMartin;
            data.IsPPSR = livestockAttribute.IsPPSR == null ? false : livestockAttribute.IsPPSR;
            livestockAttributes.push(data);
        });

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(createAuditIds, contactId, t);
            }).then(function () {
                return updateLivestock({ NumberOfHead: 0, CurrentWeight: 0 }, { UUID: obj.id }, t);
            }).then(function () {
                return bulkCreateLivestock(livestocks, t);
            }).then(function () {
                if (breedComposition.length > 0) {
                    breedCompositions = breedCompositions.replace(/,\s*$/, "");
                    return bulkCreateBreedComposition(breedCompositions, t);
                }
            }).then(function () {
                livestockAttributes.map(obj => {
                    for (var key in obj) {
                        if (obj[key] && obj[key]['type'])
                            obj[key] = new Buffer(obj[key]);
                    }
                });
                return bulkCreateLivestockAttribute(livestockAttributes, t);
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEvents, t);
            }).then(function () {
                return bulkCreateLivestockPropertyHistory(propertyHistories, t);
            }).then(function () {
                return bulkCreateLivestockWeightHistory(weightHistories, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(statusHistories, t);
            }).then(function () {
                return bulkCreateLivestockEnclosureHistory(enclosureHistories, t);
            }).then(function () {
                return bulkCreateMobCountHistory(mobCountHistories, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = { splitMob: Promise.method(splitMob) }