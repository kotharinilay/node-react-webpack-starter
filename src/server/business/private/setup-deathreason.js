'use strict';

/***********************************
 * Death Reason
 * *********************************/

import Promise from 'bluebird';
import {
    createDeathReason, getDeathReasonDataSet, getDeathReasonCount,
    removeDeathReason, getDeathReasonById, updateDeathReason,
    updateDeathReasonLanguageData
} from '../../repository/deathreason';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (deathReasonName, deathReasonCode) => {
    if (!deathReasonName) {
        return getResponse(400, 'VALIDATION.1013');
    }
    else if (!deathReasonCode) {
        return getResponse(400, 'VALIDATION.1014');
    }
    else if (deathReasonName.length > 50) {
        return getResponse(400, 'VALIDATION.1015');
    }
    else if (deathReasonCode.length > 10) {
        return getResponse(400, 'VALIDATION.1016');
    }
    return null;
}

// create new death reason
let create = (deathReasonName, deathReasonCode, contactId, configuredByAdmin) => {
    let response = serverValidations(deathReasonName, deathReasonCode);
    if (response != null)
        return response;

    return getDeathReasonCount().then(function (count) {
        let systemCode = generateSystemCode(deathReasonName, count);
        let deathReasonId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }
        let deathReasonObj = {
            Id: uuidToBuffer(deathReasonId),
            UUID: deathReasonId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                DeathReasonId: deathReasonId,
                Language: 'en',
                DeathReasonCode: deathReasonCode,
                DeathReasonName: deathReasonName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }

        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createDeathReason(deathReasonObj, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (errCount) {
        return getResponse(500, errCount.toString());
    });
}

// update existing death reason
let update = (deathReasonName, deathReasonCode, contactId, deathReasonId, auditId, language) => {
    let response = serverValidations(deathReasonName, deathReasonCode);
    if (response != null)
        return response;
    return getDeathReasonById(deathReasonId, language).then(function (res) {
        return res;
    }).then(function (detail) {
        let deathReasonObj = {
            LocalizedData: [{
                DeathReasonId: deathReasonId,
                Language: 'en',
                DeathReasonCode: deathReasonCode,
                DeathReasonName: deathReasonName
            }]
        }
        let auditCondition = {
            Id: uuidToBuffer(auditId)
        }
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }
        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, auditCondition, t).then(function () {
                return updateDeathReasonLanguageData(deathReasonObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch death reason with server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getDeathReasonDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected death reasons
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let deathReasonObj = {
        IsDeleted: 1
    }
    let auditObj = {
        DeletedBy: uuidToBuffer(contactId),
        DeletedStamp: new Date(),
        DeletedFromSource: 'web'
    }
    auditLogIds = auditLogIds.map(function (r) {
        return uuidToBuffer(r);
    });
    return models.sequelize.transaction(function (t) {
        return updateAuditLog(auditObj, { Id: auditLogIds }, t).then(function () {
            return updateDeathReason(deathReasonObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch death reason by Id
let getDetail = (id, language) => {
    return getDeathReasonById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getDeathReasonDataSet: Promise.method(getDataSet),
    getDeathReasonDetail: Promise.method(getDetail),
    createDeathReason: Promise.method(create),
    updateDeathReason: Promise.method(update),
    deleteDeathReason: Promise.method(remove)
}