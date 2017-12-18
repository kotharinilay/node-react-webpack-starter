'use strict';

/*************************************
 * Common functions
 * encrypt/decrypt reference: http://stackoverflow.com/questions/25172527/attempting-to-decrypt-using-crypto-js-and-nodejs
 * App version reference: https://docs.npmjs.com/cli/version
 * *************************************/

var crypto = require('crypto');
var pjson = require('../../package.json');
import React from 'react';
import { browserHistory } from 'react-router';
import { getFirstChar, getLastChar, contains } from './format/string';
import { getCurrentURL } from '../client/lib/index';
import { digitDecimal } from './format/number';

// get web application version from package json file
function getAppVersion() {
    return pjson.version;
}

// check entered password strength
function checkPasswordStrength(p) {
    if (p) {
        let regex = ["[A-Za-z.\s]", "[0-9]", "[$@$!%*#?&]"];
        let score = -1;
        for (let i = 0; i < regex.length; i++) {
            if (new RegExp(regex[i]).test(p)) {
                score++;
            }
        }

        //Validate for length of Password.
        if (score > 1 && p.length >= 8) {
            score++;
        }
        return score;
    }
    else {
        return -1;
    }
}

// encrypt passed data
function encrypt(data) {
    try {
        var cipher = crypto.createCipher('aes256', process.env.SECRET_KEY);
        var crypted = cipher.update(data, 'utf-8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (Exception) {
        return false;
    }
}

// decrypt encrypted data
function decrypt(data) {
    try {
        var decipher = crypto.createDecipher('aes256', process.env.SECRET_KEY);
        var decrypted = decipher.update(data, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }
    catch (Exception) {
        return false;
    }
}

// get file extension
function getFileExtension(filename) {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(filename)[1];
}

module.exports = {
    getAppVersion: getAppVersion,
    checkPasswordStrength: checkPasswordStrength,
    encrypt: encrypt,
    decrypt: decrypt,
    getFileExtension: getFileExtension
}