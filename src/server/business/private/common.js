'use strict';

/***********************************
 * Logic related to common api
 * *********************************/

import Promise from 'bluebird';
import cache from '../../lib/cache-manager';
import axios from 'axios';

import { map } from 'lodash';
import { updateContactDetail } from '../../repository/contact';
import { getHierarchy, getHierarchyIds } from '../../repository/company';
import { checkPIC } from '../../repository/property';
import { getPropertyTypeById } from '../../repository/propertytype';
import { getSuburbDetail } from '../../repository/suburb';
import { bulkCreateAuditLog, updateAuditLog } from '../../repository/auditlog';
import { removeFileStorage } from '../../repository/filestorage';
import { HttpStatus, getResponse, resMessages } from '../../lib/index';
import { toEmptyStr, isUUID } from '../../../shared/format/string';
import { uuidToBuffer, bufferToUUID } from '../../../shared/uuid/index';
import { upload as s3_upload, deleteObjects as s3_delete } from '../../../../aws/s3';
import { getFileExtension, picValidation } from '../../../shared';

var path = require('path');
var fs = require('fs');

// perform server validations
let serverValidations = (pic) => {
    if (!pic) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.val_PicReq);
    }
    else if (pic.length != 8) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.val_PicInvalid);
    }
    return null;
}

// get company hierarchy
let getCompanyHierarchy = (companyId, regionId, businessId, siteAdmin, superUser, contactId, regionDisabled) => {

    companyId = companyId ? "'" + companyId + "'" : null;
    regionId = regionId ? "'" + regionId + "'" : null;
    businessId = businessId ? "'" + businessId + "'" : null;
    contactId = contactId ? "'" + contactId + "'" : null;

    return getHierarchy(companyId, regionId, businessId, siteAdmin, superUser, contactId, regionDisabled).then(function (response) {
        return getResponse(200, null, { ...response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get ids of company hierarchy
let getCompanyHierarchyIds = (id) => {
    return getHierarchyIds(id).then(function (response) {
        return getResponse(200, null, { ...response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// check PIC duplication
let checkDuplicatePIC = (pic, propertyId) => {
    let response = serverValidations(pic);
    if (response != null)
        return response;

    return checkPIC(pic, propertyId).then(function (result) {
        return getResponse(200, null, { isDuplicatePIC: !result });
    });
}

// validate PIC at server end based on propertyTypeId and suburbId
let validatePIC = (pic, propertyTypeId = null, suburbId = null, propertyId = null, language = 'en') => {
    let response = serverValidations(pic);
    if (response != null)
        return response;

    let propertySystemCode = null;
    let stateSystemCode = null;
    let promiseArr = [];
    if (propertyTypeId)
        promiseArr.push(getPropertyTypeById(propertyTypeId, language).then(function (res) {
            propertySystemCode = res ? res.SystemCode : null;
        }));
    if (suburbId)
        promiseArr.push(getSuburbDetail(suburbId, language).then(function (res) {
            stateSystemCode = res ? res.StateSystemCode : null;
        }));

    let isValidPic = false;
    return Promise.all(promiseArr).then(function () {
        isValidPic = picValidation(pic, propertySystemCode, stateSystemCode);
        if (isValidPic)
            return checkPIC(pic, propertyId);
        else
            return false;
    }).then(function (result) {
        return { isValidPic: isValidPic, isDuplicatePIC: !result };
    });

}

// Upload file to S3
let uploadFile = (pictureObj, nameParam, moduleName, category, internalPath = null, additionalPath = null, isThumb = true) => {
    if (pictureObj) {
        let ext = getFileExtension(pictureObj.name)
        pictureObj.path = path.join(__dirname, '../../../../uploads/', pictureObj.name);
        pictureObj.storeName = `${nameParam}_${category}.${ext}`;
        if (isThumb) additionalPath = 'original';
        let uploadObj = s3_upload(pictureObj, moduleName, internalPath, additionalPath);
        if (uploadObj && isThumb) {
            uploadObj.then(function (ret) {
                // console.log(ret);
            }, function (err) {
                // console.log(err);
            });
            pictureObj.path = path.join(__dirname, '../../../../uploads/thumbs/', pictureObj.name);
            return s3_upload(pictureObj, moduleName, internalPath, 'thumb');
        }
        else {
            return uploadObj;
        }
    }
    else
        return null;
}

// Delete storage file records from db and remove file from S3
let removeFile = (fileStorage, imagePath, thumbPath) => {
    if (fileStorage.length > 0) {
        let Ids = [];
        fileStorage.map(f => {
            Ids.push(new Buffer(f.Id));
        });
        removeFileStorage({ Id: Ids }).then(function (result) {
            deleteFile(fileStorage, imagePath, thumbPath);
        }).catch(function (err) {
            throw err;
        });
    }
    else
        return null;
}

// Delete files from S3
let deleteFile = (fileStorage, imagePath, thumbPath, additionalPath) => {
    let files = [];
    if (fileStorage.length > 0) {
        fileStorage.map((fileObj) => {
            files.push({ storeName: imagePath + fileObj.FileName });
            if (thumbPath) files.push({ storeName: thumbPath + fileObj.FileName });
            if (additionalPath) files.push({ storeName: additionalPath + fileObj.FileName });
        });
        s3_delete(files, function (err, ret) { });
        return true;
    }
    return null;
}

// Create AuditLog
let createAudit = (arr, contactId, t) => {
    if (arr.length > 0) {
        let auditLogArr = [];
        map(arr, d => {
            auditLogArr.push({
                Id: uuidToBuffer(d),
                UUID: d,
                CreatedBy: uuidToBuffer(contactId),
                CreatedStamp: new Date(),
                CreatedFromSource: 'web'
            });
        });
        return bulkCreateAuditLog(auditLogArr, t).then(function (result) {
            return result;
        });
    }
    else
        return null;
}

// Update/Delete AuditLog
let updateAudit = (updateArr = [], deleteArr = [], contactId, t) => {
    if (updateArr.length > 0 || deleteArr.length > 0) {
        let auditLogArr = [];
        let conditionArr = [];
        map(updateArr, d => {
            auditLogArr.push({
                ModifiedBy: uuidToBuffer(contactId),
                ModifiedStamp: new Date(),
                ModifiedFromSource: 'web'
            });
            if (isUUID(d))
                conditionArr.push({ UUID: d });
            else
                conditionArr.push({ Id: new Buffer(d) });
        });
        map(deleteArr, d => {
            auditLogArr.push({
                DeletedBy: uuidToBuffer(contactId),
                DeletedStamp: new Date(),
                DeletedFromSource: 'web'
            });
            if (isUUID(d))
                conditionArr.push({ UUID: d });
            else
                conditionArr.push({ Id: new Buffer(d) });
        });

        let auditPromiseArr = [];
        for (var j = 0; j < auditLogArr.length; j++) {
            auditPromiseArr.push(updateAuditLog(auditLogArr[j], conditionArr[j], t));
        }
        return Promise.all(auditPromiseArr).then(function (result) {
            return result;
        }).catch(function (err) {
            throw new Error(err);
        });
    }
    else
        return null;
}

// update contact record to DB
let updateContact = (obj, condition, trans = null) => {
    let updateRes = null;
    return updateContactDetail(obj, condition, trans).then(function (result) {
        updateRes = result.updateRes;
        let contactRes = result.contactRes;
        let tokenRes = result.tokenRes;
        let cachePromise = [];
        map(tokenRes, r => {
            let token = r.Token;
            cachePromise.push(cache.getAsync(token).then(function (cacheRes) {
                if (cacheRes) {
                    cache.setString(token, JSON.stringify({
                        ContactId: contactRes.UUID,
                        CompanyId: bufferToUUID(contactRes.CompanyId),
                        IsSiteAdministrator: contactRes.IsSiteAdministrator,
                        IsAgliveSupportAdmin: contactRes.IsAgliveSupportAdmin,
                        IsSuperUser: contactRes.IsSuperUser
                    }));
                }
            }));
        });
        return Promise.all(cachePromise);
    }).then(function () {
        return updateRes;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let downloadFile = (pathname, name, type) => {
    var http = require('https');
    let filePath = path.join(__dirname, '../../../../uploads/', name);
    let file = fs.createWriteStream(filePath);

    http.get(pathname, function (res) {
        res.pipe(file);
    });
}

// Convert base64String to image file
let base64ToImage = (data, name) => {
    let filePath = path.join(__dirname, '../../../../uploads/', name);
    let thumbPath = path.join(__dirname, '../../../../uploads/thumbs/', name);
    let base64Data = data.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filePath, base64Data, 'base64', function (err) { });
    fs.writeFile(thumbPath, base64Data, 'base64', function (err) { });
}

let readFileData = (filePath) => {
    let data = fs.readFileSync(filePath, 'utf8');
    let dataArray = data.toString().replace(/(?:\r)/g, '').split('\n');
    return dataArray;
}

module.exports = {
    getCompanyHierarchy: Promise.method(getCompanyHierarchy),
    getCompanyHierarchyIds: Promise.method(getCompanyHierarchyIds),
    checkPIC: Promise.method(checkDuplicatePIC),
    validatePIC: Promise.method(validatePIC),
    uploadFile: Promise.method(uploadFile),
    deleteFile: Promise.method(deleteFile),
    removeFileStorage: Promise.method(removeFile),
    createAudit: Promise.method(createAudit),
    updateAudit: Promise.method(updateAudit),
    updateContact: Promise.method(updateContact),
    downloadFile: Promise.method(downloadFile),
    base64ToImage: Promise.method(base64ToImage),
    readFileData: Promise.method(readFileData)
}