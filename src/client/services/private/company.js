'use strict';

/*************************************
 * consists API calls for company
 * *************************************/

import { get, post } from '../../lib/http/http-service';
import { replaceAll } from '../../../shared/format/string';

// Get company data from id
function getCompanyDetail(id) {
    return get('/company/getbyid', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save company data
function saveCompany(companyObj) {
    return post('/company/save', { companyObj: companyObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get company details for update company
function getCompanyData(id) {
    return get('/company/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// check if duplicate email exist
function checkDupEmail(emailId) {
    return get('/company/checkduplicate', { email: emailId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get region/business unit details for update
function getSubCompanyDetail(id, type) {
    return get('/subcompany/detail', { id: id, type: type }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save region data
function saveRegion(regionObj) {
    return post('/region/save', { regionObj: regionObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save business unit data
function saveBusinessUnit(businessObj) {
    return post('/businessunit/save', { businessObj: businessObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// check if duplicate company/region/business unit exist within company
function checkDupName(name, companyId, type, id) {
    return get('/company/checkduplicatename', { name: name, companyId: companyId, type: type, id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get contact for drop down
function getAllRegion(companyId) {
    return get('/region/getall', { companyId: companyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete company data
function deleteCompany(uuids, auditLogIds, type) {
    return post('/company/delete', { uuids: uuids, auditLogIds: auditLogIds, type: type }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all company details on selectAll button click
function getAllCompany(filterObj = null) {
    return post('/company/getall', { filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getCompanyData: getCompanyData,
    getCompanyDetail: getCompanyDetail,
    saveCompany: saveCompany,
    checkDupEmail: checkDupEmail,
    getSubCompanyDetail: getSubCompanyDetail,
    saveRegion: saveRegion,
    saveBusinessUnit: saveBusinessUnit,
    checkDupName: checkDupName,
    getAllRegion: getAllRegion,
    deleteCompanyRecords: deleteCompany,
    getAllCompany: getAllCompany
}