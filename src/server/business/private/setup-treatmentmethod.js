'use strict';

/***********************************
 * Logic related to setup Treatment Method api
 * *********************************/

import Promise from 'bluebird';
import {
    createTreatmentMethod, getTreatmentMethodDataSet, getTreatmentMethodCount,
    remove as removeTreatmentMethod, getTreatmentMethodById, updateTreatmentMethod, updateTreatmentMethodLanguageData,
    getTreatmentMethodSearch
} from '../../repository/treatmentmethod';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (methodName, methodCode) => {
    if (!methodName) {
        return getResponse(400, 'VALIDATION.1056');
    }
    else if (!methodCode) {
        return getResponse(400, 'VALIDATION.1057');
    }
    else if (methodName.length > 50) {
        return getResponse(400, 'VALIDATION.1058');
    }
    else if (methodCode.length > 10) {
        return getResponse(400, 'VALIDATION.1059');
    }
    return null;
}

// create new treatment method
let create = (methodName, methodCode, contactId, configuredByAdmin) => {
    let response = serverValidations(methodName, methodCode);

    if (response != null)
        return response;

    return getTreatmentMethodCount().then(function (count) {
        let systemCode = generateSystemCode(methodName, count);
        let methodId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }
        let treatmentMethodObj = {
            Id: uuidToBuffer(methodId),
            UUID: methodId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                TreatmentMethodId: methodId,
                Language: 'en',
                MethodCode: methodCode,
                MethodName: methodName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createTreatmentMethod(treatmentMethodObj, t);
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

// update treatment method details
let update = (methodName, methodCode, contactId, treatmentMethodId, auditId, language) => {
    let response = serverValidations(methodName, methodCode);

    if (response != null)
        return response;

    return getTreatmentMethodById(treatmentMethodId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let treatmentMethodCondition = { Id: uuidToBuffer(treatmentMethodId) };
        let treatmentMethodObj = {
            LocalizedData: [{
                TreatmentMethodId: treatmentMethodId,
                Language: 'en',
                MethodCode: methodCode,
                MethodName: methodName
            }]
        }
        let auditCondition = { Id: uuidToBuffer(auditId) };
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }
        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, auditCondition, t).then(function () {
                return updateTreatmentMethodLanguageData(treatmentMethodObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// get data with server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getTreatmentMethodDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected treatment methods
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let treatmentmethodObj = {
        IsDeleted: 1,
        LocalizedData: []
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
        return updateAuditLog(auditObj, { Id: auditLogIds }, t).then(function (res) {
            return updateTreatmentMethod(treatmentmethodObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get treatment method by Id
let getDetail = (id, language) => {
    return getTreatmentMethodById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// search treatment method for autocomplete binding
let getTreatmentMethodListSearch = (searchText, topPIC, language) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getTreatmentMethodSearch(searchText, CompanyId, RegionId, BusinessId, PropertyId, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

module.exports = {
    getTreatmentMethodDataSet: Promise.method(getDataSet),
    getTreatmentMethodDetail: Promise.method(getDetail),
    createTreatmentMethod: Promise.method(create),
    updateTreatmentMethod: Promise.method(update),
    deleteTreatmentMethod: Promise.method(remove),
    getTreatmentMethodListSearch: Promise.method(getTreatmentMethodListSearch)
}