'use strict';

/*************************************
 * database interaction methods related to 
 * 'Contact' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';

// create client record to DB
let create = (obj) => {
    models.client.create(obj).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get client record by Id
let getById = (clientId) => {
    return models.client.find({ raw: true, where: { ClientId: clientId } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    createClient: create,
    getClientById: getById
}
