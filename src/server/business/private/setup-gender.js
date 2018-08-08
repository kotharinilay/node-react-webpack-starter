'use strict';

/***********************************
 * Logic related to setup gender api
 * *********************************/

import Promise from 'bluebird';
import {
    createGender, getGenderDataSet, getGenderCount,
    removeGender, getGenderById, updateGender, updateGenderLanguageData
} from '../../repository/gender';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (genderName, genderCode) => {
    if (!genderName) {
        return getResponse(400, 'VALIDATION.1022');
    }
    else if (!genderCode) {
        return getResponse(400, 'VALIDATION.1023');
    }
    else if (genderName.length > 50) {
        return getResponse(400, 'VALIDATION.1024');
    }
    else if (genderCode.length > 10) {
        return getResponse(400, 'VALIDATION.1025');
    }
    return null;
}

// creat new gender
let create = (genderName, genderCode, contactId) => {
    let response = serverValidations(genderName, genderCode);
    if (response != null)
        return response;

    return getGenderCount().then(function (count) {
        let systemCode = generateSystemCode(genderName, count);
        let genderId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }

        let genderObj = {
            Id: uuidToBuffer(genderId),
            UUID: genderId,
            SystemCode: systemCode,
            LocalizedData: [{
                GenderId: genderId,
                Language: 'en',
                GenderCode: genderCode,
                GenderName: genderName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createGender(genderObj, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update existing gender details
let update = (genderName, genderCode, contactId, genderId, auditId, language) => {
    let response = serverValidations(genderName, genderCode);
    if (response != null)
        return response;

    return getGenderById(genderId, language).then(function (res) {
        return res;
    }).then(function (detail) {
        let genderObj = {
            LocalizedData: [{
                GenderId: genderId,
                Language: 'en',
                GenderCode: genderCode,
                GenderName: genderName
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
            return updateAuditLog(auditObj, auditCondition, t).then(function (res) {
                return updateGenderLanguageData(genderObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch data with server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getGenderDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected genders
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let genderObj = {
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
        return updateAuditLog(auditObj, { Id: auditLogIds }, t).then(function (res) {
            return updateGender(genderObj, { UUID: uuids }, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get gender details by Id
let getDetail = (id, language) => {
    return getGenderById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getGenderDataSet: Promise.method(getDataSet),
    getGenderDetail: Promise.method(getDetail),
    createGender: Promise.method(create),
    updateGender: Promise.method(update),
    deleteGender: Promise.method(remove)
}