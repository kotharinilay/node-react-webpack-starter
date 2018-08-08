'use strict';

/**********************************************
 * record scan 
 * ********************************************/

import Promise from 'bluebird';
import { map as _map, isEmpty as _isEmpty } from 'lodash';
import models from '../../../schema';
import { LivestockEventMapper, LivestockWeightHistoryMapper } from '../../../schema/mapper';
import { uuidToBuffer, newUUID } from '../../../../shared/uuid';
import {
    createLivestockScan, bulkCreateLivestockScanDetail, bulkCreateLivestockWeightHistory,
    bulkCreateLivestockEvent, updateLivestock, updateLivestockAttr, getLivestockByCondition
} from '../../../repository/livestock';
import { eventTypes } from '../../../../shared/constants';
import { createAudit, updateAudit } from '../common';
import { HttpStatus, getResponse } from '../../../lib/index';

function recordScan(topPIC, contactId, eventGps, dataObj) {

    let scanResult = dataObj.ScanResult;
    let livestocks = dataObj.Livestocks;
    let livestockEvents = [], livestockScanDetail = [], createAuditIds = [], updateAuditIds = [],
        livestockAttrs = [], livestockIds = [], weightHistories = [], updateLivestocks = [];

    let auditLogId = newUUID(), scanId = newUUID();
    if (scanResult.ScanOnPropertyId) {
        scanResult.ScanOnPropertyId = uuidToBuffer(scanResult.ScanOnPropertyId);
    }
    if (scanResult.ScanPersonId) {
        scanResult.ScanPersonId = uuidToBuffer(scanResult.ScanPersonId);
    }
    if (scanResult.ScanCost == null) {
        scanResult.ScanCost = 0;
    }
    scanResult['Id'] = uuidToBuffer(scanId);
    scanResult['UUID'] = scanId;
    scanResult['AuditLogId'] = uuidToBuffer(auditLogId);
    createAuditIds.push(auditLogId);

    let livestockAttrObj = {
        Appraisal: scanResult.Appraisal,
        Lactation: scanResult.Lactation,
        ScanDate: scanResult.ScanDate,
        ConceptionMethodId: scanResult.ConceptionMethodId,
        ConditionScoreId: scanResult.ConditionScoreId,
        Disease: scanResult.Disease,
        PregnancyResult: scanResult.PregnancyResult,
        ExpPregnancyDate: scanResult.ExpPregnancyDate
    }

    let str = null;
    _map(livestocks, function (i) {
        if (str) { str = str + `,fn_UuidToBin('${i.Id}')`; }
        else { str = `fn_UuidToBin('${i.Id}')`; }
    });
    let binPropertyId = uuidToBuffer(topPIC.PropertyId);

    let select = `l.Id,l.AuditLogId, l.UUID, l.CurrentWeight, l.MaturityStatusId, 
la.Appraisal, la.Lactation, la.ScanDate, la.ConceptionMethodId,la.ConditionScoreId,
la.Disease,la.PregnancyResult,la.ExpPregnancyDate`;

    return getLivestockByCondition(` l.Id in (${str})`, ` left join livestockattribute la on la.LivestockId = l.Id `, select)
        .then(function (livestockData) {
            _map(livestockData, function (m) {

                let binLivestockId = uuidToBuffer(m.UUID);
                // create scan event
                let detailId = newUUID();
                let livestockEvent = LivestockEventMapper(binLivestockId, binPropertyId, null,
                    m.NumberOfHead, eventTypes.RecordScan, scanResult.ScanDate, eventGps,
                    `Service Provider: ${scanResult.ServiceProvider}`);
                createAuditIds.push(livestockEvent.LivestockEvent_AuditLogId);
                livestockEvents.push(livestockEvent.LivestockEvent);
                // create scan record
                livestockScanDetail.push({
                    Id: uuidToBuffer(detailId),
                    LivestockId: binLivestockId,
                    LivestockScanId: scanResult.Id,
                    LivestockEventId: livestockEvent.LivestockEvent.Id,
                    LivestockCount: m.NumberOfHead || 1,
                    UUID: detailId
                });

                updateAuditIds.push(m.AuditLogId);
                let livestockObj = {};
                // update weight and create history for it
                if (scanResult.Weight != null && parseFloat(scanResult.Weight) > 0 && scanResult.Weight != m.CurrentWeight) {
                    livestockObj.CurrentWeight = scanResult.Weight;

                    let weightHistoryMapper = LivestockWeightHistoryMapper(binLivestockId, binPropertyId,
                        null, topPIC.PIC, livestockObj.CurrentWeight, scanResult.ScanDate,
                        livestockEvent.LivestockEvent.Id);
                    weightHistories.push(weightHistoryMapper);
                }
                if (scanResult.MaturityId != null) {
                    livestockObj.MaturityStatusId = scanResult.MaturityId;
                }

                if (!_isEmpty(livestockObj)) {
                    updateLivestocks.push({ obj: livestockObj, Id: m.Id });
                }
                livestockIds.push(new Buffer(m.Id));
            });
        })
        .then(function () {

            return models.sequelize.transaction(function (t) {
                return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                    return createAudit(createAuditIds, contactId, t);
                })
                    .then(function () {
                        _map(updateLivestocks, function (m) {
                            var p = updateLivestock(m.obj, { LivestockId: new Buffer(m.Id.data) }, t);
                            livestockAttrs.push(p);
                        });
                        return Promise.all(livestockAttrs);
                    }).then(function () {
                        return updateLivestockAttr(livestockAttrObj, { LivestockId: livestockIds });
                    }).then(function () {
                        return bulkCreateLivestockEvent(livestockEvents, t);
                    }).then(function () {
                        return bulkCreateLivestockWeightHistory(weightHistories, t);
                    }).then(function () {
                        return createLivestockScan(scanResult, t);
                    }).then(function () {
                        return bulkCreateLivestockScanDetail(livestockScanDetail, t);
                    });
            });
        }).then(function () {
            return getResponse();
        })
        .catch(function (err) {
            return getResponse(500, err.toString())
        });
}

module.exports = {
    recordScan: Promise.method(recordScan)
}