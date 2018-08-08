'use strict';

/***********************************
 * Logic related to setup service type api
 * *********************************/

import Promise from 'bluebird';
import {
    createServiceType, getServiceTypeDataSet, getServiceTypeCount,
    removeServiceType, getServiceTypeById, updateServiceType,
    getServiceTypeBinding
} from '../../repository/servicetype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (serviceTypeName, serviceTypeCode) => {
    if (!serviceTypeName) {
        return getResponse(400, 'VALIDATION.1043');
    }
    else if (!serviceTypeCode) {
        return getResponse(400, 'VALIDATION.1044');
    }
    else if (serviceTypeName.length > 50) {
        return getResponse(400, 'VALIDATION.1045');
    }
    else if (serviceTypeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1046');
    }
    return null;
}

// create new service type
let create = (serviceTypeName, serviceTypeCode, contactId, colorCode, configuredByAdmin) => {
    let response = serverValidations(serviceTypeName, serviceTypeCode);
    if (response != null)
        return response;

    return getServiceTypeCount().then(function (count) {
        let systemCode = generateSystemCode(serviceTypeName, count);
        let serviceTypeId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }
        let serviceTypeObj = {
            Id: uuidToBuffer(serviceTypeId),
            UUID: serviceTypeId,
            SystemCode: systemCode,
            IsConfiguredByAdmin: configuredByAdmin,
            LocalizedData: [{
                ServiceTypeId: serviceTypeId,
                Language: 'en',
                ServiceTypeCode: serviceTypeCode,
                ServiceTypeName: serviceTypeName
            }],
            AuditLogId: uuidToBuffer(auditId),
            ColorCode: colorCode
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createServiceType(serviceTypeObj, t);
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

// update existing service type
let update = (serviceTypeName, serviceTypeCode, serviceTypeId, auditId, contactId, colorCode, language) => {
    let response = serverValidations(serviceTypeName, serviceTypeCode);
    if (response != null)
        return response;

    return getServiceTypeById(serviceTypeId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let serviceTypeCondition = {
            Id: uuidToBuffer(serviceTypeId)
        }

        let serviceTypeObj = {
            LocalizedData: [{
                ServiceTypeId: serviceTypeId,
                Language: 'en',
                ServiceTypeCode: serviceTypeCode,
                ServiceTypeName: serviceTypeName
            }],
            ColorCode: colorCode,
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
                return updateServiceType(serviceTypeObj, serviceTypeCondition, t);
            });
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch service type with server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getServiceTypeDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected service types
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let serviceTypeObj = {
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
        return updateAuditLog(auditObj, { Id: auditLogIds }, t).then(function () {
            return updateServiceType(serviceTypeObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get service type by Id
let getDetail = (uuid, language) => {
    return getServiceTypeById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all service types
let getAll = (language) => {
    return getServiceTypeBinding(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getServiceTypeDataSet: Promise.method(getDataSet),
    getServiceTypeDetail: Promise.method(getDetail),
    getAllServiceTypes: Promise.method(getAll),
    createServiceType: Promise.method(create),
    updateServiceType: Promise.method(update),
    deleteServiceType: Promise.method(remove)
}