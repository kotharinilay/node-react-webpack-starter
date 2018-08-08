'use strict';

/***********************************
 * Logic related to setup property type api
 * *********************************/

import Promise from 'bluebird';
import {
    createPropertyType, getPropertyTypeDataSet, getPropertyTypeCount, getPropertyTypeBindings,
    removePropertyType, getPropertyTypeById, updatePropertyType, updatePropertyTypeLanguageData
} from '../../repository/propertytype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (typeName, typeCode) => {
    if (!typeName) {
        return getResponse(400, 'VALIDATION.1039');
    }
    else if (!typeCode) {
        return getResponse(400, 'VALIDATION.1040');
    }
    else if (typeName.length > 50) {
        return getResponse(400, 'VALIDATION.1041');
    }
    else if (typeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1042');
    }
    return null;
}

// create new property type
let create = (typeName, typeCode, contactId, colorCode) => {
    let response = serverValidations(typeName, typeCode);
    if (response != null)
        return response;

    return getPropertyTypeCount().then(function (count) {
        let systemCode = generateSystemCode(typeName, count);
        let propertyTypeId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }
        let propertyTypeObj = {
            Id: uuidToBuffer(propertyTypeId),
            UUID: propertyTypeId,
            SystemCode: systemCode,
            ColorCode: colorCode ? JSON.stringify(colorCode) : null,
            LocalizedData: [{
                PropertyTypeId: propertyTypeId,
                Language: 'en',
                PropertyTypeCode: typeCode,
                PropertyTypeName: typeName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createPropertyType(propertyTypeObj, t);
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

// update existing property type details
let update = (typeName, typeCode, contactId, propertyTypeId, auditId, colorCode, language) => {
    let response = serverValidations(typeName, typeCode);
    if (response != null)
        return response;

    return getPropertyTypeById(propertyTypeId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let propertyTypeCondition = {
            Id: uuidToBuffer(propertyTypeId)
        }

        let propertyTypeObj = {
            LocalizedData: [{
                PropertyTypeId: propertyTypeId,
                Language: 'en',
                PropertyTypeCode: typeCode,
                PropertyTypeName: typeName
            }],
            ColorCode: colorCode ? JSON.stringify(colorCode) : null,
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
            return updateAuditLog(auditObj, auditCondition, t).then(function (res) {
                return updatePropertyType(propertyTypeObj, propertyTypeCondition, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch property types by server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getPropertyTypeDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected property types
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let propertyTypeObj = {
        IsDeleted: 1,
        LocalizedData: []
    };
    let auditObj = {
        DeletedBy: uuidToBuffer(contactId),
        DeletedStamp: new Date(),
        DeletedFromSource: 'web'
    };
    auditLogIds = auditLogIds.map(function (r) {
        return uuidToBuffer(r);
    });

    return models.sequelize.transaction(function (t) {
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updatePropertyType(propertyTypeObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get property type by Id
let getDetail = (id, language) => {
    return getPropertyTypeById(id, language).then(function (response) {
        response.ColorCode = response.ColorCode ? JSON.parse(response.ColorCode) : null;
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

let getAll = (language) => {
    return getPropertyTypeBindings(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getPropertyTypeDataSet: Promise.method(getDataSet),
    getPropertyTypeDetail: Promise.method(getDetail),
    getAllPropertyTypes: Promise.method(getAll),
    createPropertyType: Promise.method(create),
    updatePropertyType: Promise.method(update),
    deletePropertyType: Promise.method(remove)
}