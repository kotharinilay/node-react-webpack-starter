'use strict';

/*************************************
 * setup services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

function findCompany(findObj) {
    return post('/company/find', findObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function findContact(findObj) {
    return post('/contact/find', findObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function findPIC(findObj) {
    return post('/property/find', findObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    findCompany: findCompany,
    findContact: findContact,
    findPIC: findPIC
}
