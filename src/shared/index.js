'use strict';

/*************************************
 * Common functions
 * encrypt/decrypt reference: http://stackoverflow.com/questions/25172527/attempting-to-decrypt-using-crypto-js-and-nodejs
 * App version reference: https://docs.npmjs.com/cli/version
 * *************************************/

var crypto = require('crypto');
var pjson = require('../../package.json');

import { getFirstChar, getLastChar, contains } from './format/string';
import { getCurrentURL } from '../client/lib/index';
import { digitDecimal } from './format/number';
import { includes } from 'lodash';
import { currentDateTime, moment } from './format/date';

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

// generate system code
function generateSystemCode(input, count) {
    let char1 = getFirstChar(input);
    let char2 = getLastChar(input);
    return (char1 + char2 + (parseInt(count) + 1)).toUpperCase();
}

// get url list to ignore for redirection
function getIgnoreURL() {
    return [
        '/dashboard',
        '/editprofile',
        '/pasturecomposition'
    ];
}

// get module list to ignore for setup visible
function getIgnoreModule() {
    return [
        '33d33ca1-f98f-11e6-b179-d7c06e3b519a' // Security module
    ];
}

// get moduleId, controlMenuId based on module, ignoreURL and ignoreModule
function getMenuIds(moduleId = null, controlMenuId = null, moduleMenuArr = [], controlMenuArr = [], isConsiderURL = true, urlPath = null) {
    if (moduleMenuArr.length == 0)
        moduleMenuArr = window.__MENUS__.moduleMenu;
    if (controlMenuArr.length == 0)
        controlMenuArr = window.__MENUS__.controlMenu;

    urlPath = urlPath || getCurrentURL();
    urlPath = urlPath == '/' ? '/dashboard' : urlPath;
    let mId = moduleId || moduleMenuArr[0].Id;
    let cId = controlMenuId;

    let ignoreURL = false;
    getIgnoreURL().forEach(u => {
        if (u == urlPath || contains(urlPath, u + '/')) {
            ignoreURL = true;
        }
    });

    if (isConsiderURL && ((!moduleId && ignoreURL) || (urlPath == '/usersetup' && !getIgnoreModule().includes(mId)))) {
        cId = null;
    }
    else if (!moduleId && !controlMenuId) {
        let controlMenu = null;
        if (isConsiderURL) {
            controlMenu = controlMenuArr.find(c => {
                if (c.RedirectURL == urlPath || contains(urlPath, c.RedirectURL + '/') || contains(c.RedirectURL + '/', urlPath)) { return true; }
            });
            cId = controlMenu ? controlMenu.Id : null;
        }
        if (!controlMenu) {
            controlMenu = controlMenuArr.find(c => {
                if (c.ModuleId == mId) { return true; }
            });
            cId = null;
        }
        mId = controlMenu ? controlMenu.ModuleId : null;
    }
    else if (moduleId) {
        let controlMenu = controlMenuArr.find(c => {
            if (c.ModuleId == mId) {
                return true;
            }
        });
        cId = controlMenu.Id;
    }

    return {
        moduleId: mId,
        controlMenuId: cId
    };
}

// validate pic based on property type and state
function picValidation(pic, propertyType = null, state = null) {
    let result = false;
    if (pic.length == 8) {
        // Unknown PIC and Destination PIC for Live Export. 
        // No algorithm check required
        if (pic == 'AAAAAAAA' || pic == 'EEEEEEEE')
            result = true;
        else {
            let firstChar = getFirstChar(pic);
            let follwed7Char = pic.substring(1, 8);
            let follwed4Char = pic.substring(1, 5);
            let follwed3Char = pic.substring(1, 4);

            // For VIC (new format) state
            let case1 = /^[A-Z]{4}[0-9]{3}$/;
            // For VIC (old format) state
            let case2 = /^[A-Z]{3}[0-9]{4}$/;

            let case3 = /^[A-K]{1}[A-Z]{2}[0-9]{4}$/;
            let case4 = /^[A-K]{1}[0-9]{6}$/;

            // Validate PIC based on Property type
            if (propertyType) {
                if ((propertyType == 'ABR' && pic.startsWith('EUAB') && case2.test(follwed7Char)) ||
                    (propertyType == 'SYD' && pic.startsWith('EUSY') && case2.test(follwed7Char)))
                    return true;
                else if (propertyType == 'ABR' || propertyType == 'SYD')
                    return false;
                else
                    result = true;
            } else if (pic.startsWith('EUAB') || pic.startsWith('EUSY') && !state) {
                return true;
            }

            // Validate PIC based on state
            if (state) {
                if ((state == 'VIC' && firstChar == '3' && case1.test(follwed7Char)) ||
                    (state == 'VIC' && firstChar == 'V' && case2.test(follwed7Char)))
                    result = true;
                else if ((((state == 'NSW' && firstChar == 'N') || (state == 'SA' && firstChar == 'S')) && case4.test(follwed7Char)) ||
                    ((state == 'QLD' && firstChar == 'Q') || (state == 'TAS' && firstChar == 'M') ||
                        (state == 'WA' && firstChar == 'W') || (state == 'NT' && firstChar == 'T')) && case3.test(follwed7Char))
                    result = true;
                else
                    return false;
            }
            else {
                let charList1 = ['N', 'S'];
                let charList2 = ['Q', 'M', 'W', 'T'];
                if ((firstChar == '3' && case1.test(follwed7Char)) ||
                    (firstChar == 'V' && case2.test(follwed7Char)) ||
                    (includes(charList1, firstChar) && case4.test(follwed7Char)) ||
                    (includes(charList2, firstChar) && case3.test(follwed7Char)))
                    result = true;
                else
                    return false;
            }
        }
    }
    return result;
}

// get role of user to display
function getUserRole() {
    return {
        noAccess: 'No Access',
        normalUser: 'Normal User',
        externalUser: 'External User',
        superUser: 'Super User',
        regionManager: 'Region Manager',
        regionAsstManager: 'Asst. Region Manager',
        businessManager: 'Business Unit Manager',
        businessAsstManager: 'Asst. Business Unit Manager',
        propertyManager: 'Property Manager',
        propertyAsstManager: 'Asst. Property Manager'
    };
}

// get role of contact list
function getRoleName(contactList) {
    let userRole = getUserRole();
    contactList.map(r => {
        let role = "";
        if (r.IsExternal == 1) {
            r.Role = userRole.externalUser;
        }
        else if (r.IsSuperUser == 0 && r.RManager == 0 && r.RAsstManager == 0 && r.BManager == 0 && r.BAsstManager == 0) {
            r.Role = userRole.normalUser;
        }
        else {
            if (r.IsSuperUser == 1)
                role = userRole.superUser + ", ";
            if (r.RManager == 1)
                role += userRole.regionManager + ", ";
            if (r.RAsstManager == 1)
                role += userRole.regionAsstManager + ", ";
            if (r.BManager == 1)
                role += userRole.businessManager + ", ";
            if (r.BAsstManager == 1)
                role += userRole.businessAsstManager + ", ";
            r.Role = role.trim().slice(0, -1);
        }
    });
    return contactList;
}

// convert map area from Square Meters to Hectares/Acres
function convertArea(m2Val, isHectares = false, isAcres = false) {
    if (isHectares)
        return digitDecimal(m2Val / 10000);
    else if (isAcres)
        return digitDecimal(m2Val * 0.00024711);
    else
        return {
            Hectares: digitDecimal(m2Val / 10000),
            Acres: digitDecimal(m2Val * 0.00024711)
        }
}

// convert map area from Square Meters to Hectares/Acres
function convertAreaToM2(val, isHectares = false, isAcres = false) {
    if (isHectares)
        return digitDecimal(val * 10000);
    else if (isAcres)
        return digitDecimal(val / 0.00024711);
    else
        return {
            Hectares: digitDecimal(val * 10000),
            Acres: digitDecimal(val / 0.00024711)
        }
}

// convert hex to rgb color code
function hexToRgba(hex, alpha = 100) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    result = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    if (result)
        result = "rgba(" + result.r + "," + result.g + "," + result.b + "," + alpha / 100 + ")";
    return result;
}

// get date filter for livestock event
function livestockEventDateFilter(date1, date2, isMoment = false) {
    if (!isMoment) {
        date1 = date1 ? moment(date1) : null;
        date2 = date2 ? moment(date2) : null;
    }

    let dateFilter = {
        maxDate: currentDateTime().DateTimeMoment.startOf('day')
    }

    if (date1 && date2)
        dateFilter.minDate = (date1 > date2 ? date1 : date2).startOf('day');
    else if (date1)
        dateFilter.minDate = date1.startOf('day');
    else if (date2)
        dateFilter.minDate = date2.startOf('day');
    else
        dateFilter.minDate = currentDateTime().DateTimeMoment.startOf('day');

    return dateFilter;
}

// generate random number based on current time
function generateRandomNumber() {
    return new Date().getTime() + Math.random().toString(36).substring(7);
}

module.exports = {
    getAppVersion: getAppVersion,
    checkPasswordStrength: checkPasswordStrength,
    encrypt: encrypt,
    decrypt: decrypt,
    getFileExtension: getFileExtension,
    generateSystemCode: generateSystemCode,
    getIgnoreURL: getIgnoreURL,
    getIgnoreModule: getIgnoreModule,
    getMenuIds: getMenuIds,
    picValidation: picValidation,
    userRole: getUserRole(),
    getRoleName: getRoleName,
    convertArea: convertArea,
    convertAreaToM2: convertAreaToM2,
    hexToRgba: hexToRgba,
    livestockEventDateFilter: livestockEventDateFilter,
    generateRandomNumber: generateRandomNumber
}