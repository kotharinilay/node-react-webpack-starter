'use strict';

/***********************************
 * Logic related to setup unit of measure conversion api
 * *********************************/

import Promise from 'bluebird';
import {
    createUoMConversion, getUoMConversionDataSet,
    removeUoMConversion, getUoMConversionById, updateUoMConversion
} from '../../repository/uomconversion';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { isNumeric } from '../../../shared/format/string';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';

// perform server validations
let serverValidations = (fromUom, fromUomValue, toUom, toUomValue) => {
    
    if (!fromUom) {
        return getResponse(400, 'VALIDATION.1068');
    }
    else if (!fromUomValue) {
        return getResponse(400, 'VALIDATION.1069');
    }
    else if (!toUom) {
        return getResponse(400, 'VALIDATION.1070');
    }
    else if (!toUomValue) {
        return getResponse(400, 'VALIDATION.1071');
    }
    else if (!isNumeric(fromUomValue)) {
        return getResponse(400, 'VALIDATION.1072');
    }
    else if (!isNumeric(toUomValue)) {
        return getResponse(400, 'VALIDATION.1073');
    }
    return null;
}

// create new unit of measure
let create = (fromUom, fromUomValue, toUom, toUomValue, contactId) => {
    let response = serverValidations(fromUom, fromUomValue, toUom, toUomValue);
    if (response != null) {
        return response;
    }

    let uomConversionId = newUUID();
    let auditId = newUUID();

    let auditObj = {
        Id: uuidToBuffer(auditId),
        UUID: auditId,
        CreatedBy: uuidToBuffer(contactId),
        CreatedStamp: new Date(),
        CreatedFromSource: 'web'
    }
    let uomConversionObj = {
        Id: uuidToBuffer(uomConversionId),
        UUID: uomConversionId,
        FromUoMValue: fromUomValue,
        FromUoMId: uuidToBuffer(fromUom),
        ToUoMValue: toUomValue,
        ToUoMId: uuidToBuffer(toUom),
        AuditLogId: uuidToBuffer(auditId)
    }
    return models.sequelize.transaction(function (t) {
        return Promise.all([
            createAuditLog(auditObj, t),
            createUoMConversion(uomConversionObj, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update existing uom conversion details
let update = (fromUom, fromUomValue, toUom, toUomValue, contactId, uomConversionId, auditId) => {
    let response = serverValidations(fromUom, fromUomValue, toUom, toUomValue);
    if (response != null) {
        return response;
    }

    let uomConversionCondition = {
        Id: uuidToBuffer(uomConversionId)
    }
    let uomConversionObj = {
        FromUoMValue: fromUomValue,
        FromUoMId: uuidToBuffer(fromUom),
        ToUoMValue: toUomValue,
        ToUoMId: uuidToBuffer(toUom),
    }
    let auditCondition = {
        Id: new Buffer(auditId.data)
    }
    let auditObj = {
        ModifiedBy: uuidToBuffer(contactId),
        ModifiedStamp: new Date(),
        ModifiedFromSource: 'web'
    }
    return models.sequelize.transaction(function (t) {
        return Promise.all([
            updateAuditLog(auditObj, auditCondition, t),
            updateUoMConversion(uomConversionObj, uomConversionCondition, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get by server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getUoMConversionDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected unit of measures
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }
    let uomConversionObj = {
        IsDeleted: 1
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
            updateUoMConversion(uomConversionObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get uom conversion by Id
let getDetail = (id) => {
    return getUoMConversionById(id).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getUoMConversionDataSet: Promise.method(getDataSet),
    getUoMConversionDetail: Promise.method(getDetail),
    createUoMConversion: Promise.method(create),
    updateUoMConversion: Promise.method(update),
    deleteUoMConversion: Promise.method(remove)
}