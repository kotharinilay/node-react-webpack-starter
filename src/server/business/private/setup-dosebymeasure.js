'use strict';

/***********************************
 * Unit Of Measure
 * *********************************/

import Promise from 'bluebird';
import { createDoseByMeasure, getDoseByMeasureAll, removeDoseByMeasure } from '../../repository/dosebymeasure';
import { bulkCreateAuditLog, removeAuditLog } from '../../repository/auditlog';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';

// create new unit of measure
let create = (uuids, configuredByAdmin, contactId) => {
    if (uuids.length == 0) {
        return getResponse(400, 'VALIDATION.1017');
    }
    let doses = [];
    let auditLogs = [];

    return getDoseByMeasureAll(configuredByAdmin).then(function (res) {
        let deleteUUID = [];
        let deleteAuditId = [];
        if (res.response) {
            res.response.data.map((item) => {
                deleteUUID.push(item.UUID);
                deleteAuditId.push(new Buffer(item.AuditLogId));
            });
        }

        uuids.map((uuid) => {
            let doseByMeasureId = newUUID();
            let auditId = newUUID();

            let auditObj = {
                Id: uuidToBuffer(auditId),
                UUID: auditId,
                CreatedBy: uuidToBuffer(contactId),
                CreatedStamp: new Date(),
                CreatedFromSource: 'web'
            }

            let doseByMeasureObj = {
                Id: uuidToBuffer(doseByMeasureId),
                UUID: doseByMeasureId,
                IsConfiguredByAdmin: configuredByAdmin,
                UoMId: uuidToBuffer(uuid),
                AuditLogId: uuidToBuffer(auditId)
            }
            doses.push(doseByMeasureObj);
            auditLogs.push(auditObj);
        });
        return models.sequelize.transaction(function (t) {
            return Promise.all([
                removeDoseByMeasure({ UUID: deleteUUID }, t),
                removeAuditLog({ Id: deleteAuditId }, t),
                bulkCreateAuditLog(auditLogs, t),
                createDoseByMeasure(doses, t)
            ]);
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get dose by measures
let getDetail = (configuredByAdmin) => {
    return getDoseByMeasureAll(configuredByAdmin).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    createDoseByMeasure: Promise.method(create),
    getDoseByMeasureAll: Promise.method(getDetail)
}