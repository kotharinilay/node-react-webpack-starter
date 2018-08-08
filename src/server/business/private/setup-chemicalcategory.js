'use strict';

/***********************************
 * Chemical Category
 * *********************************/

import Promise from 'bluebird';
import {
    createChemicalCategory, getChemicalCategoryDataSet, getChemicalCategoryCount,
    removeChemicalCategory, getChemicalCategoryById, updateChemicalCategory, getChemicalCategoryBinding,
    updateChemicalCategoryLanguageData
} from '../../repository/chemicalcategory';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (chemicalCategoryName, chemicalCategoryCode) => {
    if (!chemicalCategoryName) {
        return getResponse(400, 'VALIDATION.1009');
    }
    else if (!chemicalCategoryCode) {
        return getResponse(400, 'VALIDATION.1010');
    }
    else if (chemicalCategoryName.length > 50) {
        return getResponse(400, 'VALIDATION.1011');
    }
    else if (chemicalCategoryCode.length > 10) {
        return getResponse(400, 'VALIDATION.1012');
    }
    return null;
}

// create new chemical category
let create = (chemicalCategoryName, chemicalCategoryCode, contactId) => {
    let response = serverValidations(chemicalCategoryName, chemicalCategoryCode);
    if (response != null)
        return response;

    return getChemicalCategoryCount().then(function (count) {
        let systemCode = generateSystemCode(chemicalCategoryName, count);
        let chemicalCategoryId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }

        let chemicalCategoryObj = {
            Id: uuidToBuffer(chemicalCategoryId),
            UUID: chemicalCategoryId,
            SystemCode: systemCode,
            LocalizedData: [{
                CategoryId: chemicalCategoryId,
                Language: 'en',
                ChemicalCategoryCode: chemicalCategoryCode,
                ChemicalCategoryName: chemicalCategoryName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createChemicalCategory(chemicalCategoryObj, t);
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

// update existing chemical category
let update = (chemicalCategoryName, chemicalCategoryCode, chemicalCategoryId, auditId, contactId, language) => {
    let response = serverValidations(chemicalCategoryName, chemicalCategoryCode);
    if (response != null)
        return response;

    let chemicalCategoryCondition = {
        Id: uuidToBuffer(chemicalCategoryId)
    }

    let chemicalCategoryObj = {
        LocalizedData: [{
            CategoryId: chemicalCategoryId,
            Language: 'en',
            ChemicalCategoryCode: chemicalCategoryCode,
            ChemicalCategoryName: chemicalCategoryName
        }]
    };
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
            return updateChemicalCategoryLanguageData(chemicalCategoryObj.LocalizedData, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch chemical category with server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getChemicalCategoryDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected chemical categories
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let chemicalCategoryObj = {
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
            return updateChemicalCategory(chemicalCategoryObj, { UUID: uuids }, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch chemical category by Id
let getDetail = (uuid, language) => {
    return getChemicalCategoryById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all active chemical categories
let getAll = (language) => {
    return getChemicalCategoryBinding(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getChemicalCategoryDataSet: Promise.method(getDataSet),
    getChemicalCategoryDetail: Promise.method(getDetail),
    getAllChemicalCategory: Promise.method(getAll),
    createChemicalCategory: Promise.method(create),
    updateChemicalCategory: Promise.method(update),
    deleteChemicalCategory: Promise.method(remove)
}