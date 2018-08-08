
'use strict';

/*************************************
 * move to enclosure,
 * split mob,
 * merge mob
 * ************************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { forEach as _forEach } from 'lodash';
import { uuidToBuffer, newUUID } from '../../../../shared/uuid';
import { LivestockEnclosureHistoryMapper, LivestockEventMapper } from '../../../schema/mapper';
import { HttpStatus, getResponse, resMessages } from '../../../lib/index';
import { eventTypes } from '../../../../shared/constants';

import { createAudit } from '../common';
import { bulkCreateLivestockEvent, bulkCreateLivestockEnclosureHistory, updateLivestock } from '../../../repository/livestock';

// move livestocks to target enclosure
// and create history records
function moveToEnclosure(livestocks, currentPropertyId, targetEnclosureId, eventDate, eventGps, contactId) {
    let livestockEvents = [];
    let createAuditIds = [];
    let enclosureHistories = [];
    let livestockObj = {
        CurrentEnclosureId: uuidToBuffer(targetEnclosureId)
    };
    let livestockIds = [];

    // iterate over each livestock and create records set
    _forEach(livestocks, function (livestock, index) {
        let livestockEvent = LivestockEventMapper(uuidToBuffer(livestock.LivestockId), uuidToBuffer(currentPropertyId),
            uuidToBuffer(targetEnclosureId), livestock.NumberOfHead, eventTypes.MoveToEnclosure, eventDate,
            eventGps, null);
        let livestockEnclosureHistory = LivestockEnclosureHistoryMapper(uuidToBuffer(livestock.LivestockId), uuidToBuffer(currentPropertyId),
            uuidToBuffer(targetEnclosureId), null, eventDate, livestockEvent.LivestockEvent.Id);

        createAuditIds.push(livestockEvent.LivestockEvent_AuditLogId);

        livestockEvents.push(livestockEvent.LivestockEvent);
        enclosureHistories.push(livestockEnclosureHistory);
        livestockIds.push(livestock.livestockId)
    });

    // perform db operation
    return models.sequelize.transaction(function (t) {
        return createAudit(createAuditIds, contactId, t)
            .then(function () {
                return bulkCreateLivestockEvent(livestockEvents, t);
            }).then(function () {
                return bulkCreateLivestockEnclosureHistory(enclosureHistories, t);
            }).then(function () {
                return updateLivestock(livestockObj, { UUID: livestockIds }, t);
            });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    moveToEnclosure: Promise.method(moveToEnclosure)
}