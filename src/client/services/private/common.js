'use strict';

/*************************************
 * consists API calls for Dashboard
 * *************************************/

import { get, post, put } from '../../lib/http/http-service';
import { replaceAll } from '../../../shared/format/string';

// get grid data for specific page
function getGridData(pageSize, pageIndex, sortColumn, sortOrder, searchText, functionName, filterObj) {
    var param = {
        pageSize: pageSize || 10,
        pageIndex: pageIndex || 1,
        sortColumn: sortColumn,
        sortOrder: sortOrder || 'desc',
        searchText: searchText ? replaceAll(searchText, '*', '%') : null,
        filterObj: filterObj
    };
    param.skipRec = param.pageSize * (param.pageIndex - 1);
    return get('/' + functionName, { params: param }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// upload file to server for further S3 upload
function uploadFile(file) {
    let data = new FormData();
    data.append('file', file);
    return post('/upload', data).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete file from from server middleware
// params:[
//  filename : name of file with extension
//  deleteThumb : true if file is image and want to remove it's associated thumb image
// ] 
function deleteFile(filename, deleteThumb) {
    return post('/deletefile', { filename: filename, deleteThumb: true }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get company hierarchy data of dropdown
function getCompanyHierarchy(companyId = null, regionId = null, businessId = null, regionDisabled = 0) {
    return get('/getcompanyhierarchy', { companyId: companyId, regionId: regionId, businessId: businessId, regionDisabled: regionDisabled }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get ids of company hierarchy
function getCompanyHierarchyIds(id) {
    return get('/getcompanyhierarchyids', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Check pic duplication
function checkDuplicatePIC(pic, propertyId = null) {
    return get('/pic/checkduplication', { pic: pic, propertyId: propertyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get signed s3 request
function getSignedRequest(file) {
    return get('/s3_signed', file).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function s3Upload(file, signedRequest, progressData) {
    let headers = {
        'Content-Type': file.type,
        'AWS': true
    };

    return put(signedRequest, file, headers, false, false, progressData).then(function (res) {
        return { success: true, msg: null };
    }).catch(function (err) {
        return { success: true, msg: err };
    });
}

module.exports = {
    getGridData: getGridData,
    uploadFile: uploadFile,
    deleteFile: deleteFile,
    getCompanyHierarchy: getCompanyHierarchy,
    getCompanyHierarchyIds: getCompanyHierarchyIds,
    checkDuplicatePIC: checkDuplicatePIC,
    getSignedRequest: getSignedRequest,
    s3Upload: s3Upload
}