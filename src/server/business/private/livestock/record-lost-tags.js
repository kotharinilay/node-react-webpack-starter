'use strict';

/************************************
 * record deceased for livestocks
 * **********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { HttpStatus, getResponse } from '../../../lib/index';

import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { updateLivestock, bulkCreateLivestockStatusHistory, bulkCreateLivestockEvent } from '../../../repository/livestock';
import { createAudit, updateAudit } from '../common';
import { LivestockEventMapper, LivestockStatusHistoryMapper } from '../../../schema/mapper';

import { uuidToBuffer } from '../../../../shared/uuid';

import { livestockActivityStatusCodes, eventTypes } from '../../../../shared/constants';

let recordLostTags = (contactId, language, recordLostValues) => {
    let lostLivestockStatus = null, statusHistoryBulk = [], livestockEventBulk = [], auditIds = [], updateAuditIds = [], livestockIds = [];
    return getAllActivityStatus({ Language: language, StatusCode: livestockActivityStatusCodes.Lost }).then(function (livestockStatus) {
        if (livestockStatus.length == 0) {
            throw new Error("Livestock Status - Lost not available");
        }
        lostLivestockStatus = livestockStatus[0];
        return;
    }).then(function () {
        recordLostValues.livestockIds.forEach(function (livestock) {
            livestockIds.push(livestock.livestockId);
            updateAuditIds.push(livestock.auditLogId);

            let reference = `LostReason: ${lostreason}`;
            let livestockEventObj = LivestockEventMapper(uuidToBuffer(livestock.livestockId),
                uuidToBuffer(recordLostValues.propertyId), null, 1, eventTypes.RecordLostTags,
                recordLostValues.lostdate, null, reference);
            auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
            livestockEventBulk.push(livestockEventObj.LivestockEvent);

            let livestockStatusHistoryObj = LivestockStatusHistoryMapper(uuidToBuffer(livestock.livestockId),
                uuidToBuffer(recordLostValues.propertyId), uuidToBuffer(lostLivestockStatus.Id),
                null, recordLostValues.lostreason, livestockEventObj.LivestockEvent.Id);
            statusHistoryBulk.push(livestockStatusHistoryObj);
        }, this);

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(auditIds, contactId, t);
            }).then(function () {
                return updateLivestock({ ActivityStatusId: uuidToBuffer(lostLivestockStatus.Id) }, { UUID: livestockIds }, t);
            }).then(function () {
                return bulkCreateLivestockEvent(livestockEventBulk, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(statusHistoryBulk, t);
            }).then(function () {
                return getResponse();
            }).catch(function (err) {
                return getResponse(HttpStatus.SERVER_ERROR, err.toString());
            });
        });
    });
}

module.exports = {
    recordLostTags: Promise.method(recordLostTags)
}