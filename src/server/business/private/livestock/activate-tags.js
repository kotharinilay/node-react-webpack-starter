'use strict';

/***********************************
 * activate tag action for multiple livestock
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';

import { HttpStatus, getResponse } from '../../../lib/index';
import { uuidToBuffer, newUUID } from '../../../../shared/uuid';

import {
    LivestockMapper, LivestockAttributeMapper, LivestockEventMapper, LivestockEnclosureHistoryMapper,
    BreedCompositionMapper, LivestockPropertyHistoryMapper, LivestockStatusHistoryMapper, LivestockWeightHistoryMapper,
    TagHistoryMapper
} from '../../../schema/mapper';
import {
    bulkCreateLivestock, bulkCreateLivestockAttribute, bulkCreateLivestockPropertyHistory,
    bulkCreateLivestockWeightHistory, bulkCreateLivestockStatusHistory,
    bulkCreateLivestockEnclosureHistory, bulkCreateLivestockEvent
} from '../../../repository/livestock';
import { bulkCreateBreedComposition } from '../../../repository/breedcomposition';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { getTagStatus, updateTag, bulkCreateTagHistory } from '../../../repository/tag';
import { getEnclosureTypeById } from '../../../repository/enclosuretype';
import { createAudit, updateAudit } from '../common';
import { livestockActivityStatusCodes, tagStatusCodes, eventTypes } from '../../../../shared/constants';

let activateTags = (inductionObj, language, contactId) => {
    let livestockObj = LivestockMapper(inductionObj);
    let livestockAttrObj = LivestockAttributeMapper(inductionObj);

    let tagObjArr = [];
    let tagObjConditionArr = [];
    let activeTagStatus;
    let auditIds = [];
    let updateAuditIds = [];
    let tagIds = [];
    let livestockBulk = [];
    let breedCompositionBulk = '';
    let livestockAttrBulk = [];
    let tagHistoryBulk = [];
    let livestockEventBulk = [];
    let propertyHistoryBulk = [];
    let weightHistoryBulk = [];
    let statusHistoryBulk = [];
    let enclosureHistoryBulk = [];
    let livestockActivityId = null;

    return getTagStatus(language).then(function (res) {
        activeTagStatus = res.filter((status) => {
            return status.SystemCode == tagStatusCodes['Active'];
        })[0].Id;
        // tagObj.CurrentLivestockId = 
        return getAllActivityStatus({ Language: language });
    }).then(function (res) {
        livestockActivityId = res.filter((status) => {
            return status.SystemCode == livestockActivityStatusCodes['Available'];
        })[0].Id;
        livestockObj.ActivityStatusId = uuidToBuffer(livestockActivityId);
        livestockObj.Identifier = 'EID';

        if (inductionObj.enclosurename)
            return getEnclosureTypeById(inductionObj.enclosurename, language);
        else
            return false;
    }).then(function (res) {
        let enclosureCode = null;
        if (res) {
            enclosureCode = res[0].SystemCode;
        }
        inductionObj.selectedTags.tags.forEach(function (tag, i) {
            // tagIds.push(tag.TagId);
            tag.AuditLogId ? updateAuditIds.push(tag.AuditLogId) : null;
            let livestockId = newUUID();
            let livestockAuditId = newUUID();
            let livestockTagObj = Object.assign({}, livestockObj);
            livestockTagObj.Id = uuidToBuffer(livestockId);
            livestockTagObj.UUID = livestockId;
            livestockTagObj.AuditLogId = uuidToBuffer(livestockAuditId);
            livestockTagObj.EID = tag.EID;
            livestockTagObj.VisualTag = tag.VisualTag;
            livestockTagObj.NLISID = tag.NLISID;
            livestockTagObj.CurrentTagId = uuidToBuffer(tag.TagId);

            livestockBulk.push(livestockTagObj);
            auditIds.push(livestockAuditId);

            tagObjArr.push({ CurrentLivestockId: uuidToBuffer(livestockId), CurrentStatusId: activeTagStatus });
            tagObjConditionArr.push({ UUID: tag.TagId });

            breedCompositionBulk += BreedCompositionMapper(livestockId, inductionObj.breedComposition);
            // breedCompositionBulk += ',';

            let livestockAttrTagObj = Object.assign({}, livestockAttrObj);
            let livestockAttrId = newUUID();
            livestockAttrTagObj.Id = uuidToBuffer(livestockAttrId);
            livestockAttrTagObj.UUID = livestockAttrId;
            livestockAttrTagObj.LivestockId = uuidToBuffer(livestockId);
            livestockAttrBulk.push(livestockAttrTagObj);

            let tagHistoryObj = TagHistoryMapper(tag.TagId, livestockId)
            tagHistoryBulk.push(tagHistoryObj.TagHistory);
            auditIds.push(tagHistoryObj.TagHistory_AuditLogId);

            // Livestock Event
            let reference = `Status: ${livestockActivityStatusCodes.Available}`;
            let livestockEventObj = LivestockEventMapper(uuidToBuffer(livestockId), uuidToBuffer(inductionObj.topPIC.PropertyId),
                inductionObj.enclosurename ? uuidToBuffer(inductionObj.enclosurename) : null, inductionObj.livestockquantity,
                eventTypes.Activated, new Date(), inductionObj.inductionGPS, reference);

            auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

            // Property History
            let livestockPropHistoryObj = LivestockPropertyHistoryMapper(uuidToBuffer(livestockId),
                uuidToBuffer(inductionObj.topPIC.PropertyId), inductionObj.livestockweight, new Date(),
                null, livestockEventObj.LivestockEvent.Id)
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
                    inductionObj.topPIC.PIC, inductionObj.livestockweight, new Date(), livestockEventObj.LivestockEvent.Id);
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
            livestockEventObj.LivestockEvent.Reference = reference;
            livestockEventBulk.push(livestockEventObj.LivestockEvent);
        }, this);

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(auditIds, contactId, t);
            }).then(function () {
                return bulkCreateLivestock(livestockBulk, t);
            }).then(function () {
                breedCompositionBulk = breedCompositionBulk.replace(/,\s*$/, "");
                return bulkCreateBreedComposition(breedCompositionBulk, t);
            }).then(function () {
                return bulkCreateLivestockAttribute(livestockAttrBulk, t);
            }).then(function () {
                let tagUpdatePromise = [];
                tagObjArr.forEach(function (element, i) {
                    tagUpdatePromise.push(updateTag(element, tagObjConditionArr[i], t));
                }, this);
                return Promise.all(tagUpdatePromise);
            }).then(function () {
                return bulkCreateTagHistory(tagHistoryBulk, t);
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
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}


module.exports = {
    activateTags: Promise.method(activateTags)
}