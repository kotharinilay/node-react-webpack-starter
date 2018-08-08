'use strict';

/*************************************
 * property services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// Get data to filter property grid from left filter area
function getFilterData() {
    return get('/property/getfilterdata').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get list of Manager and AsstManager for property
function getMngrAsstMngr(companyId, regionId, businessId) {
    return get('/property/getmngrasstmngr', { companyId: companyId, regionId: regionId, businessId: businessId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get all data on change of company hierarchy
function getDataByHierarchy(companyId, regionId, businessId) {
    return get('/property/getdatabyhierarchy', { companyId: companyId, regionId: regionId, businessId: businessId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get all data on load of accreditation tab
function getDataOnAccreditation() {
    return get('/property/getdataonaccreditation').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Save/Update property data
function saveProperty(propertyObj) {
    return post('/property/save', { ...propertyObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of property for modify
function getPropertyDetail(uuid) {
    return get('/property/detail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Top PIC search api
function propertySearch(value) {
    let url = '/property/search?value=' + value;
    return get(url).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get property access list for permission
function getPropertyAccessList(companyId, regionId, businessId, propertyId) {
    return get('/property/getaccess', { companyId: companyId, regionId: regionId, businessId: businessId, propertyId: propertyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete property data
function deleteProperty(uuids, auditLogIds) {
    return post('/property/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get PIC manager hierarchy
function getPICManagerHierarchy(propertyId, companyId, regionId, businessId) {
    return get('/property/pichierarchy', { propertyId: propertyId, companyId: companyId, regionId: regionId, businessId: businessId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of property for modify
function getPropertyMapDetail(uuid) {
    return get('/property/mapdetail', { uuid: uuid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getInductionInitialData(propertyId) {
    return get('/property/inductioninitialdetails', { propertyId: propertyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getPropertyByCondition(columns, join, condition) {
    return get('/property/getbycondition', { columns, join, condition }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getAllProperty(filterObj = null) {
    return post('/property/getalldataset', { filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getPropertyFilterData: getFilterData,
    getPropertyMngrAsstMngr: getMngrAsstMngr,
    getDataByHierarchy: getDataByHierarchy,
    getDataOnAccreditation: getDataOnAccreditation,
    saveProperty: saveProperty,
    getPropertyDetail: getPropertyDetail,
    propertySearch: propertySearch,
    getPropertyAccessList: getPropertyAccessList,
    deletePropertyRecords: deleteProperty,
    getPropertyMapDetail: getPropertyMapDetail,
    getPICManagerHierarchy: getPICManagerHierarchy,
    getInductionInitialData: getInductionInitialData,
    getPropertyByCondition: getPropertyByCondition,
    getAllProperty: getAllProperty
}