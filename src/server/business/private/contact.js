'use strict';

/***********************************
 * Logic related to edit user profile
 * *********************************/

import Promise from 'bluebird';
import {
    getUserDetails, getAccessiblePICs as getAccessiblePICData,
    getUserRegionRoles as getUserRegionRoleData, getUserBusinessRoles as getUserBusinessRoleData,
    getContactDataSet, getContactById, createContact, getContactByUserName,
    findContact as searchContact, getContactCurrentRoles, getContact, superuserCount, getContactSearch,
    getPropertyAccessContacts, getContactByCondition, getTransporterCompany, getSaleAgentCompany
} from '../../repository/contact';
import { updateCompany as updateCompanyData } from '../../repository/company';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../shared/uuid';
import { userRole } from '../../../shared';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import { bulkCreateFileStorage } from '../../repository/filestorage';
import { deleteServerFile } from './file-middleware';
import { getPropertiesByCompany } from '../../repository/property';
import { bulkCreatePropAccess, removePropAccess } from '../../repository/propertyaccess';
import { encryptPassword, checkPassword } from '../../auth/password-auth';
import { createAudit, updateAudit, deleteFile, uploadFile, removeFileStorage, updateContact } from './common';
import { updateProperty } from '../../repository/property';
import models from '../../schema';
import { uniq } from 'lodash';
import { serviceTypes } from '../../../shared/constants';

var crypto = require('crypto');
const ORIGINAL_FILE_PATH = '/contact/original/';
const THUMB_FILE_PATH = '/contact/thumb/';

// perform server validations
let serverValidations = (userObj) => {
    if (!userObj.firstName) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1095');
    }
    else if (!userObj.lastName) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1096');
    }
    else if (!userObj.email) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1097');
    }
    else if (userObj.firstName.length > 50) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1098');
    }
    else if (userObj.lastName.length > 50) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1099');
    }
    else if (userObj.email.length > 100) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1100');
    }
    else if (!userObj.companyId) {
        return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1101');
    }
    return null;
}

// common method to get add/update contact object
let getSaveObj = (userObj) => {
    let contactObj = {
        FirstName: userObj.firstName,
        LastName: userObj.lastName,
        Mobile: userObj.mobile,
        Telephone: userObj.telephone,
        Fax: userObj.fax,
        Email: userObj.email,
        BusinessAddress: userObj.address,
        BusinessSuburbId: userObj.businessSuburb.suburbId ? uuidToBuffer(userObj.businessSuburb.suburbId) : null,
        BusinessStateId: userObj.businessSuburb.stateId ? uuidToBuffer(userObj.businessSuburb.stateId) : null,
        BusinessPostCode: userObj.businessSuburb.suburbPostCode,
        PostalAddress: userObj.postaladdress,
        PostalSuburbId: userObj.postalSuburb.suburbId ? uuidToBuffer(userObj.postalSuburb.suburbId) : null,
        PostalStateId: userObj.postalSuburb.stateId ? uuidToBuffer(userObj.postalSuburb.stateId) : null,
        PostalPostCode: userObj.postalSuburb.suburbPostCode,
        VehicleRegNumber: userObj.vehicalrego,
        SaleAgentCode: userObj.saleagentcode,
        IsNvdSignatureAllowed: userObj.isNvdSignatureAllowed ? 1 : 0,
        PreferredLanguage: userObj.preferredLanguage,
        CompanyId: uuidToBuffer(userObj.companyId),
        IsPrivate: userObj.isPrivateContact != undefined ? userObj.isPrivateContact == true ? 1 : 0 : 0,
        IsActive: userObj.isActiveContact != undefined ? userObj.isActiveContact == true ? 1 : 0 : 0,
        IsSuperUser: userObj.isSuperUser != undefined ? userObj.isSuperUser == true ? 1 : 0 : userObj.isSuperUser,
        ContactCode: userObj.contactCode,
        BadgeNumber: userObj.badgenumber
    }
    return contactObj;
}

let addPropertyAccess = (isSuperUser, companyId, RMIds, BMIds) => {

    return new Promise((res, rej) => {
        let condition = null;
        if (isSuperUser) {
            condition = {
                $or: {
                    Id: companyId,
                    CompanyId: companyId
                }
            }
        }
        else if (RMIds.length > 0) {
            if (BMIds.length > 0)
                RMIds.push(...BMIds);
            condition = {
                $or: {
                    Id: RMIds,
                    RegionId: RMIds
                }
            }
        }
        else if (BMIds.length > 0) {
            condition = {
                Id: BMIds
            }
        }
        if (condition) {
            return getPropertiesByCompany(condition).then(function (result) {
                let res1 = uniq(result);
                res(res1);
                return res1;
            }).catch(function (err) {
                throw new Error(err);
            });
        }
        else {
            res([]);
        }
    });
}

// create new contact
let create = (userObj, contactId) => {
    let response = serverValidations(userObj);
    if (response != null)
        return response;

    let newId = newUUID();
    let auditId = newUUID();
    let auditArr = [];
    let updateCompany = [];
    let updateCompanyCondition = [];

    auditArr.push(auditId);

    let contactObj = getSaveObj(userObj);
    contactObj.Id = uuidToBuffer(newId);
    contactObj.UUID = newId;
    contactObj.AuditLogId = uuidToBuffer(auditId);

    // File object
    let fileObj = {
        AvatarFileId: userObj.avatarObj.fileId,
        AvatarDeletedFile: userObj.avatarObj.deletedFile,
        AvatarFile: userObj.avatarObj.file,
        SignatureFileId: userObj.signaturePicObj.fileId,
        SignatureDeletedFile: userObj.signaturePicObj.deletedFile,
        SignatureFile: userObj.signaturePicObj.file
    }

    userObj.Id = newId;
    if (userObj.username && userObj.password) {
        let salt = crypto.randomBytes(32).toString('hex');
        contactObj.PasswordSalt = salt;
        contactObj.PasswordHash = encryptPassword(salt, userObj.password);
        contactObj.UserName = userObj.username;
        let RMIds = [];
        let BMIds = [];

        userObj.assignedRegionRoles.map((regionRole) => {
            if (regionRole.RoleName != userRole.noAccess) {
                updateCompany.push(regionRole.RoleName.indexOf('Asst') != -1 ? {
                    AsstManagerId: uuidToBuffer(newId)
                } : {
                        ManagerId: uuidToBuffer(newId)
                    });
                updateCompanyCondition.push({
                    Id: new Buffer(regionRole.CompanyId.data)
                });
                RMIds.push(new Buffer(regionRole.CompanyId.data));
            }
        });
        userObj.assignedBusinessRoles.map((businessRole) => {
            if (businessRole.RoleName != userRole.noAccess) {
                updateCompany.push(businessRole.RoleName.indexOf('Asst') != -1 ? {
                    AsstManagerId: uuidToBuffer(newId)
                } : {
                        ManagerId: uuidToBuffer(newId)
                    });
                updateCompanyCondition.push({
                    Id: new Buffer(businessRole.CompanyId.data)
                });
                BMIds.push(new Buffer(regionRole.CompanyId.data));
            }
        });
        if (userObj.assignProperty) {
            return addPropertyAccess(contactObj.IsSuperUser, contactObj.CompanyId, RMIds, BMIds)
                .then(function (res) {
                    let propertyAccessObj = [];
                    res.map((accessProeprty) => {
                        let accessId = newUUID();
                        propertyAccessObj.push({
                            Id: uuidToBuffer(accessId),
                            UUID: accessId,
                            CreatedBy: uuidToBuffer(contactId),
                            ContactId: uuidToBuffer(userObj.Id),
                            PropertyId: uuidToBuffer(accessProeprty.Id)
                        });
                    });
                    return saveTransaction(userObj, contactObj, auditArr, updateCompany, updateCompanyCondition,
                        fileObj, contactId, propertyAccessObj);
                });
        }
    }
    return saveTransaction(userObj, contactObj, auditArr, updateCompany, updateCompanyCondition,
        fileObj, contactId);
    // return manageUploadAndSave(userObj, contactId, contactObj, auditObj, null, updateCompany, updateCompanyCondition);
}

// update existing contact/user
let update = (userObj, contactId) => {
    let response = serverValidations(userObj);
    if (response != null) {
        return response;
    }

    let updateAuditArr = [];
    let updateCompany = [];
    let updateCompanyCondition = [];

    let contactObj = getSaveObj(userObj);

    if (userObj.username && userObj.password) {
        let salt = crypto.randomBytes(32).toString('hex');
        contactObj.PasswordSalt = salt;
        contactObj.PasswordHash = encryptPassword(salt, userObj.password);
        contactObj.UserName = userObj.username;
    }
    updateAuditArr.push(bufferToUUID(userObj.auditId));

    // File object
    let fileObj = {
        AvatarFileId: userObj.avatarObj.fileId,
        AvatarDeletedFile: userObj.avatarObj.deletedFile,
        AvatarFile: userObj.avatarObj.file,
        SignatureFileId: userObj.signaturePicObj.fileId,
        SignatureDeletedFile: userObj.signaturePicObj.deletedFile,
        SignatureFile: userObj.signaturePicObj.file
    }

    if (userObj.username && userObj.assignProperty) {
        let RMIds = [];
        let BMIds = [];
        let BMUUIDs = [];
        // let removedRMIds = [];
        // let removedBMIds = [];
        let filterBusinessIds = [];
        return getContactCurrentRoles(userObj.Id, userObj.companyId).then(function (currentRoles) {
            let currentRegionRoles = currentRoles.data.filter((currentRole) => {
                return (currentRole.CurrentRole != null && currentRole.CurrentRole.indexOf('Region') != -1);
            });

            let currentBusinessRoles = currentRoles.data.filter((currentRole) => {
                return (currentRole.CurrentRole != null && currentRole.CurrentRole.indexOf('Business') != -1);
            });

            let cuurentPropertyRoles = currentRoles.propertyRoles.filter((currentPropertyRole) => {
                return currentPropertyRole.CurrentRole != null;
            });

            userObj.assignedRegionRoles.map((regionRole) => {
                let item = currentRegionRoles.find((currRole) => {
                    return (bufferToUUID(currRole.Id) == bufferToUUID(regionRole.CompanyId) &&
                        currRole.CurrentRole != null);
                });
                if (item) {
                    updateCompany.push(item.CurrentRole.indexOf('Asst') != -1 ?
                        { AsstManagerId: null } :
                        { ManagerId: null });
                    updateCompanyCondition.push({
                        Id: new Buffer(item.Id.data)
                    });
                }

                let updateObj = null;
                if (regionRole.RoleName != userRole.noAccess) {
                    if (regionRole.RoleName.indexOf('Asst') != - 1)
                        updateObj = { AsstManagerId: uuidToBuffer(userObj.Id) }
                    else
                        updateObj = { ManagerId: uuidToBuffer(userObj.Id) }
                }
                else {
                    // console.log(bufferToUUID(regionRole.CompanyId.data));
                    currentRoles.data.filter((cbr) => {
                        if (bufferToUUID(cbr.ParentId.data) == bufferToUUID(regionRole.CompanyId.data))
                            filterBusinessIds.push(bufferToUUID(cbr.Id).toString());
                    });
                    // removedRMIds.push(new Buffer(regionRole.CompanyId.data));
                }
                if (updateObj) {
                    updateCompany.push(updateObj);

                    updateCompanyCondition.push({
                        Id: new Buffer(regionRole.CompanyId.data)
                    });
                    RMIds.push(new Buffer(regionRole.CompanyId.data));
                }
            });

            userObj.assignedBusinessRoles.map((businessRole) => {

                let item = currentBusinessRoles.find((currRole) => {
                    return (bufferToUUID(currRole.Id) == bufferToUUID(businessRole.CompanyId) &&
                        currRole.CurrentRole != null);
                });
                if (item) {
                    updateCompany.push(item.CurrentRole.indexOf('Asst') != -1 ?
                        { AsstManagerId: null } :
                        { ManagerId: null });
                    updateCompanyCondition.push({
                        Id: new Buffer(item.Id.data)
                    });
                }

                let updateObj = null;
                if (businessRole.RoleName != userRole.noAccess) {
                    if (businessRole.RoleName.indexOf('Asst') != - 1)
                        updateObj = { AsstManagerId: uuidToBuffer(userObj.Id) }
                    else
                        updateObj = { ManagerId: uuidToBuffer(userObj.Id) }
                }
                else {
                    let regionId = null;
                    currentRoles.data.map((cr) => {
                        if (bufferToUUID(businessRole.CompanyId) == bufferToUUID(cr.Id)) {
                            regionId = bufferToUUID(cr.ParentId);
                        }
                    });
                    userObj.assignedRegionRoles.map((arr) => {
                        if (bufferToUUID(arr.CompanyId) == regionId && arr.CurrentRole == userRole.noAccess) {
                            filterBusinessIds.push(bufferToUUID(businessRole.CompanyId));
                        }
                    });
                }
                if (updateObj) {
                    updateCompany.push(updateObj);

                    updateCompanyCondition.push({
                        Id: new Buffer(businessRole.CompanyId.data)
                    });
                    BMIds.push(new Buffer(businessRole.CompanyId.data));
                    BMUUIDs.push(bufferToUUID(businessRole.CompanyId).toString());
                }
            });

            filterBusinessIds = filterBusinessIds.filter((bId) => {
                return BMUUIDs.indexOf(bId) == -1;
            });

            let propertyManId = [];
            let propertyAssManId = [];

            cuurentPropertyRoles.map((cpr) => {
                if (cpr.CompanyType == 'C' || filterBusinessIds.indexOf(bufferToUUID(cpr.CompanyId)) != -1) {
                    if (cpr.CurrentRole.indexOf('Asst') == -1)
                        propertyManId.push(new Buffer(cpr.Id.data));
                    else
                        propertyAssManId.push(new Buffer(cpr.Id.data));
                }
            });

            // if (!contactObj.IsSuperUser) {

            // }
            return addPropertyAccess(contactObj.IsSuperUser, contactObj.CompanyId, RMIds, BMIds)
                .then(function (res) {
                    let propertyAccessObj = [];
                    res.map((accessProeprty) => {
                        let accessId = newUUID();
                        propertyAccessObj.push({
                            Id: uuidToBuffer(accessId),
                            UUID: accessId,
                            CreatedBy: uuidToBuffer(contactId),
                            ContactId: uuidToBuffer(userObj.Id),
                            PropertyId: uuidToBuffer(accessProeprty.Id)
                        })
                    });
                    return updateTransaction(userObj, fileObj, contactId, contactObj, updateAuditArr,
                        updateCompany, updateCompanyCondition, propertyAccessObj, propertyManId, propertyAssManId);
                });
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    }
    else {
        return updateTransaction(userObj, fileObj, contactId, contactObj, updateAuditArr, updateCompany,
            updateCompanyCondition);
    }
}

// save contact data, related audit log and file storage data to database
let saveTransaction = (userObj, contactObj, auditArr, updateCompany, updateCompanyCondition, fileObj,
    contactId, propertyAccessObj = []) => {
    var fileStorage = [];
    let id = userObj.Id || contactId;
    return models.sequelize.transaction(function (t) {
        return uploadFile(fileObj.AvatarFile, id, 'contact', 'avatar').then(function (resAvatar) {
            if (resAvatar) {
                contactObj.AvatarFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: contactObj.AvatarFileId,
                    FileName: fileObj.AvatarFile.storeName,
                    FilePath: resAvatar.Location,
                    MimeType: fileObj.AvatarFile.type
                });
            }
            return uploadFile(fileObj.SignatureFile, id, 'contact', 'sig');
        }).then(function (resSig) {
            if (resSig) {
                contactObj.SignatureFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: contactObj.SignatureFileId,
                    FileName: fileObj.SignatureFile.storeName,
                    FilePath: resSig.Location,
                    MimeType: fileObj.SignatureFile.type
                });
            }
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return createAudit(auditArr, contactId, t);
        }).then(function () {
            return createContact(contactObj, t);

        }).then(function () {
            let updateCompanyArr = [];
            for (var i = 0; i < updateCompany.length; i++) {
                updateCompanyArr.push(updateCompanyData(updateCompany[i], updateCompanyCondition[i], t));
            }
            return Promise.all(updateCompanyArr);
        }).then(function () {
            return bulkCreatePropAccess(propertyAccessObj, t);
        });
    }).then(function (res) {
        if (fileObj.AvatarFile) deleteServerFile(fileObj.AvatarFile.name, true);
        if (fileObj.SignatureFile) deleteServerFile(fileObj.SignatureFile.name, true);
        return getResponse();
    }).catch(function (err) {
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// update contact(user) data, related audit log and file storage data to database
let updateTransaction = (userObj, fileObj, contactId, contactObj, updateAuditArr, updateCompany,
    updateCompanyCondition, propertyAccessObj = [], propertyManId = [], propertyAssManId = []) => {
    let contactCondition = {
        Id: userObj.Id ? uuidToBuffer(userObj.Id) : uuidToBuffer(contactId)
    }
    let fileStorage = [];
    let oldFileStorage = [];
    let id = userObj.Id || contactId;

    return models.sequelize.transaction(function (t) {
        if (fileObj.AvatarDeletedFile)
            oldFileStorage.push({
                Id: fileObj.AvatarFileId,
                FileName: fileObj.AvatarDeletedFile.name
            });
        if (fileObj.SignatureDeletedFile)
            oldFileStorage.push({
                Id: fileObj.SignatureFileId,
                FileName: fileObj.SignatureDeletedFile.name
            });

        return removeFileStorage(oldFileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH).then(function (result) {
            return uploadFile(fileObj.AvatarFile, id, 'contact', 'avatar');
        }).then(function (resAvatar) {
            if (resAvatar) {
                contactObj.AvatarFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: contactObj.AvatarFileId,
                    FileName: fileObj.AvatarFile.storeName,
                    FilePath: resAvatar.Location,
                    MimeType: fileObj.AvatarFile.type
                });
            }
            return uploadFile(fileObj.SignatureFile, id, 'contact', 'sig');
        }).then(function (resSig) {
            if (resSig) {
                contactObj.SignatureFileId = uuidToBuffer(newUUID());
                fileStorage.push({
                    Id: contactObj.SignatureFileId,
                    FileName: fileObj.SignatureFile.storeName,
                    FilePath: resSig.Location,
                    MimeType: fileObj.SignatureFile.type
                });
            }
            if (fileStorage.length > 0)
                return bulkCreateFileStorage(fileStorage, t);
            else
                return true;
        }).then(function () {
            return updateAudit(updateAuditArr, [], contactId, t);
        }).then(function () {
            return updateContact(contactObj, contactCondition, t)
        }).then(function () {
            let updateCompanyArr = [];
            for (var i = 0; i < updateCompany.length; i++) {
                updateCompanyArr.push(updateCompanyData(updateCompany[i], updateCompanyCondition[i], t));
            }
            return Promise.all(updateCompanyArr);
        }).then(function () {
            if (userObj.assignProperty)
                return removePropAccess({ ContactId: uuidToBuffer(userObj.Id), IsExternal: { $ne: 1 } });
            else
                return true;
        }).then(function () {
            if (userObj.assignProperty)
                return bulkCreatePropAccess(propertyAccessObj, t);
            else
                return true;
        }).then(function () {
            if (!userObj.IsSuperUser)
                return updateProperty({ PropertyManagerId: null }, { Id: propertyManId }, t);
            else
                return true;
        }).then(function () {
            if (!userObj.IsSuperUser)
                return updateProperty({ AsstPropertyManagerId: null }, { Id: propertyAssManId }, t);
            else
                return true;
        });
    }).then(function (res) {
        if (fileObj.AvatarFile) deleteServerFile(fileObj.AvatarFile.name, true);
        if (fileObj.SignatureFile) deleteServerFile(fileObj.SignatureFile.name, true);
        return getResponse();
    }).catch(function (err) {
        deleteFile(fileStorage, ORIGINAL_FILE_PATH, THUMB_FILE_PATH);
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language) => {
    return getContactDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get contact details by Id
let getDetail = (id, language) => {
    return getUserDetails(id, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get accessible PICs to contact
let getAccessiblePICs = (id, language, isSiteAdministrator) => {
    return getAccessiblePICData(id, language, isSiteAdministrator).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get role for regions of user
let getUserRegionRoles = (contactId, companyId) => {
    return getUserRegionRoleData(contactId, companyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get role for business unit of user
let getUserBusinessRoles = (contactId, companyId) => {
    return getUserBusinessRoleData(contactId, companyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// set password to selected contact
let setPassword = (contactId, loggedinPassword, newPassword, selectedId) => {
    if (newPassword.length < 8) {
        return getResponse(HttpStatus.BAD_REQUEST, 'MUST_CHAR_REQ_MESSAGE');
    }

    return getContactById(contactId).then(function (user) {
        if (!user) {
            return getResponse(HttpStatus.UNAUTHORIZED, resMessages.unauthorized);
        }
        if (!checkPassword(loggedinPassword, user.PasswordSalt, user.PasswordHash)) {
            return getResponse(HttpStatus.BAD_REQUEST, 'EXISTING_PASSWORD_NOT_MATCH');
        }
        return getContactById(selectedId).then(function (contact) {
            if (contact.Email == newPassword) {
                return getResponse(HttpStatus.BAD_REQUEST, 'ERROR_PASS_IS_EMAIL');
            }
            if (!contact.PasswordSalt) {
                return getResponse(HttpStatus.BAD_REQUEST, 'ERROR_IS_NOT_USER');
            }

            let contactObj = {
                PasswordHash: encryptPassword(contact.PasswordSalt, newPassword)
            }
            let condition = {
                UUID: selectedId
            }
            return updateContact(contactObj, condition).then(function (rr) {
                return getResponse();
            }).catch(function (err) {
                return getResponse(HttpStatus.SERVER_ERROR, err.toString());
            });
        });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// remove selected contacts
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }

    let contactObj = {
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
        return updateAudit(auditLogIds, [], contactId, t).then(function () {
            return updateContact(contactObj, { UUID: uuids }, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// check duplicate username
let checkDupEmail = (email) => {
    return getContactByUserName(email).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let findContact = (obj) => {
    try {
        let valid = false;

        // validate model
        if ((obj.companyName != null && obj.companyName.length > 0) ||
            (obj.businessName != null && obj.businessName.length > 0) ||
            (obj.contactName != null && obj.contactName.length > 0) ||
            (obj.suburbId != null && obj.suburbId.length > 0) ||
            (obj.abn != null && obj.abn.length > 0) ||
            (obj.acn != null && obj.acn.length > 0)) {
            valid = true;
        }

        if (!valid) {
            return getResponse(HttpStatus.BAD_REQUEST, "At least one value is required");
        }

        return searchContact(obj).then(function (response) {
            return getResponse(HttpStatus.SUCCESS, null, { data: response });
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    }
    catch (e) {
        return getResponse(HttpStatus.SERVER_ERROR, e.toString());
    }
}

// get all contacts
let getAll = (companyId) => {
    return getContact(companyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

// update selected property to the preference
let setDefaultPIC = (contactId, propertyId) => {
    if (contactId == null || contactId == undefined || contactId.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, 'ContactId is required');
    }
    if (propertyId == null || propertyId == undefined || propertyId.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, 'PropertyId is required');
    }

    return getContactById(contactId).then(function (response) {
        if (response == null) {
            throw new Error("Contact does not exist");
        }
        return response;
    }).then(function (contact) {
        let updateAuditArr = [];
        if (contact.AuditLogId != null)
            updateAuditArr.push(bufferToUUID(contact.AuditLogId));
        contact.PreferredPropertyId = uuidToBuffer(propertyId);

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditArr, [], contactId, t)
                .then(function () {
                    return updateContact(contact, { UUID: contactId }, t);
                });
        })
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getSuperuserCount = (companyId, contactId) => {
    return superuserCount(companyId, contactId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

// search contact by name
let getContactListSearch = (search, companyId) => {
    return getContactSearch(search, companyId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

// get list of contact to whoom property is accessible
let getPropertyAccessContactList = (propertyId, includePICAccess) => {
    return getPropertyAccessContacts(propertyId, includePICAccess).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

// get contact by specific customization query
let getContactByCustomCondition = (select, join, where) => {
    return getContactByCondition(where, join, select).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { response: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get list of transporter company
let getTransporterCompanySearch = (search) => {
    return getTransporterCompany(search, serviceTypes.Transporter).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get list of Sale Agent company
let getSaleAgentCompanySearch = (search) => {
    return getSaleAgentCompany(search, serviceTypes.SaleAgent).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get contact data based on click of select all
let getAllContactData = (filterObj, language) => {
    return getContactDataSet(null, null, 'asc', 'Name', null, filterObj, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    getUserDetail: Promise.method(getDetail),
    getUserRegionRoles: Promise.method(getUserRegionRoles),
    getUserBusinessRoles: Promise.method(getUserBusinessRoles),
    getAccessiblePICs: Promise.method(getAccessiblePICs),
    getContactDataSet: Promise.method(getDataSet),
    checkDupEmail: Promise.method(checkDupEmail),
    findContact: Promise.method(findContact),
    createContact: Promise.method(create),
    updateUserDetail: Promise.method(update),
    deleteContacts: Promise.method(remove),
    getAllContact: Promise.method(getAll),
    setDefaultPIC: Promise.method(setDefaultPIC),
    setPassword: Promise.method(setPassword),
    getSuperuserCount: Promise.method(getSuperuserCount),
    getContactListSearch: Promise.method(getContactListSearch),
    getPropertyAccessContactList: Promise.method(getPropertyAccessContactList),
    getContactByCustomCondition: Promise.method(getContactByCustomCondition),
    getTransporterCompanySearch: Promise.method(getTransporterCompanySearch),
    getSaleAgentCompanySearch: Promise.method(getSaleAgentCompanySearch),
    getAllContactData: Promise.method(getAllContactData)
}