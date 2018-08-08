'use strict';

/***********************************
 * Logic related to setup unit of measure api
 * *********************************/

import Promise from 'bluebird';
import { map } from 'lodash';
import {
    createUoM, getUoMDataSet, getUoMCount,
    getUoMById, updateUoM, getUoMBinding, checkUoMReferenceExist,
    updateUoMLanguageData
} from '../../repository/uom';
import { bulkCreateUnitByMeasure, getUoMByMeasure, removeUnitByMeasure } from '../../repository/uombymeasure';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { getUoMTypes } from '../../repository/uomtype';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (uomName, uomCode, uomTypes) => {
    if (!uomName) {
        return getResponse(400, 'VALIDATION.1064');
    }
    else if (!uomCode) {
        return getResponse(400, 'VALIDATION.1065');
    }
    else if (uomName.length > 50) {
        return getResponse(400, 'VALIDATION.1066');
    }
    else if (uomCode.length > 10) {
        return getResponse(400, 'VALIDATION.1067');
    }
    else if (uomTypes.length < 1) {
        return getResponse(400, 'VALIDATION.1078');
    }
    return null;
}

// create new unit of measure
let create = (uomName, uomCode, uomTypes, contactId) => {
    let response = serverValidations(uomName, uomCode, uomTypes);
    if (response != null) {
        return response;
    }

    return getUoMCount().then(function (count) {
        let uomId = newUUID();
        let auditId = newUUID();
        let systemCode = generateSystemCode(uomName, count);

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        }
        let uomObj = {
            Id: uuidToBuffer(uomId),
            UUID: uomId,
            SystemCode: systemCode,
            LocalizedData: [{
                UoMId: uomId,
                Language: 'en',
                UoMCode: uomCode,
                UoMName: uomName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }

        let uomByMeasure = getUomTypesList(uomTypes, uomObj.Id);

        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (auditRes) {
                return createUoM(uomObj, t);
            }).then(function (uomRes) {
                return bulkCreateUnitByMeasure(uomByMeasure, t);
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

// update existing unit of measures
let update = (uomName, uomCode, uomTypes, contactId, uomId, auditId, language) => {
    let response = serverValidations(uomName, uomCode, uomTypes);
    if (response != null) {
        return response;
    }

    return getUoMById(uomId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let uomCondition = {
            Id: uuidToBuffer(uomId)
        }
        let uomObj = {
            LocalizedData: [{
                UoMId: uomId,
                Language: 'en',
                UoMCode: uomCode,
                UoMName: uomName
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
        let uomByMeasure = getUomTypesList(uomTypes, uomCondition.Id);
        let uomByMeasureCondition = {
            UoMId: uomCondition.Id
        }

        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, auditCondition, t).then(function (auditRes) {
                return updateUoMLanguageData(uomObj.LocalizedData, t);
            }).then(function (uomRes) {
                return removeUnitByMeasure(uomByMeasureCondition, t);
            }).then(function (uomByMeasureRes) {
                return bulkCreateUnitByMeasure(uomByMeasure, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// get array of uom types Id
let getUomTypesList = (uomTypes, uomBufferId) => {
    let uomByMeasure = [];
    map(uomTypes, (d, index) => {
        let id = newUUID();
        uomByMeasure.push({
            Id: uuidToBuffer(id),
            UoMId: uomBufferId,
            UoMTypeId: uuidToBuffer(d),
            UUID: id
        });
    });
    return uomByMeasure;
}

// get data by server filtering/paging/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getUoMDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
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
    let totalCount = uuids.length;
    return checkUoMReferenceExist(uuids).then(function (uomRes) {
        return deleteTransaction(contactId, auditLogIds, uomRes, totalCount);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete uom with sql transaction
let deleteTransaction = (contactId, auditLogIds, uuids, totalCount) => {
    let uomObj = {
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

    let UoMIds = uuids.map(function (r) {
        return uuidToBuffer(r);
    });

    return models.sequelize.transaction(function (t) {
        return removeUnitByMeasure({ UoMId: UoMIds }, t).then(function (result) {
            return updateAuditLog(auditObj, { Id: auditLogIds }, t);
        }).then(function (result) {
            return updateUoM(uomObj, { UUID: uuids }, t);
        });

    }).then(function (res) {
        return getResponse(200, null, { deletedCount: uuids.length, totalCount: totalCount });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get uom by Id
let getDetail = (id, language) => {
    return getUoMById(id, language).then(function (response) {
        return getUoMByMeasure(id).then(function (result) {
            let uomTypes = [];
            map(result, (d, i) => uomTypes.push(bufferToUUID(d['UoMTypeId'])));
            response.uomTypes = uomTypes;
            return getResponse(200, null, { data: response });
        })
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all uom
function getAll(types, language) {
    let conditionArr = [];
    let condition = { Language: language };
    if (types) {
        let typeArr = types.split(',');
        typeArr.map((uomType) => {
            conditionArr.push({ UoMTypeName: { $like: '%' + uomType + '%' } });
        });
        condition['$or'] = conditionArr;
    }
    return getUoMBinding(condition).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

// get all UoM types for multiselect
let getAllTypes = (language) => {
    return getUoMTypes(language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getUoMDataSet: Promise.method(getDataSet),
    getAllUoM: Promise.method(getAll),
    getAllUoMTypes: Promise.method(getAllTypes),
    createUoM: Promise.method(create),
    updateUoM: Promise.method(update),
    deleteUoM: Promise.method(remove),
    getUoMDetail: Promise.method(getDetail)
}