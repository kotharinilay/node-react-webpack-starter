'use strict';

/***********************************
 * Logic related to edit user profile
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';
import { map, includes as _includes } from 'lodash';

import {
    getPropertyFilterData, getPropertyDataSet, findProperty as searchProperty,
    getPropertyMngrAsstMngr, createProperty, updateProperty, getPropertyDetailById,
    getPropertySearch, getProperties, getPropertyByCondition, getInductionInitialData, checkPropertyReference
} from '../../repository/property';
import { getEnclosureDataSet, bulkCreateEnclosure, getEnclosureByPropertyId, updateEnclosure } from '../../repository/enclosure';
import { getAllEnclosureType } from '../../repository/enclosuretype';
import { bulkCreatePropAccreditation, getPropAccredByPropId, removePropAccreditation, getInActivePropAccredById } from '../../repository/propertyaccreditationprogram';
import { bulkCreateFileStorage } from '../../repository/filestorage';
import { getHierarchyIds, getCompanyById } from '../../repository/company';
import { getState } from '../../repository/state';
import { getPropertyTypeBindings } from '../../repository/propertytype';
import { bulkCreatePropAccess, removePropAccess, getPropertyAccess, getDefaultAccessList } from '../../repository/propertyaccess';
import { getUomByMeasureByType } from '../../repository/uombymeasure';

import { deleteServerFile } from './file-middleware';
import { HttpStatus, getResponse, resMessages } from '../../lib/index';
import { picErpStatus } from '../../lib/nlis/index';
import { uuidToBuffer, bufferToUUID, newUUID } from '../../../shared/uuid/index';
import { isNullEmpty } from '../../../shared/format/string';
import { userRole } from '../../../shared/index';
import { uomTypeCodes } from '../../../shared/constants';

import { createAudit, updateAudit, deleteFile, uploadFile, removeFileStorage, validatePIC } from './common';

const ORIGINAL_FILE_PATH = '/property/original/';
const THUMB_FILE_PATH = '/property/thumb/';

// perform server validations
let serverValidations = (propertyObj, enclosureArr, accessArr, defaultAccessData) => {
    let { PIC, CompanyId, Name, PropertyTypeId, NLISUsername, NLISPassword, LivestockIdentifier,
        Address, BrandText, EarmarkText } = propertyObj;

    if (!PIC) {
        return getResponse(400, resMessages.val_PicReq);
    }
    else if (PIC.length != 8) {
        return getResponse(400, resMessages.val_PicInvalid);
    }
    if (!CompanyId) {
        return getResponse(400, resMessages.val_SelectCompany);
    }
    if (!Name) {
        return getResponse(400, 'VALIDATION.1105');
    }
    if (!PropertyTypeId) {
        return getResponse(400, 'VALIDATION.1106');
    }
    if (NLISPassword && !NLISUsername) {
        return getResponse(400, 'VALIDATION.1107');
    }
    if (NLISUsername && !NLISPassword) {
        return getResponse(400, 'VALIDATION.1108');
    }
    if (!LivestockIdentifier) {
        return getResponse(400, 'VALIDATION.1109');
    }

    let objName = enclosureArr.find(x => x.Name == null || x.Name == '');
    if (objName)
        return getResponse(400, 'VALIDATION.1111');

    let objEnclosureType = enclosureArr.find(x => x.EnclosureTypeId == null);
    if (objEnclosureType)
        return getResponse(400, 'VALIDATION.1112');

    if (Name.length > 250)
        return getResponse(400, 'VALIDATION.1114');
    if (Address && Address.length > 300)
        return getResponse(400, 'VALIDATION.1115');
    if (BrandText && BrandText.length > 50)
        return getResponse(400, 'VALIDATION.1116');
    if (EarmarkText && EarmarkText.length > 50)
        return getResponse(400, 'VALIDATION.1117');
    if (NLISUsername && NLISPassword && NLISUsername.length > 100)
        return getResponse(400, 'VALIDATION.1118');
    if (NLISUsername && NLISPassword && NLISPassword.length > 100)
        return getResponse(400, 'VALIDATION.1119');

    let objNameLength = enclosureArr.find(x => x.Name.length > 100);
    if (objNameLength)
        return getResponse(400, 'VALIDATION.1120');

    let objDSELength = enclosureArr.find(x => x.DSE.length > 21);
    if (objDSELength)
        return getResponse(400, 'VALIDATION.1121');

    return null;
}

// get property filter data
let getFilterData = (language) => {
    return getPropertyFilterData(language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// fetch all property with server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language, contactId, isSiteAdmin) => {
    return getPropertyDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language, contactId, isSiteAdmin).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    });
}

let findProperty = (obj) => {
    try {
        let valid = false;

        if ((obj.propertyName != null && obj.propertyName.length > 0) ||
            (obj.PIC != null && obj.PIC.length > 0) ||
            (obj.companyName != null && obj.companyName.length > 0) ||
            (obj.businessName != null && obj.businessName.length > 0) ||
            (obj.contactName != null && obj.contactName.length > 0) ||
            (obj.propertyTypeId != null && obj.propertyTypeId.length > 0) ||
            (obj.suburbId != null && obj.suburbId.length > 0)) {
            valid = true;
        }

        if (!valid) {
            return getResponse(HttpStatus.BAD_REQUEST, "At least one value is required");
        }

        return searchProperty(obj).then(function (response) {
            return getResponse(HttpStatus.SUCCESS, null, { data: response });
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    }
    catch (e) {
        return getResponse(HttpStatus.SERVER_ERROR, e.toString());
    }
}

// fetch all property with server filtering/sorting/paging By PropertyId
let getEnclosureDataSetById = (pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language) => {
    return getEnclosureDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language).then(function (response) {
        return getResponse(200, null, response);
    });
}

// get list of Manager and AsstManager for property
let getMngrAsstMngr = (companyId, regionId, businessId) => {
    return getPropertyMngrAsstMngr(companyId, regionId, businessId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get all data on change of company hierarchy
let getAllDataByHierarchy = (companyId, regionId, businessId) => {
    return getPropertyMngrAsstMngr(companyId, regionId, businessId).then(function (managerList) {
        return getCompanyById(companyId).then(function (result) {
            return getResponse(HttpStatus.SUCCESS, null, {
                data: {
                    managerList: managerList,
                    countryId: bufferToUUID(result.BusinessCountryId)
                }
            });
        });
    });
}

// Get all data on load of accreditation tab
let getDataOnAccreditation = (language) => {
    return getState(language).then(function (resultState) {
        return getPropAccredByPropId(null, language).then(function (resultAccreditation) {
            return getResponse(HttpStatus.SUCCESS, null, {
                data: {
                    state: resultState,
                    accreditation: resultAccreditation
                }
            });
        });
    });
}

// create a new records of property
let create = (property, accreditation, enclosure, access, defaultAccessData, companyHierarchy, enclosureMap, retrieveStatus, contactId, language) => {
    let response = serverValidations(property, enclosure);
    if (response != null)
        return response;

    if (!defaultAccessData && access.length == 0)
        return getResponse(400, 'VALIDATION.1113');

    let auditArr = [];
    let propertyId = newUUID();
    let auditId = newUUID();

    auditArr.push(auditId);

    // Property object
    let propertyObj = {
        CompanyId: property.CompanyId ? uuidToBuffer(property.CompanyId) : null,
        PIC: property.PIC,
        Name: property.Name,
        PropertyTypeId: property.PropertyTypeId ? uuidToBuffer(property.PropertyTypeId) : null,
        Address: property.Address,
        SuburbId: property.SuburbId ? uuidToBuffer(property.SuburbId) : null,
        BrandText: property.BrandText,
        EarmarkText: property.EarmarkText,
        PropertyManagerId: property.PropertyManagerId ? uuidToBuffer(property.PropertyManagerId) : null,
        AsstPropertyManagerId: property.AsstPropertyManagerId ? uuidToBuffer(property.AsstPropertyManagerId) : null,
        NLISUsername: property.NLISUsername,
        NLISPassword: property.NLISPassword,
        LivestockIdentifier: property.LivestockIdentifier,
        ExportEligibility: property.ExportEligibility ? JSON.stringify(property.ExportEligibility) : null,
        AuditLogId: uuidToBuffer(auditId),
        Id: uuidToBuffer(propertyId),
        UUID: propertyId,
        DefaultGPS: property.DefaultGPS,
        MapZoomLevel: property.MapZoomLevel,
        Area: property.Area,
        UoMId: property.UoMId ? uuidToBuffer(property.UoMId) : null,
        PropertyFence: property.PropertyFence ? JSON.stringify(property.PropertyFence) : null
    }

    // File object
    let fileObj = {
        BrandFileId: property.BrandFileId,
        BrandDeletedFile: property.BrandDeletedFile,
        BrandFile: property.BrandFile,
        LogoFileId: property.LogoFileId,
        LogoDeletedFile: property.LogoDeletedFile,
        LogoFile: property.LogoFile
    }

    // Enclosure object
    map(enclosure, e => {
        auditArr.push(e.AuditLogId);
        let obj = enclosureMap.find(x => x.Id == e.Id);

        e.PropertyId = propertyObj.Id;
        e.UUID = e.Id;
        e.Id = uuidToBuffer(e.Id);
        e.AuditLogId = uuidToBuffer(e.AuditLogId);
        e.EnclosureTypeId = uuidToBuffer(e.EnclosureTypeId);

        // Add map details to enclosure
        if (obj) {
            e.DefaultGPS = obj.DefaultGPS;
            e.EnclosureFence = obj.EnclosureFence ? JSON.stringify(obj.EnclosureFence) : null;
            e.Area = obj.Area;
            e.UoMId = obj.UoMId ? uuidToBuffer(obj.UoMId) : null;
        }
    });

    // PropertyAccreditationProgram object
    map(accreditation, a => {
        let UUID = newUUID();
        a.UUID = UUID;
        a.Id = uuidToBuffer(UUID);
        a.PropertyId = propertyObj.Id;
        a.AccreditationProgramId = uuidToBuffer(a.AccreditationProgramId);
    });

    let accessObj = [];
    let accreditationObj = null;
    let picResponse = null;

    return validatePIC(propertyObj.PIC, property.PropertyTypeId, property.SuburbId, language).then(function (res) {
        picResponse = res;
        if (res.isValidPic && !res.isDuplicatePIC) {
            if (defaultAccessData)
                return getDefaultAccessList(companyHierarchy.companyId, companyHierarchy.regionId, companyHierarchy.businessId, null);
            else
                return access;
        }
        else
            return null;
    }).then(function (result) {
        if (!result) {
            if (!picResponse.isValidPic)
                return getResponse(400, resMessages.val_PicInvalid);
            else if (picResponse.isDuplicatePIC)
                return getResponse(400, resMessages.val_PicDuplicate);
        }
        else {
            map(result, id => {
                let accessId = newUUID();
                accessObj.push({
                    UUID: accessId,
                    Id: uuidToBuffer(accessId),
                    PropertyId: propertyObj.Id,
                    ContactId: uuidToBuffer(id),
                    CreatedBy: uuidToBuffer(contactId)
                });
            });
            return new Promise((resolve, rej) => {
                if (retrieveStatus)
                    resolve(getPropAccredByPropId(null, language));
                else resolve(false);
            }).then(function (resultAccreditation) {
                if (resultAccreditation && resultAccreditation.length > 0) {
                    accreditationObj = resultAccreditation;
                    return picErpStatus(property.NLISUsername, property.NLISPassword, property.PIC);
                }
                else return false;
            }).then(function (resultNLIS) {
                if (resultNLIS.status == 200 && resultNLIS.response.success) {
                    let NLISStatus = resultNLIS.response.response;
                    if (NLISStatus && NLISStatus.ProgramCode) {
                        let accProgram = accreditationObj.find(x => x.SystemCode == NLISStatus.ProgramCode);
                        if (accProgram) {
                            let accreditationUUID = newUUID();
                            accreditation.push({
                                UUID: accreditationUUID,
                                Id: uuidToBuffer(accreditationUUID),
                                PropertyId: propertyObj.Id,
                                AccreditationProgramId: uuidToBuffer(accProgram.Id),
                                IsActive: (NLISStatus.StatusCode == 'A' ? true : false),
                                Notes: NLISStatus.Description
                            });
                        }
                    }
                }
                return saveTransaction(contactId, auditArr, propertyObj, fileObj, enclosure, accreditation, accessObj).then(function (resProperty) {
                    if (resProperty.status == HttpStatus.SUCCESS && retrieveStatus)
                        resProperty.response.validNLIS = (resultNLIS.status == HttpStatus.SUCCESS);
                    return resProperty;
                });
            });
        }
    });

}

// update a records of property
let update = (property, accreditation, accredDeletedData, enclosure, updateAccreditationDB, updateEnclosureDB, access, accessDeletedData, defaultAccessData, companyHierarchy, enclosureMap, updateMapDB, deletedEnclosureMap, retrieveStatus, contactId, language) => {

    let response = serverValidations(property, enclosure);
    if (response != null)
        return response;

    let propertyId = property.PropertyId
    let createAuditArr = [];
    let updateAuditArr = [];
    let deleteAuditArr = [];

    updateAuditArr.push(property.AuditLogId);

    // Property object
    let propertyObj = {
        CompanyId: property.CompanyId ? uuidToBuffer(property.CompanyId) : null,
        PIC: property.PIC,
        Name: property.Name,
        PropertyTypeId: property.PropertyTypeId ? uuidToBuffer(property.PropertyTypeId) : null,
        Address: property.Address,
        SuburbId: property.SuburbId ? uuidToBuffer(property.SuburbId) : null,
        BrandText: property.BrandText,
        EarmarkText: property.EarmarkText,
        PropertyManagerId: property.PropertyManagerId ? uuidToBuffer(property.PropertyManagerId) : null,
        AsstPropertyManagerId: property.AsstPropertyManagerId ? uuidToBuffer(property.AsstPropertyManagerId) : null,
        NLISUsername: property.NLISUsername,
        NLISPassword: property.NLISPassword,
        LivestockIdentifier: property.LivestockIdentifier,
        ExportEligibility: property.ExportEligibility ? JSON.stringify(property.ExportEligibility) : null
    }

    // File object
    let fileObj = {
        BrandFileId: property.BrandFileId,
        BrandDeletedFile: property.BrandDeletedFile,
        BrandFile: property.BrandFile,
        LogoFileId: property.LogoFileId,
        LogoDeletedFile: property.LogoDeletedFile,
        LogoFile: property.LogoFile
    }

    // PropertyAccreditationProgram object
    if (updateAccreditationDB) {
        map(accreditation, a => {
            let UUID = newUUID();
            a.UUID = UUID;
            a.Id = uuidToBuffer(UUID);
            a.PropertyId = uuidToBuffer(propertyId);
            a.AccreditationProgramId = uuidToBuffer(a.AccreditationProgramId);
        });
    }

    // Enclosure object
    let createEnclosureArr = [];
    let updateEnclosureArr = [];
    let enclosureConditionArr = [];

    if (updateEnclosureDB && updateMapDB) {
        map(enclosure, e => {
            let obj = enclosureMap.find(x => x.Id == e.Id);
            if (!obj) {
                obj = {
                    DefaultGPS: null,
                    EnclosureFence: null,
                    Area: null,
                    UoMId: null
                };
            }

            if (e.NewEntry == true) {
                createEnclosureArr.push({
                    Id: uuidToBuffer(e.Id),
                    EnclosureTypeId: uuidToBuffer(e.EnclosureTypeId),
                    PropertyId: uuidToBuffer(propertyId),
                    Name: e.Name,
                    DSE: e.DSE,
                    AuditLogId: uuidToBuffer(e.AuditLogId),
                    UUID: e.Id,
                    DefaultGPS: obj.DefaultGPS,
                    EnclosureFence: obj.EnclosureFence ? JSON.stringify(obj.EnclosureFence) : null,
                    Area: obj.Area,
                    UoMId: obj.UoMId ? uuidToBuffer(obj.UoMId) : null
                });
                createAuditArr.push(e.AuditLogId);
            }
            else {
                enclosureConditionArr.push({ UUID: e.Id });
                updateEnclosureArr.push({
                    EnclosureTypeId: uuidToBuffer(e.EnclosureTypeId),
                    Name: e.Name,
                    DSE: e.DSE,
                    IsDeleted: e.IsDeleted,
                    DefaultGPS: obj.DefaultGPS,
                    EnclosureFence: obj.EnclosureFence ? JSON.stringify(obj.EnclosureFence) : null,
                    Area: obj.Area,
                    UoMId: obj.UoMId ? uuidToBuffer(obj.UoMId) : null
                });
                if (e.IsDeleted == 1)
                    deleteAuditArr.push(e.AuditLogId);
                else
                    updateAuditArr.push(e.AuditLogId);
            }
        });
    }
    else if (updateEnclosureDB) {
        map(enclosure, e => {
            if (e.NewEntry == true) {
                createEnclosureArr.push({
                    Id: uuidToBuffer(e.Id),
                    EnclosureTypeId: uuidToBuffer(e.EnclosureTypeId),
                    PropertyId: uuidToBuffer(propertyId),
                    Name: e.Name,
                    DSE: e.DSE,
                    AuditLogId: uuidToBuffer(e.AuditLogId),
                    UUID: e.Id
                });
                createAuditArr.push(e.AuditLogId);
            }
            else {
                enclosureConditionArr.push({ UUID: e.Id });
                updateEnclosureArr.push({
                    EnclosureTypeId: uuidToBuffer(e.EnclosureTypeId),
                    Name: e.Name,
                    DSE: e.DSE,
                    IsDeleted: e.IsDeleted
                });
                if (e.IsDeleted == 1)
                    deleteAuditArr.push(e.AuditLogId);
                else
                    updateAuditArr.push(e.AuditLogId);
            }
        });
    }
    else if (updateMapDB) {
        map(enclosureMap, e => {
            enclosureConditionArr.push({ UUID: e.Id });
            updateEnclosureArr.push({
                DefaultGPS: e.DefaultGPS,
                EnclosureFence: e.EnclosureFence ? JSON.stringify(e.EnclosureFence) : null,
                Area: e.Area,
                UoMId: e.UoMId ? uuidToBuffer(e.UoMId) : null
            });
            updateAuditArr.push(e.AuditLogId);
        });
        if (deletedEnclosureMap.length > 0) {
            map(deletedEnclosureMap, e => {
                enclosureConditionArr.push({ UUID: e.Id });
                updateEnclosureArr.push({
                    DefaultGPS: null,
                    EnclosureFence: null,
                    Area: null,
                    UoMId: null
                });
                updateAuditArr.push(e.AuditLogId);
            });
        }

        propertyObj.DefaultGPS = property.DefaultGPS;
        propertyObj.MapZoomLevel = property.MapZoomLevel;
        propertyObj.Area = property.Area;
        propertyObj.UoMId = property.UoMId ? uuidToBuffer(property.UoMId) : null;
        propertyObj.PropertyFence = property.PropertyFence ? JSON.stringify(property.PropertyFence) : null;
    }

    let accessObj = [];
    let accreditationObj = null;
    let picResponse = null;

    return validatePIC(propertyObj.PIC, property.PropertyTypeId, property.SuburbId, propertyId, language).then(function (res) {
        picResponse = res;
        if (res.isValidPic && !res.isDuplicatePIC) {
            if (defaultAccessData)
                return getDefaultAccessList(companyHierarchy.companyId, companyHierarchy.regionId, companyHierarchy.businessId, propertyId);
            else
                return access;
        }
        else
            return null;
    }).then(function (result) {
        if (!result) {
            if (!picResponse.isValidPic)
                return getResponse(400, resMessages.val_PicInvalid);
            else if (picResponse.isDuplicatePIC)
                return getResponse(400, resMessages.val_PicDuplicate);
        }
        else {
            map(result, id => {
                let accessId = newUUID();
                accessObj.push({
                    UUID: accessId,
                    Id: uuidToBuffer(accessId),
                    PropertyId: uuidToBuffer(propertyId),
                    ContactId: uuidToBuffer(id),
                    CreatedBy: uuidToBuffer(contactId)
                });
            });
            return new Promise((resolve, rej) => {
                if (retrieveStatus)
                    resolve(getPropAccredByPropId(propertyId, language));
                else resolve(false);
            }).then(function (resultAccreditation) {
                if (resultAccreditation && resultAccreditation.length > 0) {
                    accreditationObj = resultAccreditation;
                    return picErpStatus(property.NLISUsername, property.NLISPassword, property.PIC);
                }
                else return false;
            }).then(function (resultNLIS) {
                if (resultNLIS.status == HttpStatus.SUCCESS && resultNLIS.response.success) {
                    let NLISStatus = resultNLIS.response.response;
                    if (NLISStatus && NLISStatus.ProgramCode) {
                        let accProgram = accreditationObj.find(x => x.SystemCode == NLISStatus.ProgramCode);
                        if (accProgram) {
                            if (accreditation && accreditation.length > 0 && updateAccreditationDB) {
                                map(accreditation, a => {
                                    if (bufferToUUID(a.AccreditationProgramId) == accProgram.Id) {
                                        a.IsActive = (NLISStatus.StatusCode == 'A' ? true : false);
                                        a.Notes = NLISStatus.Description;
                                    }
                                });
                            }
                            else {
                                let accreditationUUID = newUUID();
                                accreditation.push({
                                    UUID: accreditationUUID,
                                    Id: uuidToBuffer(accreditationUUID),
                                    PropertyId: uuidToBuffer(propertyId),
                                    AccreditationProgramId: uuidToBuffer(accProgram.Id),
                                    IsActive: (NLISStatus.StatusCode == 'A' ? true : false),
                                    Notes: NLISStatus.Description
                                });
                                accredDeletedData.push(accProgram.PapId);
                            }
                        }
                    }
                }
                return updateTransaction(contactId, propertyId, createAuditArr, updateAuditArr, deleteAuditArr, propertyObj, fileObj, createEnclosureArr, updateEnclosureArr, enclosureConditionArr, accreditation, accredDeletedData, updateAccreditationDB, updateEnclosureDB, updateMapDB, accessObj, accessDeletedData, retrieveStatus).then(function (resProperty) {
                    if (resProperty.status == HttpStatus.SUCCESS && retrieveStatus)
                        resProperty.response.validNLIS = (resultNLIS.status == HttpStatus.SUCCESS);
                    return resProperty;
                });
            });
        }
    });
}

// save property data, related audit log and file storage data to database
let saveTransaction = (contactId, auditArr, propertyObj, fileObj, enclosureObj, accreditationObj, accessObj) => {
    var fileStorage = [];
    return models.sequelize.transaction(function (t) {
        return uploadFile(fileObj.BrandFile, propertyObj.UUID, 'property', 'brand').then(function (resBrand) {
            if (resBrand) {
                propertyObj.BrandFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: propertyObj.BrandFileId,
                    FileName: fileObj.BrandFile.storeName,
                    FilePath: resBrand.Location,
                    MimeType: fileObj.BrandFile.type
                });
            }
            return uploadFile(fileObj.LogoFile, propertyObj.UUID, 'property', 'logo');
        }).then(function (resLogo) {
            if (resLogo) {
                propertyObj.LogoFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: propertyObj.LogoFileId,
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
            return createProperty(propertyObj, t);
        }).then(function () {
            if (enclosureObj.length == 0)
                return true;
            return bulkCreateEnclosure(enclosureObj, t);
        }).then(function () {
            if (accreditationObj.length == 0)
                return true;
            return bulkCreatePropAccreditation(accreditationObj, t);
        }).then(function () {
            if (accessObj.length == 0)
                return true;
            return bulkCreatePropAccess(accessObj, t);
        });
    }).then(function (res) {
        if (fileObj.BrandFile) deleteServerFile(fileObj.BrandFile.name, true);
        if (fileObj.LogoFile) deleteServerFile(fileObj.LogoFile.name, true);
        return getResponse();
    }).catch(function (err) {
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// save property data, related audit log and file storage data to database
let updateTransaction = (contactId, propertyId, createAuditArr, updateAuditArr, deleteAuditArr, propertyObj, fileObj, createEnclosureArr, updateEnclosureArr, enclosureConditionArr, accreditation, accredDeletedData, updateAccreditationDB, updateEnclosureDB, updateMapDB, accessObj, accessDeletedObj, retrieveStatus) => {
    let fileStorage = [];
    let oldFileStorage = [];
    return models.sequelize.transaction(function (t) {
        if (fileObj.BrandDeletedFile)
            oldFileStorage.push({
                Id: fileObj.BrandFileId,
                FileName: fileObj.BrandDeletedFile.name
            });
        if (fileObj.LogoDeletedFile)
            oldFileStorage.push({
                Id: fileObj.LogoFileId,
                FileName: fileObj.LogoDeletedFile.name
            });
        return removeFileStorage(oldFileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH).then(function (result) {
            return uploadFile(fileObj.BrandFile, propertyId, 'property', 'brand');
        }).then(function (resBrand) {
            if (resBrand) {
                propertyObj.BrandFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: propertyObj.BrandFileId,
                    FileName: fileObj.BrandFile.storeName,
                    FilePath: resBrand.Location,
                    MimeType: fileObj.BrandFile.type
                });
            }
            return uploadFile(fileObj.LogoFile, propertyId, 'property', 'logo');
        }).then(function (resLogo) {
            if (resLogo) {
                propertyObj.LogoFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: propertyObj.LogoFileId,
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
            return createAudit(createAuditArr, contactId, t);
        }).then(function () {
            return updateAudit(updateAuditArr, deleteAuditArr, contactId, t);
        }).then(function () {
            return updateProperty(propertyObj, { UUID: propertyId }, t);
        }).then(function () {
            if (updateAccreditationDB)
                return removePropAccreditation({ PropertyId: uuidToBuffer(propertyId) }, t);
            else if (accredDeletedData.length > 0)
                return removePropAccreditation({ UUID: accredDeletedData }, t);
            else
                return true;
        }).then(function () {
            if (updateAccreditationDB && accreditation.length > 0)
                return bulkCreatePropAccreditation(accreditation, t);
            else if (retrieveStatus && accreditation.length > 0)
                return bulkCreatePropAccreditation(accreditation, t);
            else
                return true;
        }).then(function () {
            if ((updateEnclosureDB || updateMapDB) && createEnclosureArr.length > 0)
                return bulkCreateEnclosure(createEnclosureArr, t);
            else
                return true;
        }).then(function () {
            if ((updateEnclosureDB || updateMapDB) && updateEnclosureArr.length > 0) {
                let enclosurePromiseArr = [];
                for (var j = 0; j < updateEnclosureArr.length; j++) {
                    enclosurePromiseArr.push(updateEnclosure(updateEnclosureArr[j], enclosureConditionArr[j], t));
                }
                return Promise.all(enclosurePromiseArr);
            }
            else
                return true;
        }).then(function () {
            if (accessDeletedObj.length == 0)
                return true;
            return removePropAccess({ UUID: accessDeletedObj }, t);
        }).then(function () {
            if (accessObj.length == 0)
                return true;
            return bulkCreatePropAccess(accessObj, t);
        });
    }).then(function (res) {
        if (fileObj.BrandFile) deleteServerFile(fileObj.BrandFile.name, true);
        if (fileObj.LogoFile) deleteServerFile(fileObj.LogoFile.name, true);
        return getResponse();
    }).catch(function (err) {
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(500, err.toString());
    });
}

// Get property details by propertyId
let getDetail = (uuid, language) => {

    let responseData = null;
    if (uuid) {
        return getPropertyTypeBindings(language).then(function (propertyTypeRes) {
            responseData = { propertyTypeData: propertyTypeRes };
            return getPropertyDetailById(uuid, language);
        }).then(function (propertyRes) {
            let response = propertyRes.data[0];
            responseData.propertyData = response;

            let name = response.BusinessName ? response.BusinessName : response.CompanyName;
            let type = response.BusinessType ? response.BusinessType : response.CompanyType;
            responseData.companyHierarchy = { id: bufferToUUID(response.CompanyId), name: name, type: type };

            responseData.property = {
                AuditLogId: response.AuditLogId,
                PropertyTypeId: response.PropertyTypeId,
                PIC: response.PIC,
                Name: response.Name,
                DefaultGPS: response.DefaultGPS,
                MapZoomLevel: response.MapZoomLevel,
                Area: response.Area,
                UoMId: response.UoMId,
                PropertyFence: response.PropertyFence
            };

            responseData.PIC = {
                Address: response.Address,
                SuburbName: response.SuburbName,
                StateCode: response.StateCode,
                StateName: response.StateName,
                PostCode: response.PostCode,
                SuburbId: response.SuburbId,
                StateId: response.StateId,
                PropertyManagerId: response.PropertyManagerId,
                AsstPropertyManagerId: response.AsstPropertyManagerId,
                NLISUsername: response.NLISUsername,
                NLISPassword: response.NLISPassword,
                LivestockIdentifier: response.LivestockIdentifier,
                ExportEligibility: response.ExportEligibility ? JSON.parse(response.ExportEligibility) : [],
                BrandText: response.BrandText,
                EarmarkText: response.EarmarkText,
                BrandFile: {
                    FileId: response.BrandFileId,
                    FileName: response.BFileName,
                    MimeType: response.BMimeType,
                    FilePath: response.BFilePath
                },
                LogoFile: {
                    FileId: response.LogoFileId,
                    FileName: response.LFileName,
                    MimeType: response.LMimeType,
                    FilePath: response.LFilePath
                },
                countryId: bufferToUUID(response.BusinessCountryId)
            }

            return getPropertyMngrAsstMngr(response.CId, response.RId, response.BId);
        }).then(function (managerRes) {
            responseData.PIC.managerList = managerRes;
            return getEnclosureByPropertyId(uuid, language);
        }).then(function (enclosureRes) {
            responseData.enclosure = enclosureRes;
            return getAllEnclosureType(language);
        }).then(function (enclosureTypeRes) {
            responseData.enclosure.enclosureTypeData = enclosureTypeRes;
            return getPropAccredByPropId(uuid, language);
        }).then(function (propAccredRes) {
            responseData.accreditation = { data: propAccredRes };
            return getInActivePropAccredById(uuid);
        }).then(function (InActivePropAccredRes) {
            responseData.inActiveAccreditation = InActivePropAccredRes;
            return getState(language);
        }).then(function (stateRes) {
            responseData.accreditation.stateData = stateRes;
            return getPropertyAccess(responseData.propertyData.CId, responseData.propertyData.RId, responseData.propertyData.BId, uuid);
        }).then(function (accessRes) {
            responseData.access = accessRes;
            return getUomByMeasureByType(uomTypeCodes.Area, language);
        }).then(function (uomRes) {
            responseData.uomData = uomRes;
            return getResponse(200, null, { data: responseData });
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }
    else {
        return getPropertyTypeBindings(language).then(function (propertyTypeRes) {
            responseData = { propertyTypeData: propertyTypeRes };
            return getUomByMeasureByType(uomTypeCodes.Area, language);
        }).then(function (uomRes) {
            responseData.uomData = uomRes;
            return getResponse(200, null, { data: responseData });
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }
}

// Top PIC search by PIC,Name,Suburb
// and user permission
let propertySearch = (searchValue, contactId, companyId, isSiteAdministrator, isSuperUser) => {
    return getPropertySearch(searchValue, contactId, companyId, isSiteAdministrator, isSuperUser).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get property access list for permission
let getPropertyAccessList = (companyId, regionId, businessId, propertyId) => {
    return getPropertyAccess(companyId, regionId, businessId, propertyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// remove selected property
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }

    let totalCount = uuids.length;

    let newUUIDs = [];
    uuids.map(id => {
        newUUIDs.push(`'${id}'`);
    });

    return checkPropertyReference(newUUIDs).then(function (result) {
        result.map(d => {
            let index = uuids.findIndex(x => x == d.UUID);
            if (index != -1)
                uuids.splice(index, 1);
            let auditIndex = auditLogIds.findIndex(x => x == bufferToUUID(d.AuditLogId));
            if (auditIndex != -1)
                auditLogIds.splice(auditIndex, 1);
        });
        return true;
    }).then(function (result) {

        let deletedCount = uuids.length;
        let deleteObj = {
            IsDeleted: 1
        }
        let bufferIds = uuids.map(function (r) {
            return uuidToBuffer(r);
        });

        return models.sequelize.transaction(function (t) {
            return updateAudit([], auditLogIds, contactId, t).then(function () {
                return removePropAccreditation({ PropertyId: bufferIds }, t);
            }).then(function () {
                return removePropAccess({ PropertyId: bufferIds }, t);
            }).then(function () {
                return updateEnclosure(deleteObj, { PropertyId: bufferIds }, t);
            }).then(function () {
                return updateProperty(deleteObj, { Id: bufferIds }, t);
            });
        }).then(function (res) {
            return getResponse(HttpStatus.SUCCESS, null, { deletedCount: deletedCount, totalCount: totalCount });
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

let getMapDetail = (uuid, language) => {
    let responseData = {};
    return getProperties({ UUID: uuid }, ['DefaultGPS', 'PIC', 'MapZoomLevel', 'PropertyFence']).then(function (propertyRes) {
        responseData.property = propertyRes;
        return getEnclosureByPropertyId(uuid, language);
    }).then(function (enclosureRes) {
        responseData.enclosure = enclosureRes;
        return getResponse(200, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getPICManagerHierarchy = (propertyId, companyId, regionId, businessId) => {
    let resultset = null;
    let condition = `p.UUID = '${propertyId}'`;
    let joins = `LEFT JOIN contact cm ON cm.Id = p.PropertyManagerId
  LEFT JOIN contact ca ON ca.Id = p.AsstPropertyManagerId`;
    let columns = `p.UUID AS Id, PIC, AsstPropertyManagerId, PropertyManagerId, CONCAT(cm.FirstName, ' ', cm.LastName) AS PropertyManager,
   CONCAT(ca.FirstName, ' ', ca.LastName) AS AsstPropertyManager, p.NLISUsername, p.NLISPassword`;
    return getPropertyByCondition(condition, joins, columns).then(function (result) {
        resultset = { propertyManager: result };
        return getPropertyMngrAsstMngr(companyId, regionId, businessId).then(function (result) {
            resultset.manager = result
            return getResponse(200, null, { data: resultset });
        });
    })
}

let getInductionInitialDetail = (propertyId) => {
    return getInductionInitialData(propertyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get property by specific customization query
let getPropertyByCustomCondition = (select, join, where) => {
    return getPropertyByCondition(where, join, select).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { response: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get property data based on click of select all
let getAllPropertyData = (filterObj, language, contactId, isSiteAdmin) => {
    return getPropertyDataSet(null, null, 'asc', 'PIC', null, filterObj, language, contactId, isSiteAdmin).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response.data);
    });
}

module.exports = {
    getPropertyFilterData: Promise.method(getFilterData),
    getPropertyDataSet: Promise.method(getDataSet),
    findProperty: Promise.method(findProperty),
    getEnclosureDataSetById: Promise.method(getEnclosureDataSetById),
    getPropertyMngrAsstMngr: Promise.method(getMngrAsstMngr),
    getDataByHierarchy: Promise.method(getAllDataByHierarchy),
    getDataOnAccreditation: Promise.method(getDataOnAccreditation),
    createProperty: Promise.method(create),
    updateProperty: Promise.method(update),
    getPropertyDetail: Promise.method(getDetail),
    propertySearch: Promise.method(propertySearch),
    getPropertyAccessList: Promise.method(getPropertyAccessList),
    deleteProperty: Promise.method(remove),
    getMapDetail: Promise.method(getMapDetail),
    getPICManagerHierarchy: Promise.method(getPICManagerHierarchy),
    getInductionInitialDetail: Promise.method(getInductionInitialDetail),
    getPropertyByCustomCondition: Promise.method(getPropertyByCustomCondition),
    getAllPropertyData: Promise.method(getAllPropertyData)
}