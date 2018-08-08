'use strict';

/***********************************
 * setup - accreditation program
 * perform CRUD and fetch operation
 * *********************************/

import Promise from 'bluebird';
import {
    createProgram, getProgramDataSet, getProgramCount,
    removeProgram, getProgramById, updateProgram, getAllProgram
} from '../../repository/accreditationprogram';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (programName, programCode) => {
    if (!programName) {
        return getResponse(400, 'VALIDATION.1022');
    }
    else if (!programCode) {
        return getResponse(400, 'VALIDATION.1023');
    }
    else if (programName.length > 50) {
        return getResponse(400, 'VALIDATION.1024');
    }
    else if (programCode.length > 10) {
        return getResponse(400, 'VALIDATION.1025');
    }
    return null;
}

// create new accreditation program
let create = (programName, programCode, isActive, contactId) => {
    let response = serverValidations(programName, programCode);
    if (response != null)
        return response;

    return getProgramCount().then(function (count) {
        let systemCode = generateSystemCode(programName, count);
        let programId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }
        let binProgrmId = uuidToBuffer(programId);
        let programObj = {
            Id: binProgrmId,
            UUID: programId,
            SystemCode: systemCode,
            IsActive: isActive,
            AuditLogId: uuidToBuffer(auditId),
            LocalizedData: [{
                ProgramId: programId,
                Language: 'en',
                ProgramCode: programCode,
                ProgramName: programName
            }]
        }

        return models.sequelize.transaction(function (t) {
            return createAuditLog(auditObj, t).then(function (res) {
                return createProgram(programObj, t);
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

// update existing accreditation program
let update = (programName, programCode, isActive, contactId, programId, auditId, language) => {
    let response = serverValidations(programName, programCode);
    if (response != null)
        return response;

    return getProgramById(programId, language).then(function (res) {
        return res;
    }).then(function (detail) {

        let programCondition = {
            Id: uuidToBuffer(programId)
        }

        let programObj = {
            LocalizedData: [{
                ProgramId: programId,
                Language: 'en',
                ProgramCode: programCode,
                ProgramName: programName
            }],
            IsActive: isActive
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
            return updateAuditLog(auditObj, auditCondition, t).then(function () {
                return updateProgram(programObj, programCondition, t)
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch data to display
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getProgramDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected accreditation program if 
// reference not exist
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let programObj = {
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
            return updateProgram(programObj, { UUID: uuids }, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get accreditation program by Id
let getDetail = (id, language) => {
    return getProgramById(id).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// get all accreditation program 
let getAllData = (language) => {
    return getAllProgram(language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getProgramDataSet: Promise.method(getDataSet),
    getProgramDetail: Promise.method(getDetail),
    createProgram: Promise.method(create),
    updateProgram: Promise.method(update),
    deleteProgram: Promise.method(remove),
    getAllAccreditation: Promise.method(getAllData),
}