'use strict';

/***********************************
 * Logic related to setup maturity api
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';

import {
    createMaturity, getMaturityCount, getMaturityDataSet, getMaturityById, updateMaturity,
    getMaturityDetailDataset
} from '../../repository/maturity';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (maturityName, maturityCode, speciesId) => {
    if (!maturityName) {
        return getResponse(400, 'VALIDATION.1034');
    }
    else if (!maturityCode) {
        return getResponse(400, 'VALIDATION.1035');
    }
    else if (maturityName.length > 50) {
        return getResponse(400, 'VALIDATION.1036');
    }
    else if (maturityCode.length > 10) {
        return getResponse(400, 'VALIDATION.1037');
    }
    else if (!speciesId) {
        return getResponse(400, 'VALIDATION.1038');
    }
    return null;
}

// create new maturity
let create = (speciesId, maturityName, maturityCode, contactId) => {
    let response = serverValidations(maturityName, maturityCode, speciesId);
    if (response != null)
        return response;

    return getMaturityCount().then(function (count) {
        let systemCode = generateSystemCode(maturityName, count);
        let maturityId = newUUID();
        let auditId = newUUID();
        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }
        let maturityObj = {
            Id: uuidToBuffer(maturityId),
            UUID: maturityId,
            SystemCode: systemCode,
            LocalizedData: [{
                MaturityId: maturityId,
                Language: 'en',
                MaturityCode: maturityCode,
                MaturityName: maturityName
            }],
            SpeciesId: uuidToBuffer(speciesId),
            AuditLogId: auditObj.Id
        }

        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createMaturity(maturityObj, t);
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

// fetch maturity with server paging/sorting/filtering
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getMaturityDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    });
}

// get maturity detail dataset
let getDetailDataset = (speciesId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    return getMaturityDetailDataset(speciesId, language, pageSize, skipRec, sortOrder, sortColumn).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get maturity by Id
let getDetail = (uuid, language) => {
    if (!uuid) {
        return getResponse(400, resMessages.mendatory);
    }
    return getMaturityById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update existing maturity details
let update = (speciesId, maturityName, maturityCode, uuid, auditLogId, contactId, language) => {
    let response = serverValidations(maturityName, maturityCode, speciesId);
    if (response != null)
        return response;

    return getMaturityById(uuid, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let maturityObj = {
            SpeciesId: uuidToBuffer(speciesId),
            LocalizedData: [{
                MaturityId: uuid,
                Language: 'en',
                MaturityCode: maturityCode,
                MaturityName: maturityName
            }],
        }
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }
        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, { Id: uuidToBuffer(auditLogId) }, t).then(function () {
                return updateMaturity(maturityObj, { UUID: uuid }, t)
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// delete selected maturities
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }
    let maturityObj = {
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
            return updateMaturity(maturityObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });

}

module.exports = {
    createMaturity: Promise.method(create),
    getMaturityDataSet: Promise.method(getDataSet),
    getMaturityDetail: Promise.method(getDetail),
    updateMaturity: Promise.method(update),
    deleteMaturity: Promise.method(remove),
    getMaturityDetailDataset: Promise.method(getDetailDataset)
}