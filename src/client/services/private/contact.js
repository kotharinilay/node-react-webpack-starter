'use strict';

/*************************************
 * setup services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// get data of user profile for modify
function getUserDetails(id) {
    return get('/user/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// update user profile data
function saveContact(userObj) {
    return post('/contact/save', { userObj: userObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// assign password for selected contact
function setPassword(loggedinPassword, newPassword, selectedId) {
    return post('/contact/setpassword', {
        loggedinPassword: loggedinPassword, newPassword: newPassword,
        selectedId: selectedId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete contact data
function deleteContactRecords(uuids, auditLogIds) {
    return post('/contact/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// check if duplicate email exist
function checkDupEmail(emailId) {
    return get('/contact/checkduplicate', { email: emailId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get assigned business roles for selected contact
function getBusinessRolesData(params) {
    return get('/user/businessroles', { params: params }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get assigned region roles for selected contact
function getRegionRolesData(params) {
    return get('/user/regionroles', { params: params }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all contact of a company for drop down
function getAllContact(companyId) {
    return get('/contact/getall', { companyId: companyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// set property as user preference
function setDefaultPIC(propertyId) {
    return post('/contact/setdefaultpic', { propertyId: propertyId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get super user count for company
function superuserPerCompany(companyId, contactId) {
    return get('/contact/supersuercount', { companyId: companyId, contactId: contactId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get list of contact to whoom property is accessible
function getPropertyAccessContactList(propertyId, includePICAccess) {
    return get('/contact/accesstoproperty', { propertyId: propertyId, includePICAccess: includePICAccess }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getContactByCondition(columns, join, condition) {
    return get('/contact/getbycondition', { columns, join, condition }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getAllContactDataset(filterObj = null) {
    return post('/contact/getalldataset', { filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getBusinessRolesData: getBusinessRolesData,
    getRegionRolesData: getRegionRolesData,
    getUserDetails: getUserDetails,
    checkDupEmail: checkDupEmail,
    saveContact: saveContact,
    deleteContactRecords: deleteContactRecords,
    setPassword: setPassword,
    getAllContact: getAllContact,
    setDefaultPIC: setDefaultPIC,
    superuserPerCompany: superuserPerCompany,
    getPropertyAccessContactList: getPropertyAccessContactList,
    getContactByCondition: getContactByCondition,
    getAllContactDataset: getAllContactDataset
}