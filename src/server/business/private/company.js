'use strict';

/***********************************
 * Logic related to company api
 * *********************************/

import Promise from 'bluebird';
import {
    findCompany as searchCompany, getCompanyById, getCompanyDataSet,
    createCompany, updateCompany, getComapnyDetails, getCompanyByEmail, getCompanyRegionDataSet,
    getCompanyBusinessDataSet, getSubComapnyDetails, getCompanyByName, getAllRegionData, getCompanyByCondition
} from '../../repository/company';
import { getContactByCompanyId } from '../../repository/contact';
import { bulkCreateFileStorage } from '../../repository/filestorage';
import { createCompanyservicetype, deleteCompanyservicetype } from '../../repository/servicetype';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../shared/uuid';
import { deleteServerFile } from './file-middleware';
import models from '../../schema';
import { HttpStatus, getResponse, resMessages } from '../../lib/index';
import { createAudit, updateAudit, deleteFile, uploadFile, removeFileStorage, updateContact } from './common';

const ORIGINAL_FILE_PATH = '/company/original/';
const THUMB_FILE_PATH = '/company/thumb/';

// perform server validations
let serverValidations = (companyObj, type) => {
    if (!companyObj.companyName) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1122');
    }
    else if (!companyObj.shortCode) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1123');
    }
    else if (!companyObj.email) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1124');
    }
    else if (!companyObj.businessaddress) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1125');
    }
    else if (!companyObj.companyId && (type == 'B' || type == 'R')) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1128');
    }
    else if (companyObj.companyName.length > 250) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1129');
    }
    else if (companyObj.shortCode.length > 20) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1130');
    }
    else if (companyObj.email.length > 100) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1131');
    }
    return null;
}

let findCompany = (obj) => {
    try {
        let valid = false;

        // validate model
        if ((obj.companyName != null && obj.companyName.length > 0) ||
            (obj.businessName != null && obj.businessName.length > 0) ||
            (obj.contactName != null && obj.contactName.length > 0) ||
            (obj.serviceTypeId != null && obj.serviceTypeId.length > 0) ||
            (obj.suburbId != null && obj.suburbId.length > 0) ||
            (obj.abn != null && obj.abn.length > 0) ||
            (obj.acn != null && obj.acn.length > 0)) {
            valid = true;
        }

        if (!valid) {
            return getResponse(HttpStatus.BAD_REQUEST, "At least one value is required");
        }

        return searchCompany(obj).then(function (response) {
            return getResponse(200, null, { data: response });
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }
    catch (e) {
        return getResponse(HttpStatus.SERVER_ERROR, e.toString());
    }
}

let getById = (id) => {
    return getCompanyById(id).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj = null, language) => {
    return getCompanyDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// common method to save company/region/business unit object
let getSaveObject = (obj, auditId, type) => {
    let newId = newUUID();

    let detailObj = {
        Id: uuidToBuffer(newId),
        UUID: newId,
        AuditLogId: uuidToBuffer(auditId),
        Name: obj.companyName,
        ShortCode: obj.shortCode,
        CompanyType: type,
        Mobile: obj.mobile,
        Telephone: obj.telephone,
        Fax: obj.fax,
        Email: obj.email,
        Website: obj.website,
        ABN: obj.abn,
        ACN: obj.acn,
        BusinessAddress: obj.businessaddress,
        BusinessSuburbId: obj.businessSuburb.suburbId ? uuidToBuffer(obj.businessSuburb.suburbId) : null,
        PostalAddress: obj.postaladdress,
        PostalSuburbId: obj.postalSuburb.suburbId ? uuidToBuffer(obj.postalSuburb.suburbId) : null
    }

    if (type != 'C') {
        detailObj.ManagerId = obj.manager ? uuidToBuffer(obj.manager) : null;
        detailObj.AsstManagerId = obj.asstManager ? uuidToBuffer(obj.asstManager) : null;
    }

    if (type == 'C') {
        detailObj.BusinessCountryId = uuidToBuffer(obj.businessCountry);
        detailObj.PostalCountryId = uuidToBuffer(obj.postalCountry);
    }
    return detailObj;
}

// common method to update company/region/business unit object
let getUpdateObject = (obj, type) => {
    let detailObj = {
        Name: obj.companyName,
        ShortCode: obj.shortCode,
        Mobile: obj.mobile,
        Telephone: obj.telephone,
        Fax: obj.fax,
        Email: obj.email,
        Website: obj.website,
        ABN: obj.abn,
        ACN: obj.acn,
        BusinessAddress: obj.businessaddress,
        BusinessSuburbId: obj.businessSuburb.suburbId ? uuidToBuffer(obj.businessSuburb.suburbId) : null,
        PostalAddress: obj.postaladdress,
        PostalSuburbId: obj.postalSuburb.suburbId ? uuidToBuffer(obj.postalSuburb.suburbId) : null
    }

    if (obj.postalCountry)
        detailObj.PostalCountryId = uuidToBuffer(obj.postalCountry);

    if (type != 'C') {
        detailObj.ManagerId = obj.manager ? uuidToBuffer(obj.manager) : null;
        detailObj.AsstManagerId = obj.asstManager ? uuidToBuffer(obj.asstManager) : null;
    }

    return detailObj;
}

// create new company
let create = (companyObj, contactId) => {
    let response = serverValidations(companyObj, 'C');
    if (response != null)
        return response;

    if (!companyObj.businessCountry) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1126');
    }
    // else if (!companyObj.postalCountry) {
    //     return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1127');
    // }

    let auditId = newUUID();
    let auditArr = [];
    let companyservicetypeObj = [];

    // File object
    let fileObj = {
        LogoFileId: companyObj.logo.fileId,
        LogoDeletedFile: companyObj.logo.deletedFile,
        LogoFile: companyObj.logo.file
    }
    auditArr.push(auditId);

    let companyDetailObj = getSaveObject(companyObj, auditId, 'C');

    companyObj.serviceType.map(function (st) {
        let id = newUUID();
        companyservicetypeObj.push(
            {
                Id: uuidToBuffer(id),
                UUID: id,
                CompanyId: companyDetailObj.Id,
                ServiceTypeId: uuidToBuffer(st)
            });
    });

    // return manageUploadAndSave(companyDetailObj, companyservicetypeObj, companyObj.logo, auditObj);
    return saveTransaction(companyDetailObj, companyservicetypeObj, fileObj, auditArr, contactId);
}

// create new region
let createRegion = (regionObj, contactId) => {
    let response = serverValidations(regionObj, 'R');
    if (response != null)
        return response;

    let auditId = newUUID();
    let auditArr = [];
    auditArr.push(auditId);

    let regionDetailObj = getSaveObject(regionObj, auditId, 'R');
    regionDetailObj.CompanyId = uuidToBuffer(regionObj.companyId);
    return saveTransaction(regionDetailObj, null, null, auditArr, contactId);
}

// create new business unit
let createBusinessUnit = (businessObj, contactId) => {
    let response = serverValidations(businessObj, 'B');
    if (response != null)
        return response;

    let auditId = newUUID();
    let companyservicetypeObj = [];
    let auditArr = [];
    auditArr.push(auditId);

    let businessDetailObj = getSaveObject(businessObj, auditId, 'B');
    businessDetailObj.CompanyId = uuidToBuffer(businessObj.companyId);
    businessDetailObj.RegionId = uuidToBuffer(businessObj.region);

    businessObj.serviceType.map(function (st) {
        let id = newUUID();
        companyservicetypeObj.push(
            {
                Id: uuidToBuffer(id),
                UUID: id,
                CompanyId: businessDetailObj.Id,
                ServiceTypeId: uuidToBuffer(st)
            });
    });
    return saveTransaction(businessDetailObj, companyservicetypeObj, null, auditArr, contactId);
}

// update object for company, audit to save in DB.
let update = (companyObj, contactId) => {
    let response = serverValidations(companyObj, 'C');
    if (response != null)
        return response;

    let companyservicetypeObj = [];
    let updateAuditArr = [];
    updateAuditArr.push(bufferToUUID(companyObj.AuditLogId));

    let companyDetailCondition = {
        Id: uuidToBuffer(companyObj.Id)
    }
    let companyDetailObj = getUpdateObject(companyObj, 'C');
    companyObj.serviceType.map(function (st) {
        let id = newUUID();
        companyservicetypeObj.push(
            {
                Id: uuidToBuffer(id),
                UUID: id,
                CompanyId: uuidToBuffer(companyObj.Id),
                ServiceTypeId: uuidToBuffer(st)
            });
    });

    // File object
    let fileObj = {
        LogoFileId: companyObj.logo.fileId,
        LogoDeletedFile: companyObj.logo.deletedFile,
        LogoFile: companyObj.logo.file
    }

    return updateTransaction(companyDetailObj, companyDetailCondition, companyservicetypeObj, fileObj,
        updateAuditArr, companyObj.Id, contactId);
}

// update object for region, audit to save in DB.
let updateRegionDetail = (regionObj, contactId) => {
    let response = serverValidations(regionObj, 'R');
    if (response != null)
        return response;

    let regionDetailCondition = {
        Id: uuidToBuffer(regionObj.Id)
    }
    let regionDetailObj = getUpdateObject(regionObj, 'R');
    let updateAuditArr = [];
    updateAuditArr.push(bufferToUUID(regionObj.AuditLogId));

    return updateTransaction(regionDetailObj, regionDetailCondition, null, {}, updateAuditArr,
        regionObj.Id, contactId);
    // return manageUploadAndSave(companyDetailObj, companyservicetypeObj, companyObj.logo, auditObj, auditCondition,
    //     companyDetailCondition, companyObj.Id);
}

// update object for species, audit to save in DB.
let updateBusinessUnitDetail = (businessObj, contactId) => {
    let response = serverValidations(businessObj, 'B');
    if (response != null)
        return response;

    let companyservicetypeObj = [];
    let businessDetailCondition = {
        Id: uuidToBuffer(businessObj.Id)
    }
    let businessDetailObj = getUpdateObject(businessObj, 'B');
    businessDetailObj.RegionId = uuidToBuffer(businessObj.region);

    let updateAuditArr = [];
    updateAuditArr.push(bufferToUUID(businessObj.AuditLogId));

    businessObj.serviceType.map(function (st) {
        let id = newUUID();
        companyservicetypeObj.push(
            {
                Id: uuidToBuffer(id),
                UUID: id,
                CompanyId: uuidToBuffer(businessObj.Id),
                ServiceTypeId: uuidToBuffer(st)
            });
    });
    return updateTransaction(businessDetailObj, businessDetailCondition, companyservicetypeObj, {},
        updateAuditArr, businessObj.Id, contactId);
}

// save company/region/business unit data, related audit log and file storage data to database
let saveTransaction = (companyDetailObj, companyservicetypeObj, fileObj, auditArr, contactId) => {
    var fileStorage = [];
    return models.sequelize.transaction(function (t) {
        return uploadFile(fileObj != null ? fileObj.LogoFile : null, companyDetailObj.UUID, 'company', 'logo').then(function (resLogo) {
            if (resLogo) {
                companyDetailObj.LogoFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: companyDetailObj.LogoFileId,
                    FileName: fileObj.LogoFile.storeName,
                    FilePath: resLogo.Location,
                    MimeType: fileObj.LogoFile.type
                });
            }
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return createAudit(auditArr, contactId, t);
        }).then(function () {
            return createCompany(companyDetailObj, t);
        }).then(function () {
            if (companyservicetypeObj) {
                return createCompanyservicetype(companyservicetypeObj, t);
            }
            else {
                return true;
            }
        });
    }).then(function (res) {
        if (fileObj != null && fileObj.LogoFile) deleteServerFile(fileObj.LogoFile.name, true);
        return getResponse(200, null, { companyId: companyDetailObj.UUID, AuditLogId: auditArr[0] });
    }).catch(function (err) {
        // delete files uploaded to s3
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// update company/region/business unit data, related audit log and file storage data to database
let updateTransaction = (companyDetailObj, companyDetailCondition, companyservicetypeObj, fileObj,
    updateAuditArr, id, contactId) => {
    let fileStorage = [];
    let oldFileStorage = [];
    return models.sequelize.transaction(function (t) {
        if (fileObj.LogoDeletedFile) {
            oldFileStorage.push({
                Id: fileObj.LogoFileId,
                FileName: fileObj.LogoDeletedFile.name
            });
        }
        return removeFileStorage(oldFileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH).then(function (result) {
            return uploadFile(fileObj.LogoFile, id, 'company', 'logo')
        }).then(function (resLogo) {
            if (resLogo) {
                companyDetailObj.LogoFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: companyDetailObj.LogoFileId,
                    FileName: fileObj.LogoFile.storeName,
                    FilePath: resLogo.Location,
                    MimeType: fileObj.LogoFile.type
                });
            }
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return updateAudit(updateAuditArr, [], contactId, t);
        }).then(function () {
            if (companyservicetypeObj) {
                return deleteCompanyservicetype({ CompanyId: companyDetailCondition.Id }, t);
            }
            else {
                return true;
            }
        }).then(function () {
            return updateCompany(companyDetailObj, companyDetailCondition, t);
        }).then(function () {
            if (companyservicetypeObj) {
                return createCompanyservicetype(companyservicetypeObj, t);
            }
            else {
                return true;
            }
        });
    }).then(function (res) {
        if (fileObj.LogoFile) deleteServerFile(fileObj.LogoFile.name, true);
        return getResponse(200, null, { companyId: id });
    }).catch(function (err) {
        // delete files uploaded to s3
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// get company details by Id
let getDetail = (id, language) => {
    return getComapnyDetails(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// check duplicate username
let checkDupEmail = (email) => {
    return getCompanyByEmail(email).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// check duplicate company/region/business unit name
let checkDupName = (name, companyId, type, id) => {
    return getCompanyByName(name, companyId, type, id).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getRegionDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj = null, language) => {
    return getCompanyRegionDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getBusinessDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj = null, language) => {
    return getCompanyBusinessDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get region/business unit details by Id
let getSubDetail = (id, type, language) => {
    return getSubComapnyDetails(id, type, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get all region for drop down
let getAllRegion = (companyId) => {
    return getAllRegionData(companyId).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

// delete selected company
let removeCompany = (uuids, auditLogIds, contactId) => {
    let contactIds = [];
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }
    let companyObj = {
        IsDeleted: 1
    }

    let companyBuffer = uuids.map(function (r) {
        return uuidToBuffer(r);
    });

    return getCompanyByCondition({ CompanyId: companyBuffer }).then(function (res) {
        res.forEach(function (element) {
            uuids.push(element.Id);
            auditLogIds.push(bufferToUUID(element.AuditLogId));
        }, this);
        return getContactByCompanyId({ CompanyId: companyBuffer });
    }).then(function (contacts) {
        contacts.forEach(function (element) {
            contactIds.push(element.Id);
            auditLogIds.push(bufferToUUID(element.AuditLogId));
        }, this);

        return models.sequelize.transaction(function (t) {
            return updateAudit([], auditLogIds, contactId, t).then(function () {
                return updateCompany(companyObj, { UUID: uuids }, t);
            }).then(function (res) {
                return updateContact(companyObj, { UUID: contactIds }, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

// delete selected region
let removeRegion = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }
    let companyBuffer = uuids.map(function (r) {
        return uuidToBuffer(r);
    });
    return getCompanyByCondition({ RegionId: companyBuffer }).then(function (res) {
        res.forEach(function (element) {
            uuids.push(element.Id);
            auditLogIds.push(bufferToUUID(element.AuditLogId));
        }, this);

        return models.sequelize.transaction(function (t) {
            return updateAudit([], auditLogIds, contactId, t).then(function () {
                return updateCompany({ IsDeleted: 1 }, { UUID: uuids }, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

// delete selected business unit
let removeBusinessUnit = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }

    return models.sequelize.transaction(function (t) {
        return updateAudit([], auditLogIds, contactId, t).then(function (res) {
            return updateCompany({ IsDeleted: 1 }, { UUID: uuids }, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get company data based on click of select all
let getAllCompanyData = (filterObj, language) => {
    return getCompanyDataSet(null, null, 'asc', 'Name', null, filterObj, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    findCompany: Promise.method(findCompany),
    getCompanyById: Promise.method(getById),
    getCompanyDataSet: Promise.method(getDataSet),
    createCompany: Promise.method(create),
    updateCompanyDetail: Promise.method(update),
    getCompanyDetails: Promise.method(getDetail),
    checkDupEmail: Promise.method(checkDupEmail),
    getBusinessDataSet: Promise.method(getBusinessDataSet),
    getRegionDataSet: Promise.method(getRegionDataSet),
    getSubCompanyDetail: Promise.method(getSubDetail),
    createRegion: Promise.method(createRegion),
    updateRegionDetail: Promise.method(updateRegionDetail),
    createBusinessUnit: Promise.method(createBusinessUnit),
    updateBusinessUnitDetail: Promise.method(updateBusinessUnitDetail),
    checkDupName: Promise.method(checkDupName),
    getAllRegion: Promise.method(getAllRegion),
    deleteCompany: Promise.method(removeCompany),
    deleteRegion: Promise.method(removeRegion),
    deleteBusinessUnit: Promise.method(removeBusinessUnit),
    getAllCompanyData: Promise.method(getAllCompanyData)
}