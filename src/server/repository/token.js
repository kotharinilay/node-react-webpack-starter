'use strict';

/*************************************
 * database interaction methods related to 
 * 'Token' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';

// create token record to DB
let create = (obj) => {
    return models.token.create(obj).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get token record by client Id
let getByClientId = (clientId) => {
    return models.token.find({ raw: true, where: { ClientId: clientId } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get token record by contact Id
let getByContactId = (contactid) => {
    return models.token.findAll({ raw: true, where: { ContactId: contactid } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get token record by token value
let getByToken = (token) => {
    return models.token.find({ raw: true, where: { Token: token } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete token record to DB
let remove = (condition, trans = null) => {
    return models.token.destroy({ raw: true, where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update token record to DB
let update = (obj, condition) => {
    return models.token.update(obj, { where: condition }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getTokenByClientId: getByClientId,
    getTokenByContactId: getByContactId,
    getByToken: getByToken,
    createToken: create,
    removeToken: remove,
    updateToken: update
}