'use strict';

/***********************************
 * setup breed 
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';

import {
    createBreed, getBreedCount, getBreedDataSet, getBreedById, updateBreed,
    getBreedDetailDataset
} from '../../repository/breed';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (breedName, breedCode, speciesId) => {
    if (!breedName) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1000');
    }
    else if (!breedCode) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1001');
    }
    else if (!speciesId) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1002');
    }
    else if (breedName.length > 50) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1003');
    }
    else if (breedCode.length > 10) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1004');
    }
    return null;
}

// create a new breed
let create = (speciesId, breedTypeId, breedName, breedCode, contactId) => {
    let response = serverValidations(breedName, breedCode, speciesId);
    if (response != null)
        return response;

    return getBreedCount().then(function (count) {
        let systemCode = generateSystemCode(breedName, count);
        let breedId = newUUID();
        let auditId = newUUID();
        let audit = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }

        let breedObj = {
            Id: uuidToBuffer(breedId),
            UUID: breedId,
            SystemCode: systemCode,
            LocalizedData: [{
                BreedId: breedId,
                Language: 'en',
                BreedCode: breedCode,
                BreedName: breedName
            }],
            SpeciesId: uuidToBuffer(speciesId),
            BreedTypeId: breedTypeId ? uuidToBuffer(breedTypeId) : null,
            AuditLogId: audit.Id
        }

        return models.sequelize.transaction(function (t) {
            return createAuditLog(audit, t).then(function () {
                return createBreed(breedObj, t);
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

// fetch all breeds with server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getBreedDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    });
}

// get breed detail dataset
let getDetailDataset = (speciesId, breedTypeId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    return getBreedDetailDataset(speciesId, breedTypeId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// fetch breed by Id
let getDetail = (uuid, language) => {
    if (!uuid) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.mendatory);
    }
    return getBreedById(uuid, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update existing breed details
let update = (speciesId, breedTypeId, breedName, breedCode, uuid, auditLogId, contactId, language) => {
    let response = serverValidations(breedName, breedCode, speciesId)
    if (response != null)
        return response;
    return getBreedById(uuid,language).then(function (res) {
        return res;
    }).then(function (detail) {
        let breedObj = {
            SpeciesId: uuidToBuffer(speciesId),
            BreedTypeId: breedTypeId ? uuidToBuffer(breedTypeId) : null,
            LocalizedData: [{
                BreedId: uuid,
                Language: 'en',
                BreedCode: breedCode,
                BreedName: breedName
            }],
        }
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }

        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, { Id: new Buffer(auditLogId) }, t).then(function () {
                return updateBreed(breedObj, { UUID: uuid }, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// delete selected breeds
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }

    let breedObj = {
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
            return updateBreed(breedObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getBreedDataSet: Promise.method(getDataSet),
    getBreedDetail: Promise.method(getDetail),
    createBreed: Promise.method(create),
    updateBreed: Promise.method(update),
    deleteBreed: Promise.method(remove),
    getBreedDetailDataset: Promise.method(getDetailDataset)
}