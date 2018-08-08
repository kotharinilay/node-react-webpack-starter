'use strict';

/**********************************
 * format string using validator
 * trim,empty,isNumber,isDate etc
 * Make sure all parameter value in string
 * ******************************* */

var validator = require('validator');
let constants = require('../constants');
let rfidManufacturerCodes = require('../constants').rfidManufacturerCodes;
let manufacturerCodes = require('../constants').manufacturerCodes;
const regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+[a-z]){1,2}|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;

// STRING VALIDATORS

// check if seed is substring of str or not
var contains = function (str, seed) {
    return validator.contains(str, seed);
}

// check for valid date
var isDate = function (str) {
    return validator.isDate(str);
}

// check for valid email
var isEmail = function (str) {
    //return validator.isEmail(str);
    return regex.test(str);
}

// check for empty string
var isEmpty = function (str) {
    return validator.isEmpty(str);
}

// check for valid json string
var isJSON = function (str) {
    return validator.isJSON(str);
}

// check for valid number
var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// check for valid uuid
var isUUID = function (str) {
    if (!str) return false;
    else if (typeof str != 'string') return false;
    return validator.isUUID(str);
}

// check for valid URL
var isURL = function (str) {
    if (!str) return false;
    return validator.isURL(str);
}

// STRING SANITIZERS

// trim passed string
var trim = function (input) {
    if (!isEmpty(input)) {
        return validator.trim(input);
    }
    return '';
};

// var toBoolean = function (input) {
//     return validator.toBoolean(input);
// }

// replace <, >, &, ', " and / with HTML entities
var escape = function (input) {
    return validator.escape(input);
}

// replaces HTML encoded entities with <, >, &, ', " and /.
var unescape = function (input) {
    return validator.unescape(input);
}

// return blank string if null
var toEmptyStr = function (input, output = '') {
    return input || output;
}

// get first character of passed string
var getFirstChar = function (input) {
    if (!input) {
        return '';
    }
    return input.charAt(0);
}

// get last character of passed string
var getLastChar = function (input) {
    if (!input) {
        return '';
    }
    return input.slice(-1);
}

// replace all occurence in string
var replaceAll = function (sourceStr, replaceStr, replaceToStr, ignore = true) {
    return sourceStr.replace(new RegExp(replaceStr.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
        (ignore ? "gi" : "g")), (typeof (replaceToStr) == "string") ? replaceToStr.replace(/\$/g, "$$$$") : replaceToStr);
}

let EIDValidation = (val) => {
    let rfidManufacturers = constants.rfidManufacturerCodes.map((code) => {
        return code.Text;
    });
    if (!val) { return false; }
    else if (val.length != 16) { return false; }
    let parts = val.split(' ');
    if (parts.length != 2) { return false; }
    else if (rfidManufacturers.indexOf(parts[0]) == -1)
    { return false; }

    return true;
}

let NLISValidation = (val) => {
    if (!val) { return false; }
    else if (val.length != 16) { return false; }

    let manufacturers = constants.manufacturerCodes.map((code) => {
        return code.Text;
    });

    let devices = constants.deviceTypes.map((code) => {
        return code.Text;
    });

    if (manufacturers.indexOf(val.charAt(8)) == -1) return false;
    if (devices.indexOf(val.charAt(9)) == -1) return false;
    if (!val.charAt(10).match(/[a-z]/i)) return false;

    return true;
}

let VisualTagValidation = (val) => {
    if (!val) return false;
    return true;
}

let SocietyIdValidation = (val) => {
    if (!val) return false;
    return true;
}

module.exports = {
    contains, isDate, isEmpty, isEmail, isJSON, isNumeric, isUUID, isURL,
    trim, escape, unescape, toEmptyStr,
    getFirstChar, getLastChar, replaceAll,
    EIDValidation, NLISValidation, VisualTagValidation, SocietyIdValidation
};