'use strict';

/***********************************
 * setup breed type
 * *********************************/

import Promise from 'bluebird';
import {
    createBreedType, getBreedTypeDataSet, getBreedTypeCount,
    removeBreedType, getBreedTypeById, updateBreedType, getBreedTypeBinding, checkBreedTypeReferenceExist,
    updateBreedTypeLanguageData
} from '../../repository/breedtype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (breedTypeName, breedTypeCode) => {
    if (!breedTypeName) {
        return getResponse(400, 'VALIDATION.1005');
    }
    else if (!breedTypeCode) {
        return getResponse(400, 'VALIDATION.1006');
    }
    else if (breedTypeName.length > 50) {
        return getResponse(400, 'VALIDATION.1007');
    }
    else if (breedTypeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1008');
    }
    return null;
}

// create new breed type
let create = (breedTypeName, breedTypeCode, contactId) => {
    let response = serverValidations(breedTypeName, breedTypeCode);
    if (response != null)
        return response;

    return getBreedTypeCount().then(function (count) {
        let systemCode = generateSystemCode(breedTypeName, count);
        let breedTypeId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }
        let breedTypeObj = {
            Id: uuidToBuffer(breedTypeId),
            UUID: breedTypeId,
            SystemCode: systemCode,
            AuditLogId: uuidToBuffer(auditId),
            LocalizedData: [{
                BreedTypeId: breedTypeId,
                Language: 'en',
                BreedTypeName: breedTypeName,
                BreedTypeCode: breedTypeCode
            }]
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createBreedType(breedTypeObj, t)
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

// existing breed type
let update = (breedTypeName, breedTypeCode, breedTypeId, auditId, contactId, language) => {
    let response = serverValidations(breedTypeName, breedTypeCode);
    if (response != null)
        return response;

    return getBreedTypeById(breedTypeId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let breedTypeCondition = {
            Id: uuidToBuffer(breedTypeId)
        }

        let auditCondition = {
            Id: uuidToBuffer(auditId)
        }
        let audit = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }
        let breedType = {
            LocalizedData: [{
                BreedTypeId: breedTypeId,
                Language: 'en',
                BreedTypeName: breedTypeName,
                BreedTypeCode: breedTypeCode
            }]
        };

        return models.sequelize.transaction(function (t) {
            return updateAuditLog(audit, auditCondition, t).then(function () {
                return updateBreedTypeLanguageData(breedType.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch breed types with server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getBreedTypeDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected breed types
let deleteTransaction = (contactId, auditLogIds, uuids, totalRecords) => {
    let breedTypeObj = {
        IsDeleted: 1,
        LocalizedData: []
    }
    let auditObj = {
        DeletedBy: uuidToBuffer(contactId),
        DeletedStamp: new Date(),
        DeletedFromSource: 'web'
    }
    auditLogIds = auditLogIds.map(function (r) {
        return new Buffer(r);
    });

    return models.sequelize.transaction(function (t) {
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updateBreedType(breedTypeObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse(200, null, { deletedCount: uuids.length, totalCount: totalRecords });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected breed types
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let totalCount = uuids.length;

    return checkBreedTypeReferenceExist(uuids).then(function (breedTypeRes) {
        return deleteTransaction(contactId, auditLogIds, breedTypeRes, totalCount);
    }).catch(function (speciesErr) {
        return getResponse(500, speciesErr.toString());
    });
}

// fetch breed type by Id
let getDetail = (uuid, language) => {
    return getBreedTypeById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all breed types 
let getAll = (language) => {
    return getBreedTypeBinding(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getBreedTypeDataSet: Promise.method(getDataSet),
    getBreedTypeDetail: Promise.method(getDetail),
    getAllBreedType: Promise.method(getAll),
    createBreedType: Promise.method(create),
    updateBreedType: Promise.method(update),
    deleteBreedType: Promise.method(remove)
}