'use strict';

/***********************************
 * Logic related to edit user profile
 * *********************************/

import Promise from 'bluebird';
import {
    getUserDetails, updateContact, getContactDataSet, createContact
} from '../../repository/contact';
import { userRole } from '../../../shared';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import { deleteServerFile } from './file-middleware';
import { encryptPassword, checkPassword } from '../../auth/password-auth';
import models from '../../schema';

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
    return null;
}

// common method to get add/update contact object
let getSaveObj = (userObj) => {
    let contactObj = {
        FirstName: userObj.firstName,
        LastName: userObj.lastName,
        Mobile: userObj.mobile,
        Email: userObj.email,
        Address: userObj.address
    }
    return contactObj;
}

// create new contact
let create = (userObj) => {
    let response = serverValidations(userObj);
    if (response != null)
        return response;
    let contactObj = getSaveObj(userObj);
    return createContact(contactObj).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// update existing contact/user
let update = (userObj) => {
    let response = serverValidations(userObj);
    if (response != null) {
        return response;
    }
    let contactObj = getSaveObj(userObj);
    let contactCondition = { Id: userObj.Id };
    return updateContact(contactObj, contactCondition).then(function (res) {
        return getResponse();
    }).catch(function (err) {
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

// remove selected contacts
let remove = (ids) => {
    if (ids.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }
    let contactObj = {
        IsDeleted: 1
    }

    return updateContact(contactObj, { Id: ids }, t).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    getUserDetail: Promise.method(getDetail),
    getContactDataSet: Promise.method(getDataSet),
    createContact: Promise.method(create),
    updateUserDetail: Promise.method(update),
    deleteContacts: Promise.method(remove)
}