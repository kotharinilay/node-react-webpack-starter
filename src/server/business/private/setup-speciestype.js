'use strict';

/***********************************
 * Logic related to setup species type api
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';

import {
    createSpeciesType, getSpeciesTypeCount, getSpeciesTypeDataSet, getSpeciesTypeById, updateSpeciesType,
    getSpeciesTypeDetailDataset
} from '../../repository/speciestype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (speciesTypeName, speciesTypeCode, speciesId) => {
    if (!speciesTypeName) {
        return getResponse(400, 'VALIDATION.1051');
    }
    else if (!speciesTypeCode) {
        return getResponse(400, 'VALIDATION.1052');
    }
    else if (speciesTypeName.length > 50) {
        return getResponse(400, 'VALIDATION.1053');
    }
    else if (speciesTypeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1054');
    }
    else if (!speciesId) {
        return getResponse(400, 'VALIDATION.1055');
    }
    return null;
}

// create new species type
let create = (speciesId, speciesTypeName, speciesTypeCode, contactId, configuredByAdmin) => {
    let response = serverValidations(speciesTypeName, speciesTypeCode, speciesId);
    if (response != null)
        return response;

    return getSpeciesTypeCount().then(function (count) {

        let systemCode = generateSystemCode(speciesTypeName, count);
        let speciesTypeId = newUUID();
        let auditId = newUUID();
        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        };
        let jsonObj = {
            en: { SpeciesTypeName: speciesTypeName, SpeciesTypeCode: speciesTypeCode }
        }
        let speciesTypeObj = {
            Id: uuidToBuffer(speciesTypeId),
            UUID: speciesTypeId,
            SystemCode: systemCode,
            IsConfiguredByAdmin: configuredByAdmin,
            SpeciesId: uuidToBuffer(speciesId),
            AuditLogId: uuidToBuffer(auditId),
            LocalizedData: [{
                SpeciesTypeId: speciesTypeId,
                Language: 'en',
                SpeciesTypeName: speciesTypeName,
                SpeciesTypeCode: speciesTypeCode
            }]
        };

        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createSpeciesType(speciesTypeObj, t);
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

// get species type with server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getSpeciesTypeDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    });
}

// get species type detail dataset
let getDetailDataset = (speciesId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    return getSpeciesTypeDetailDataset(speciesId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get species type by Id
let getDetail = (uuid, language) => {
    if (!uuid) {
        return getResponse(400, resMessages.mendatory);
    }

    return getSpeciesTypeById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update species type details
let update = (speciesId, speciesTypeName, speciesTypeCode, uuid, auditLogId, contactId, language) => {
    let response = serverValidations(speciesTypeName, speciesTypeCode, speciesId);
    if (response != null)
        return response;

    return getSpeciesTypeById(uuid, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let speciesTypeObj = {
            SpeciesId: uuidToBuffer(speciesId),
            LocalizedData: [{
                SpeciesTypeId: uuid,
                Language: 'en',
                SpeciesTypeName: speciesTypeName,
                SpeciesTypeCode: speciesTypeCode
            }],
        };
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        };

        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, { Id: new Buffer(auditLogId) }, t).then(function () {
                return updateSpeciesType(speciesTypeObj, { UUID: uuid }, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// delete selected species type
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let speciesTypeObj = {
        IsDeleted: 1
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
            updateSpeciesType(speciesTypeObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getSpeciesTypeDataSet: Promise.method(getDataSet),
    getSpeciesTypeDetail: Promise.method(getDetail),
    createSpeciesType: Promise.method(create),
    updateSpeciesType: Promise.method(update),
    deleteSpeciesType: Promise.method(remove),
    getSpeciesTypeDetailDataset: Promise.method(getDetailDataset)
}