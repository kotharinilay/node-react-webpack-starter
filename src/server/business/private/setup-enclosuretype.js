'use strict';

/***********************************
 * Enclosure Type
 * *********************************/

import Promise from 'bluebird';
import {
    createEnclosureType, getEnclosureTypeDataSet, getEnclosureTypeCount,
    removeEnclosureType, getEnclosureTypeById, updateEnclosureType, getAllEnclosureType, updateEnclosureTypeLanguageData,
    getEnclosureTypeBindings
} from '../../repository/enclosuretype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (enclosureTypeName, enclosureTypeCode) => {
    if (!enclosureTypeName) {
        return getResponse(400, 'VALIDATION.1018');
    }
    else if (!enclosureTypeCode) {
        return getResponse(400, 'VALIDATION.1019');
    }
    else if (enclosureTypeName.length > 50) {
        return getResponse(400, 'VALIDATION.1020');
    }
    else if (enclosureTypeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1021');
    }
    return null;
}

// create new enclosure type
let create = (enclosureTypeName, enclosureTypeCode, configuredByAdmin, contactId) => {
    let response = serverValidations(enclosureTypeName, enclosureTypeCode);
    if (response != null)
        return response;

    return getEnclosureTypeCount().then(function (count) {
        let systemCode = generateSystemCode(enclosureTypeName, count);
        let enclosureTypeId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }

        let enclosureTypeObj = {
            Id: uuidToBuffer(enclosureTypeId),
            UUID: enclosureTypeId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                EnclosureTypeId: enclosureTypeId,
                Language: 'en',
                EnclosureTypeCode: enclosureTypeCode,
                EnclosureTypeName: enclosureTypeName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createEnclosureType(enclosureTypeObj, t);
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

// update existing enclosure type
let update = (enclosureTypeName, enclosureTypeCode, enclosureTypeId, auditId, contactId, language) => {
    let response = serverValidations(enclosureTypeName, enclosureTypeCode);
    if (response != null)
        return response;

    return getEnclosureTypeById(enclosureTypeId, language).then(function (detail) {

        let enclosureTypeObj = {
            LocalizedData: [{
                EnclosureTypeId: enclosureTypeId,
                Language: 'en',
                EnclosureTypeCode: enclosureTypeCode,
                EnclosureTypeName: enclosureTypeName
            }]
        }

        let enclosureTypeCondition = {
            Id: uuidToBuffer(enclosureTypeId)
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
                return updateEnclosureTypeLanguageData(enclosureTypeObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });

}

// fetch enclosure types with server filtering/sorting/paging
let getDataSet = (language, pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj) => {
    return getEnclosureTypeDataSet(language, pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected enclosure types
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let enclosureTypeObj = {
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
            return updateEnclosureType(enclosureTypeObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get enclosure type by Id
let getDetail = (uuid, language) => {
    return getEnclosureTypeById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get enclosure type by Id
let getAll = (language) => {
    return getAllEnclosureType(language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

let getEnclosureTypes = (language, topPIC) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getEnclosureTypeBindings(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (response) {
        return response;
    }).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    getEnclosureTypeDataSet: Promise.method(getDataSet),
    getEnclosureTypeDetail: Promise.method(getDetail),
    createEnclosureType: Promise.method(create),
    updateEnclosureType: Promise.method(update),
    deleteEnclosureType: Promise.method(remove),
    getAllEnclosureType: Promise.method(getAll),
    getEnclosureTypeBindings: Promise.method(getEnclosureTypes)
}