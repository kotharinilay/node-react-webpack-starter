'use strict';

/***********************************
 * Logic related to setup species api
 * *********************************/

import Promise from 'bluebird';
import {
    createSpecies, getSpeciesCount, getSpeciesDataSet,
    getSpeciesById, getSpeciesBinding, updateSpecies, checkSpeciesReferenceExist,
    updateSpeciesLanguageData
} from '../../repository/species';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { bulkCreateFileStorage } from '../../repository/filestorage';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { getFileExtension } from '../../../shared';
import { deleteServerFile } from './file-middleware';
import { upload as s3_upload, deleteObjects as s3_delete } from '../../../../aws/s3';
import { generateSystemCode } from '../../../shared';
import { createAudit, updateAudit, deleteFile, uploadFile, removeFileStorage } from './common';

const ORIGINAL_FILE_PATH = '/livestock/species/original/';
const THUMB_FILE_PATH = '/livestock/species/thumb/';

// perform server validations
let serverValidations = (speciesName, speciesCode) => {
    if (!speciesName) {
        return getResponse(400, 'VALIDATION.1047');
    }
    else if (!speciesCode) {
        return getResponse(400, 'VALIDATION.1048');
    }
    else if (speciesName.length > 50) {
        return getResponse(400, 'VALIDATION.1049');
    }
    else if (speciesCode.length > 10) {
        return getResponse(400, 'VALIDATION.1050');
    }
    return null;
}

// save species data, related audit log and file storage data to database
let saveTransaction = (auditArr, specy, fileObj, contactId) => {
    var fileStorage = [];
    return models.sequelize.transaction(function (t) {
        return uploadFile(fileObj.MobFile, specy.SystemCode, 'livestock', 'mob', 'species').then(function (resMob) {
            if (resMob) {
                specy.MobIconFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: specy.MobIconFileId,
                    FileName: fileObj.MobFile.storeName,
                    FilePath: resMob.Location,
                    MimeType: fileObj.MobFile.type
                });
            }
            return uploadFile(fileObj.IndFile, specy.SystemCode, 'livestock', 'ind', 'species');
        }).then(function (resInd) {
            if (resInd) {
                specy.IndFileIconId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: specy.IndFileIconId,
                    FileName: fileObj.IndFile.storeName,
                    FilePath: resInd.Location,
                    MimeType: fileObj.IndFile.type
                });
            }
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return createAudit(auditArr, contactId, t);
        }).then(function () {
            return createSpecies(specy, t)
        });
    }).then(function (res) {
        if (fileObj.IndFile) deleteServerFile(fileObj.IndFile.name, true);
        if (fileObj.MobFile) deleteServerFile(fileObj.MobFile.name, true);
        return getResponse();
    }).catch(function (err) {
        // delete files uploaded to s3
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// update species data, related audit log and file storage data to database
let updateTransaction = (specyId, specy, specyCondition, updateAuditArr, fileObj, contactId) => {
    let fileStorage = [];
    let oldFileStorage = [];
    if (fileObj.MobDeletedFile)
        oldFileStorage.push({
            Id: fileObj.MobIconFileId,
            FileName: fileObj.MobDeletedFile.name
        });
    if (fileObj.IndDeletedFile)
        oldFileStorage.push({
            Id: fileObj.IndFileIconId,
            FileName: fileObj.IndDeletedFile.name
        });
    return models.sequelize.transaction(function (t) {
        return removeFileStorage(oldFileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH).then(function (result) {
            return uploadFile(fileObj.MobFile, specy.SystemCode, 'livestock', 'mob', 'species');
        }).then(function (resMob) {
            if (resMob) {
                specy.MobIconFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: specy.MobIconFileId,
                    FileName: fileObj.MobFile.storeName,
                    FilePath: resMob.Location,
                    MimeType: fileObj.MobFile.type
                });
            } else specy.MobIconFileId = specy.MobIconFileId ? uuidToBuffer(specy.MobIconFileId) : null;
            return uploadFile(fileObj.IndFile, specy.SystemCode, 'livestock', 'ind', 'species');
        }).then(function (resInd) {
            if (resInd) {
                specy.IndFileIconId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: specy.IndFileIconId,
                    FileName: fileObj.IndFile.storeName,
                    FilePath: resInd.Location,
                    MimeType: fileObj.IndFile.type
                });
            } else specy.IndFileIconId = specy.IndFileIconId ? uuidToBuffer(specy.IndFileIconId) : null;
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return updateAudit(updateAuditArr, [], contactId, t);
        }).then(function () {
            return updateSpecies({ MobIconFileId: specy.MobIconFileId, IndFileIconId: specy.IndFileIconId }, { UUID: specyId }, t);
        }).then(function () {
            return updateSpeciesLanguageData(specy.LocalizedData, t);
        });
    }).then(function (res) {
        if (fileObj.IndFile) deleteServerFile(fileObj.IndFile.name, true);
        if (fileObj.MobFile) deleteServerFile(fileObj.MobFile.name, true);
        return getResponse();
    }).catch(function (err) {
        // delete files uploaded to s3
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// generates object for species, audit to save in database.
let create = (speciesName, speciesCode, mobPicture, individualPicture, contactId) => {
    let response = serverValidations(speciesName, speciesCode);
    if (response != null)
        return response;

    return getSpeciesCount().then(function (count) {
        let systemCode = generateSystemCode(speciesName, count);
        let specyId = newUUID();
        let auditId = newUUID();
        let auditArr = [];
        auditArr.push(auditId);

        let specyObj = {
            Id: uuidToBuffer(specyId),
            UUID: specyId,
            SystemCode: systemCode,
            LocalizedData: [{
                SpeciesId: specyId,
                Language: 'en',
                SpeciesCode: speciesCode,
                SpeciesName: speciesName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        // File object
        let fileObj = {
            MobIconFileId: mobPicture.fileId,
            MobDeletedFile: mobPicture.deletedFile,
            MobFile: mobPicture.file,
            IndFileIconId: individualPicture.fileId,
            IndDeletedFile: individualPicture.deletedFile,
            IndFile: individualPicture.file
        }

        // return manageUploadAndSave(mobPicture, individualPicture, specyObj, auditObj);
        return saveTransaction(auditArr, specyObj, fileObj, contactId);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update object for species, audit to save in DB.
let update = (speciesName, speciesCode, mobPicture, individualPicture, contactId, specyId, auditId, systemCode, language) => {
    let response = serverValidations(speciesName, speciesCode);
    if (response != null)
        return response;

    return getSpeciesById(specyId, language).then(function (res) {
        return res;
    }).then(function (detail) {
        let updateAuditArr = [];
        let specyCondition = {
            Id: uuidToBuffer(specyId)
        }
        updateAuditArr.push(auditId);

        let specyObj = {
            SystemCode: systemCode,
            MobIconFileId: mobPicture.fileId,
            IndFileIconId: individualPicture.fileId,
            LocalizedData: [
                {
                    SpeciesId: specyId,
                    Language: 'en',
                    SpeciesCode: speciesCode,
                    SpeciesName: speciesName
                }
            ]
        }

        // File object
        let fileObj = {
            MobIconFileId: mobPicture.fileId,
            MobDeletedFile: mobPicture.deletedFile,
            MobFile: mobPicture.file,
            IndFileIconId: individualPicture.fileId,
            IndDeletedFile: individualPicture.deletedFile,
            IndFile: individualPicture.file
        }
        return updateTransaction(specyId, specyObj, specyCondition, updateAuditArr, fileObj, contactId);
    });
}

// get species by server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getSpeciesDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected species and relative child tables
let deleteTransaction = (contactId, auditLogIds, uuids, totalRecords) => {
    let specyObj = {
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
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updateSpecies(specyObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse(200, null, { deletedCount: uuids.length, totalCount: totalRecords });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected species and relative child tables
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }
    let totalCount = uuids.length;

    return checkSpeciesReferenceExist(uuids)
        .then(function (result) {
            return result;
        }).then(function (speciesObj) {
            return deleteTransaction(contactId, auditLogIds, speciesObj, totalCount)
        }).catch(function (speciesErr) {
            return getResponse(500, speciesErr.toString());
        });
}

// get species details by Id
let getDetail = (id, language) => {
    return getSpeciesById(id, language)
        .then(function (response) {
            return response;
        })
        .then(function (species) {
            return getResponse(200, null, { data: species });
        })
        .catch(function (err) {
            return getResponse(500, err.toString());
        });
}

// get all species
let getAll = (language) => {
    return getSpeciesBinding(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getSpeciesDataSet: Promise.method(getDataSet),
    getSpeciesDetail: Promise.method(getDetail),
    getAllSpecies: Promise.method(getAll),
    createSpecies: Promise.method(create),
    updateSpecies: Promise.method(update),
    deleteSpecies: Promise.method(remove)
}