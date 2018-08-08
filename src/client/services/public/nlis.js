'use strict';

/*****************************************
 * consume aglive's api which are
 * responsible to communicate with nlis
 * ****************************************/

import { post } from '../../lib/http/http-service';

// call api to validate credentials
function validateCredential(username, password) {
    return post('/nlis/validatecredentials', { username: username, password: password }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// call api to retrieve erp status
function picErpStatus(username, password, pic) {
    return post('/nlis/picerpstatus', { username: username, password: password, pic: pic }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// call api to submit consignment to NLIS
function submitConsignmentToNlis(nvdId, propertyId, contactId, language) {
    return post('/nlis/submitconsignmenttonlis', { nvdId: nvdId, propertyId: propertyId, contactId: contactId, language: language }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    validateNlisCredential: validateCredential,
    picErpStatus: picErpStatus,
    submitConsignmentToNlis: submitConsignmentToNlis
}