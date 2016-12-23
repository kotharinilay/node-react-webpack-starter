'use strict';

/**********************************
 * format string using validator
 * trim,empty,isNumber,isDate etc
 * ******************************* */

var validator = require('validator');
const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// STRING VALIDATORS

var contains = function (str) {
    return validator.contains(str);
}

var isDate = function (str) {
    return validator.isDate(str);
}

var isEmail = function (str) {
    //return validator.isEmail(str);
    return regex.test(str);
}

var isEmpty = function (str) {
    return validator.isEmpty(str);
}

var isJSON = function (str) {
    return validator.isJSON(str);
}

var isNumeric = function (str) {
    return validator.isNumeric(str);
}

var isUUID = function (str) {
    return validator.isUUID(str);
}

var isURL = function (str) {
    return validator.isURL(str);
}

// STRING SANITIZERS

var trim = function (input) {
    if (!validator.isEmpty(input)) {
        return validator.trim(input);
    }
    return '';
};

var toBoolean = function (input) {
    return validator.toBoolean(input);
}

var escape = function (input) {
    return validator.escape(input);
}

var unescape = function (input) {
    return validator.unescape(input);
}

module.exports.validators = { contains, isDate, isEmpty, isEmail, isJSON, isNumeric, isUUID, isURL };
module.exports.sanitizers = { trim, toBoolean, escape, unescape };