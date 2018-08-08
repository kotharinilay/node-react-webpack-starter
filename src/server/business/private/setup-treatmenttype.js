'use strict';

/***********************************
 * Logic related to setup Treatment Type api
 * *********************************/

import Promise from 'bluebird';
import {
    createTreatmentType, getTreatmentTypeDataSet, getTreatmentTypeCount,
    removeTreatmentType, getTreatmentTypeById, updateTreatmentType, updateTreatmentTypeLanguageData
} from '../../repository/treatmenttype';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// server validations
let serverValidations = (treatmentTypeName, treatmentTypeCode) => {
    if (!treatmentTypeName) {
        return getResponse(400, 'VALIDATION.1060');
    }
    else if (!treatmentTypeCode) {
        return getResponse(400, 'VALIDATION.1061');
    }
    else if (treatmentTypeName.length > 50) {
        return getResponse(400, 'VALIDATION.1062');
    }
    else if (treatmentTypeCode.length > 10) {
        return getResponse(400, 'VALIDATION.1063');
    }
    return null;
}

// create new treatment type
let create = (treatmentTypeName, treatmentTypeCode, contactId, configuredByAdmin) => {
    let response = serverValidations(treatmentTypeName, treatmentTypeCode);
    if (response != null)
        return response;

    return getTreatmentTypeCount().then(function (count) {
        let systemCode = generateSystemCode(treatmentTypeName, count);
        let treatmenttypeId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }

        let treatmentTypeObj = {
            Id: uuidToBuffer(treatmenttypeId),
            UUID: treatmenttypeId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                TreatmentTypeId: treatmenttypeId,
                Language: 'en',
                TypeCode: treatmentTypeCode,
                TypeName: treatmentTypeName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function () {
                return createTreatmentType(treatmentTypeObj, t);
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

// update existing treatment type
let update = (treatmentTypeName, treatmentTypeCode, contactId, treatmentTypeId, auditId, language) => {
    let response = serverValidations(treatmentTypeName, treatmentTypeCode);
    if (response != null)
        return response;

    return getTreatmentTypeById(treatmentTypeId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let treatmentTypeCondition = {
            Id: uuidToBuffer(treatmentTypeId)
        }
        let treatmentTypeObj = {
            LocalizedData: [{
                TreatmentTypeId: treatmentTypeId,
                Language: 'en',
                TypeCode: treatmentTypeCode,
                TypeName: treatmentTypeName
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
            return updateAuditLog(auditObj, auditCondition, t).then(function () {
                return updateTreatmentTypeLanguageData(treatmentTypeObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// get treatment type by server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getTreatmentTypeDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected treatment type 
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let treatmentTypeObj = {
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
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updateTreatmentType(treatmentTypeObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get treatment type by Id
let getDetail = (id, language) => {
    return getTreatmentTypeById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getTreatmentTypeDataSet: Promise.method(getDataSet),
    getTreatmentTypeDetail: Promise.method(getDetail),
    createTreatmentType: Promise.method(create),
    updateTreatmentType: Promise.method(update),
    deleteTreatmentType: Promise.method(remove)
}