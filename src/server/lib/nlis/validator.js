
'use strict';

/**************************************
 * perform validation on arguments
 * before posting to soap service
 * ************************************/

import {
    isEmpty as _isEmpty, isUndefined as _isUndefined
} from 'lodash';
import { getResponse, HttpStatus } from '../../lib/index';

// validate username & password
function requireCredentials(username, password) {

    if ((_isUndefined(username) || _isEmpty(username)) && (_isUndefined(password) || _isEmpty(password))) {
        throw new Error("NLIS Username & Password are not available.");
        return false;
    }

    if (_isUndefined(username) || _isEmpty(username)) {
        throw new Error("NLIS Username is not available.");
        return false;
    }
    if (_isUndefined(password) || _isEmpty(password)) {
        throw new Error("NLIS Password is not available.");
        return false;
    }
}

// validate p2p transfer arguments
function validateP2pTransfer(username, password, fromPIC, toPIC, nvdNumber, rfids) {

    requireCredentials(username, password);
    if (_isUndefined(fromPIC) || _isEmpty(fromPIC)) {
        throw new Error("From PIC is required.");
        return;
    }
    if (_isUndefined(toPIC) || _isEmpty(toPIC)) {
        throw new Error("To PIC is required.");
        return;
    }
    if (_isUndefined(nvdNumber) || _isEmpty(nvdNumber)) {
        throw new Error("NVD Number is required.");
        return;
    }
    if (rfids == null || rfids == "" || rfids == undefined || rfids.length == 0) {
        throw new Error("RFID is required.");
        return;
    }
}

// validate replaced tags arguments
function validateReplacedTags(username, password, livestocks) {

    requireCredentials(username, password);
    if (livestocks == null || livestocks == "" || livestocks == undefined || livestocks.length == 0) {
        throw new Error("Livestock is required.");
        return;
    }
}

// validate beast enquiry
function validateBeastEnquiry(username, password, livestocks) {
    validateReplacedTags(username, password, livestocks);
}

// validate pic erp status
function validatePicErpStatus(username, password, pic) {
    requireCredentials(username, password);
    if (_isUndefined(pic) || _isEmpty(pic)) {
        throw new Error("PIC is required.");
        return;
    }
}

// validate kill/deceased rfid upload
function validateKillUpload(username, password, rfids) {
    requireCredentials(username, password);
    if (rfids == null || rfids == "" || rfids == undefined || rfids.length == 0) {
        throw new Error("RFID is required.");
        return;
    }
}

// validate nlis response to check
// error if any
function validateResponse(etree) {

    let nlisError = etree.findtext('./nlis:error/nlis:description');
    if (nlisError != null && nlisError != undefined) {
        return getResponse(HttpStatus.BAD_REQUEST, nlisError);
    }

    let faultString = etree.findtext('./SOAP-ENV:Body/faultstring');
    if (faultString != null && faultString != undefined) {
        return getResponse(HttpStatus.BAD_REQUEST, faultString);
    }

    let nlisParseError = etree.findtext('./nlis:parse-error/nlis:description');
    if (nlisParseError != null && nlisParseError != undefined) {
        return getResponse(HttpStatus.BAD_REQUEST, nlisParseError);
    }
    return true;
}

module.exports = {
    requireCredentials: requireCredentials,
    validateP2pTransfer: validateP2pTransfer,
    validateReplacedTags: validateReplacedTags,
    validateBeastEnquiry: validateBeastEnquiry,
    validatePicErpStatus: validatePicErpStatus,
    validateKillUpload: validateKillUpload,
    validateResponse: validateResponse
}