'use strict';

/***********************************
 * Logic related to setup livestock colour api
 * *********************************/

import Promise from 'bluebird';
import {
    createLivestockColour, getLivestockColourDataSet, getLivestockColourCount,
    removeLivestockColour, getLivestockColourById, updateLivestockColour, updateLivestockColourLanguageData,
    getLivestockColours
} from '../../repository/livestockcolour';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (colourName, colourCode) => {
    if (!colourName) {
        return getResponse(400, 'VALIDATION.1030');
    }
    else if (!colourCode) {
        return getResponse(400, 'VALIDATION.1031');
    }
    else if (colourName.length > 50) {
        return getResponse(400, 'VALIDATION.1032');
    }
    else if (colourCode.length > 10) {
        return getResponse(400, 'VALIDATION.1033');
    }
    return null;
}

// create new livestock colour
let create = (colourName, colourCode, contactId, configuredByAdmin) => {
    let response = serverValidations(colourName, colourCode);
    if (response != null)
        return response;

    return getLivestockColourCount().then(function (count) {
        let systemCode = generateSystemCode(colourName, count);
        let colourId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }

        let livestockColourObj = {
            Id: uuidToBuffer(colourId),
            UUID: colourId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                LivestockColourId: colourId,
                Language: 'en',
                ColourCode: colourCode,
                ColourName: colourName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return Promise.all([
                createAuditLog(auditObj, t),
                createLivestockColour(livestockColourObj, t)
            ]);
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (errCount) {
        return getResponse(500, errCount.toString());
    });
}

// update selected master livestock colour
let update = (colourName, colourCode, contactId, colourId, auditId, language) => {
    let response = serverValidations(colourName, colourCode);
    if (response != null)
        return response;

    let colourCondition = {
        Id: uuidToBuffer(colourId)
    }

    return getLivestockColourById(colourId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let livestockColourObj = {
            LocalizedData: [{
                LivestockColourId: colourId,
                Language: 'en',
                ColourCode: colourCode,
                ColourName: colourName
            }]
        };
        let auditCondition = {
            Id: uuidToBuffer(auditId)
        };
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        };
        return models.sequelize.transaction(function (t) {
            return Promise.all([
                updateAuditLog(auditObj, auditCondition, t),
                updateLivestockColourLanguageData(livestockColourObj.LocalizedData, t)
            ]);
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch colours by server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getLivestockColourDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// soft delete livestock colour records
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let livestockColourObj = {
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
            return updateLivestockColour(livestockColourObj, { UUID: uuids }, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });

}

// fetch livestock color by Id
let getDetail = (id, language) => {
    return getLivestockColourById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all livestock colours for drop down
let getAll = (language, companyId, regionId, businessId, propertyId) => {
    return getLivestockColours(language, companyId, regionId, businessId, propertyId).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getLivestockColourDataSet: Promise.method(getDataSet),
    getLivestockColourDetail: Promise.method(getDetail),
    createLivestockColour: Promise.method(create),
    updateLivestockColour: Promise.method(update),
    deleteLivestockColour: Promise.method(remove),
    getAllLivestockColour: Promise.method(getAll)
}