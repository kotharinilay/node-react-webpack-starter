'use strict';

/************************************** 
 * axios http request handler
 * any http request should be using this module
 * instead of direct axios usage
 ***************************************/

import axios from 'axios';

// validate url for any request
function validate(url) {
     if (url == null) {
        throw new Error('url is required to make http request');
    }
}

// http.get request
var get = function (url) {
    validate(url);
    return axios.get(url);
};

// http.delete request
var remove = function (url) {
    validate(url);
    return axios.delete(url);
};

// http.post request
var post = function (url, data = null, config = null) {
    validate(url);
    return axios.post(url,data,config);
};

// http.put request
var put = function (url, data = null, config = null) {
    validate(url);
    return axios.put(url,data,config);
};

// http.patch request
var patch = function (url, data = null, config = null) {
    validate(url);
    return axios.patch(url,data,config);
};

module.exports = { get, post, put, patch, remove };
