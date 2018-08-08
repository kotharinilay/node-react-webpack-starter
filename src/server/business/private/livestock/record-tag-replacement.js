'use strict';

/************************************
 * record tag replacement for livestock
 * **********************************/

import Promise from 'bluebird';
import { tagStatusCodes, eventTypes } from '../../../../shared/constants';
import { HttpStatus, getResponse } from '../../../lib/index';
import { uuidToBuffer, bufferToUUID } from '../../../../shared/uuid/index';

import models from '../../../schema';
import { TagHistoryMapper, LivestockTagReplacementHistory, LivestockEventMapper } from '../../../schema/mapper';
import {
    getLivestockByCondition, bulkCreateLivestockEvent, updateLivestock, bulkCreateTagReplacementHistory
} from '../../../repository/livestock';
import { getTagStatus, updateTag, bulkCreateTagHistory } from '../../../repository/tag';
import { createAudit, updateAudit } from '../common';
import { replacedTags } from '../../../lib/nlis/index';
import { getPropertyByCondition } from '../../../repository/property';

// root function
function recordtagReplacement(contactId, language, obj) {
    let livestockId = obj.livestock.Id, currentLivestock;
    let activeTagStatus = null, pendingTagStatus = null;
    let updateTagObjs = [], updateTagConditions = [], createAuditIds = [], updateAuditIds = [],
        updateLivestockObj = {};
    let bulkTagHistory = [], bulkRaplceTagHistory = [], bulkLivestockEvents = [];
    let select = `l.Identifier,l.UUID ,l.AuditLogId,t.AuditLogId as TagAuditLogId,t.UUID as TagUUID`;
    let join = ` left join tag t on t.Id = l.CurrentTagId `;
    let where = ` l.UUID = '${livestockId}' `;
    return getLivestockByCondition(where, join, select).then(function (livestockRes) {
        if (livestockRes.length == 0) {
            throw new Error('No active livestock found.');
        }
        currentLivestock = livestockRes[0];
        return getTagStatus(language);
    }).then(function (tagStatusRes) {
        tagStatusRes.forEach(function (status) {
            if (status.SystemCode == tagStatusCodes.Active) activeTagStatus = status.Id;
            if (status.SystemCode == tagStatusCodes.Pending) pendingTagStatus = status.Id;
        }, this);
        updateAuditIds.push(bufferToUUID(currentLivestock.AuditLogId));
        // update livestock record
        updateLivestockObj[obj.identifier] = obj.identifierValue;
        updateLivestockObj[currentLivestock.Identifier] = null;
        updateLivestockObj.Identifier = obj.identifier;

        if (currentLivestock.TagAuditLogId) {
            updateAuditIds.push(bufferToUUID(currentLivestock.TagAuditLogId));
        }
        if (currentLivestock.TagUUID) {
            updateTagObjs.push({ CurrentLivestockId: null, CurrentStatusId: pendingTagStatus });
            updateTagConditions.push({ UUID: currentLivestock.TagUUID });
        }

        if (obj.tagAuditId) updateAuditIds.push(bufferToUUID(obj.tagAuditId));
        if (obj.tagId) {
            updateTagObjs.push({ CurrentLivestockId: uuidToBuffer(livestockId), CurrentStatusId: activeTagStatus });
            updateTagConditions.push({ UUID: obj.tagId });

            updateLivestockObj.CurrentTagId = uuidToBuffer(obj.tagId);

            // Livestock Event
            let livestockEvent = LivestockEventMapper(uuidToBuffer(livestockId), uuidToBuffer(obj.propertyId),
                null, 1, eventTypes.RecordTagReplacement, obj.replacedate, null, `Replace Reason: ${obj.replacereason}`);
            createAuditIds.push(livestockEvent.LivestockEvent_AuditLogId);
            bulkLivestockEvents.push(livestockEvent.LivestockEvent);

            // tag history and tag replacement history
            // while visualtag/societyid -> eid/nlisid OR eid/nlisid -> eid/nlisid
            let tagReplaceHistory = LivestockTagReplacementHistory(uuidToBuffer(livestockId), uuidToBuffer(obj.tagId),
                uuidToBuffer(obj.propertyId), obj.replacereason, livestockEvent.LivestockEvent.Id);
            bulkRaplceTagHistory.push(tagReplaceHistory);

            let tagHistory = TagHistoryMapper(obj.tagId, livestockId, obj.replacedate, obj.replacereason);
            createAuditIds.push(tagHistory.TagHistory_AuditLogId);
            bulkTagHistory.push(tagHistory.TagHistory);
        }
        else {
            updateLivestockObj.CurrentTagId = null;
        }
        if (obj.isNLISSubmit)
            return postToNlis(true, obj.propertyId, obj.replacedate, [livestockId]);
        else
            return false;
    }).then(function (res) {
        if (res && res.status == HttpStatus.BAD_REQUEST) {
            return res;
        }
        else
            return models.sequelize.transaction(function (t) {
                return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                    if (createAuditIds.length > 0)
                        return createAudit(createAuditIds, contactId, t);
                    else
                        return true;
                }).then(function () {
                    return updateLivestock(updateLivestockObj, { UUID: livestockId }, t);
                }).then(function () {
                    let tagUpdatePromise = [];
                    if (updateTagObjs.length > 0) {
                        updateTagObjs.forEach(function (element, i) {
                            tagUpdatePromise.push(updateTag(element, updateTagConditions[i], t));
                        }, this);
                        return Promise.all(tagUpdatePromise);
                    }
                    else return true;
                }).then(function () {
                    if (bulkLivestockEvents.length > 0)
                        return bulkCreateLivestockEvent(bulkLivestockEvents, t);
                    else
                        return true;
                }).then(function () {
                    if (bulkRaplceTagHistory.length > 0)
                        return bulkCreateTagReplacementHistory(bulkRaplceTagHistory, t);
                    else return true;
                }).then(function () {
                    if (bulkTagHistory.length > 0)
                        return bulkCreateTagHistory(bulkTagHistory, t);
                    else return true;
                });
            });
    }).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// retrieve nlisusername | password and post tags to nlis
function postToNlis(shouldPost, propertyId, replacementDate, livestocks) {

    if (shouldPost == false) {
        return true;
    }

    let property = null;
    return getPropertyByCondition(` p.Id = fn_UuidToBin('${propertyId}') `, '', `p.NLISUsername,p.NLISPassword`)
        .then(function (res) {
            property = res[0];
            if (property == null)
                throw new Error("Property does not exist");
            return replacedTags(property.NLISUsername, property.NLISPassword, replacementDate, livestocks);
        }).catch(function (err) {
            throw new Error(err);
        });
}

module.exports = {
    recordtagReplacement: Promise.method(recordtagReplacement)
}
