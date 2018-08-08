'use strict';

/**************************************
 * axios - to communicate with
 * third party api's such as nlis/mla
 * *************************************/

var axios = require('axios');

function getInstance(url, contentType) {
    var instance = axios.create({
        baseURL: url
    });
    instance.defaults.headers.post['Content-Type'] = contentType;
    return instance;
}

module.exports = { getInstance: getInstance }