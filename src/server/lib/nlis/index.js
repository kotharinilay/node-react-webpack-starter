'use strict';

/**************************************
 * manage communication with various
 * nlis soap services
 * 1. Validate Credentials
 * 2. P2P transfer
 * 3. Replaced Tags
 * 4. Complete Beast Enquiry - LT/EU
 * 5. PIC ERP status
 * ************************************ */

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import request from 'request';
import et from 'elementtree';
import {
    map as _map,
    forEach as _forEach, replace as _replace,
    isEmpty as _isEmpty, isUndefined as _isUndefined
} from 'lodash';
import moment, { formatDateTime } from '../../../shared/format/date';
import { getResponse, HttpStatus } from '../../lib/index';
import {
    requireCredentials, validateP2pTransfer, validateBeastEnquiry,
    validateReplacedTags, validatePicErpStatus, validateKillUpload,
    validateResponse
} from './validator';
import { geteNVDById, updateModel } from '../../repository/envd';
import { getPropertyDetailById } from '../../repository/property';
import { nvdTypes } from '../../../shared/constants';
import { uuidToBuffer } from '../../../shared/uuid/index';

// constant variables
const UAT_URL = "https://uat.nlis.mla.com.au/soap/upload.aspx";
const PROD_URL = "https://www.nlis.mla.com.au/soap/upload.aspx";

function readTemplate(username, password, fileName) {
    var currentDate = _replace(moment.currentDateTime().YYYYMMDDFormat, new RegExp("-", "g"), '');
    var currentTime = _replace(moment.currentDateTime().HHMMSSFormat, new RegExp(":", "g"), '');

    let template = fs.readFileSync(path.join(__dirname, "../../", "templates/nlis/" + fileName), 'utf-8').toString();

    template = template.replace('[username]', username);
    template = template.replace('[password]', password);
    template = template.replace('[currentdate]', currentDate);
    template = template.replace('[currenttime]', currentTime);
    return template;
}

// construct url
function getUrl(env) {
    if (env == "" || env == null || env == undefined) {
        return UAT_URL;
    }
    if (env.toLowerCase() == "production") {
        return PROD_URL;
    }
    return UAT_URL;
}

// post xml content to nlis soap service
function postXml(template) {
    return new Promise((resolve, reject) => {
        var url = getUrl(process.env.NODE_ENV);
        var req = request.post(url, function (err, response, body) {
            if (err) { reject(err); }
            resolve(body);
        });

        var form = req.form();
        form.append('custom_file', template, { filename: "myUploadFile.xml", contentType: "text/xml" });
    });
}

// validate whether credentials are valid yor not
function validateCredential(username, password) {

    requireCredentials(username, password);
    var template = readTemplate(username, password, "validate-credentials.xml");

    return postXml(template).then(function (res) {

        var etree = et.parse(res);
        let isValid = validateResponse(etree);
        if (isValid != true) {
            return isValid;
        }
        return getResponse(HttpStatus.SUCCESS);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err);
    });
}

// perform stock movement from source to destination pic
function p2pTransfer(username, password, dateOfMovement, fromPIC, toPIC, nvdNumber, rfids) {

    validateP2pTransfer(username, password, fromPIC, toPIC, nvdNumber, rfids);
    if (dateOfMovement == null || dateOfMovement == "" || dateOfMovement == undefined) {
        dateOfMovement = new Date();
    }

    var movementDate = _replace(moment.formatDateTime(dateOfMovement).YYYYMMDDFormat, new RegExp("-", "g"), '');
    var movementTime = _replace(moment.formatDateTime(dateOfMovement).HHMMSSFormat, new RegExp(":", "g"), '');

    let rfidArr = [];
    _forEach(rfids, function (f) {
        rfidArr.push(`<nlis:rfid>${f}</nlis:rfid>`);
    });

    var template = readTemplate(username, password, "p2p-transfer.xml");
    template = template.replace('[nvdnumber]', nvdNumber);
    template = template.replace('[movementdate]', movementDate);
    template = template.replace('[movementtime]', movementTime);
    template = template.replace('[frompic]', fromPIC);
    template = template.replace('[topic]', toPIC);
    template = template.replace('[rfids]', rfidArr.join(""));

    return postXml(template);
}

// perform replacement of tag with changing identity
function replacedTags(username, password, replacementDate, livestocks) {

    validateReplacedTags(username, password, livestocks);

    if (replacementDate == null || replacementDate == "" || replacementDate == undefined) {
        replacementDate = new Date();
    }
    var replaceDate = _replace(moment.formatDateTime(replacementDate).YYYYMMDDFormat, new RegExp("-", "g"), '');

    let livestocksArr = [];
    _forEach(livestocks, function (f) {
        let i = `<nlis:replacedtag-grp>
        <nlis:old-rfid>${f.OldEID}</nlis:old-rfid>
        <nlis:new-rfid>${f.NewEID}</nlis:new-rfid>
        </nlis:replacedtag-grp>
        <nlis:replacedtag-grp>
        <nlis:old-nlisid>${f.OldNLISID}</nlis:old-nlisid>
        <nlis:new-nlisid>${f.NewNLISID}</nlis:new-nlisid>
        </nlis:replacedtag-grp>`;
        livestocksArr.push(i);
    });

    var template = readTemplate(username, password, "replaced-tag.xml");
    template = template.replace('[replacementdate]', replaceDate);
    template = template.replace('[tags]', livestocksArr.join(""));

    return postXml(template);
}

// retrieve LT/EU status for livestocks having EID or NLIS ID
function beastEnquiry(username, password, pic, livestocks) {

    validateBeastEnquiry(username, password, livestocks);

    // filter livestocks having EID or NLIS Id
    let eligible = livestocks.filter(function (f) {
        return (!_isEmpty(f.EID) && !_isUndefined(f.EID)) ||
            (!_isEmpty(f.NLISID) && !_isUndefined(f.NLISID));
    });
    if (eligible.length == 0) {
        throw new Error("Livestock must have either EID or NLIS ID.");
    }

    let livestocksArr = [];
    _forEach(eligible, function (f) {
        if (_isEmpty(f.EID) || _isUndefined(f.EID)) {
            livestocksArr.push(`<nlis:param>${f.NLISID}</nlis:param>`);
        }
        else {
            livestocksArr.push(`<nlis:param>${f.EID}</nlis:param>`);
        }
    });

    var template = readTemplate(username, password, "beast-enquiry.xml");
    template = template.replace('[pic]', pic);
    template = template.replace('[livestocks]', livestocksArr.join(""));

    return postXml(template);
}

// retrieve erp status of property
function picErpStatus(username, password, pic) {

    validatePicErpStatus(username, password, pic);
    var template = readTemplate(username, password, "erp-pic-status.xml");
    template = template.replace('[pic]', pic);

    return postXml(template).then(function (res) {

        var etree = et.parse(res);
        let nlisResponse = validateResponse(etree);
        if (nlisResponse != true)
            return nlisResponse;

        const deep = './SOAP-ENV:Body/nlis:Query-Result/nlis:query-results-grp/nlis:report-results-grp/result';
        let all = etree.findall(deep);
        let codes = [];

        if (all.length > 0) {
            codes = _map(all, function (k, i) {
                return {
                    ProgramCode: all[i].findtext('Program_Code'),
                    StatusCode: all[i].findtext('Status_code'),
                    Description: all[i].findtext('Status_code_description')
                };
            });

            // check if pic is not authorized or pic is invalid
            if (codes.length == 1) {
                if (_isEmpty(codes[0].ProgramCode) || _isUndefined(codes[0].ProgramCode) && _isEmpty(codes[0].StatusCode) || _isUndefined(codes[0].StatusCode)
                    && !_isEmpty(codes[0].Description) && !_isUndefined(codes[0].Description)) {
                    return getResponse(HttpStatus.BAD_REQUEST, codes[0].Description);
                }
            }

            let isLpa = codes.filter(function (i) { return i.ProgramCode == "LPA"; });
            if (isLpa.length > 0) {
                return getResponse(HttpStatus.SUCCESS, null, { response: isLpa[0] });
            }
        }

        return getResponse(HttpStatus.SUCCESS, null, { response: { ProgramCode: null, StatusCode: null, Description: null } });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err);
    });
}

// upload kill/deceased rfid to nlis
function killUpload(username, password, killDate, rfids) {

    try { validateKillUpload(username, password, rfids); }
    catch (e) { return getResponse(HttpStatus.BAD_REQUEST, e.message); }

    var template = readTemplate(username, password, "kill-upload.xml");
    if (killDate == null || killDate == "" || killDate == undefined) {
        killDate = new Date();
    }
    var dateOfKill = _replace(moment.formatDateTime(killDate).YYYYMMDD_HHMM, new RegExp("-", "g"), '');

    let livestocksArr = [];
    _forEach(rfids, function (f, inx) {
        let i = `<nlis:tag-grp>
        <nlis:kill-id>${inx + 1}</nlis:kill-id>
        <nlis:rfid>${f}</nlis:rfid>        
        </nlis:tag-grp>`;
        livestocksArr.push(i);
    });

    template = template.replace('[killdate]', dateOfKill);
    template = template.replace('[rfids]', livestocksArr.join(''));

    return postXml(template).then(function (res) {
        var etree = et.parse(res);
        let nlisResponse = validateResponse(etree);
        if (nlisResponse != true)
            return nlisResponse;

        return getResponse(HttpStatus.SUCCESS, null, { response: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err);
    });
}

function submitConsignmentToNlis(nvdId, propertyId, contactId, language) {
    let responseMessage = '';
    let username, password = '';
    return getPropertyDetailById(propertyId, language).then(function (response) {
        let propertyData = response.data.length == 1 ? response.data[0] : {};
        username = propertyData.NLISUsername;
        password = propertyData.NLISPassword;
        if (username && password)
            return geteNVDById(nvdId, language);
        else {
            responseMessage = "NLIS Credential is required.";
            return false;
        }
    }).then(function (response) {
        if (response) {
            let nvdData = response.nvdData.length == 1 ? response.nvdData[0] : null;
            if (!nvdData) {
                responseMessage = "Invalid eNVD selected to post on NLIS.";
                return false;
            }
            else if (nvdData.IsPostedOnMLA == 0) {
                responseMessage = "You must post eNVD to MLA before posting to NLIS.";
                return false;
            }
            else if (nvdData.IsPostedOnNLIS == 1) {
                responseMessage = "eNVD already posted on NLIS.";
                return false;
            }
            else if (nvdData.IsMobNVD == 0 && (nvdData.NVDType == nvdTypes.Cattle || nvdData.NVDType == nvdTypes.EUCattle)) {
                let emptyEID = response.livestockSummaryData.find(x => x.EID == null);
                if (emptyEID) {
                    responseMessage = "We cannot post to NLIS before EID have been scanned.";
                    return false;
                }
            }

            var movementDate = nvdData.MovementCommenceDate ? _replace(formatDateTime(nvdData.MovementCommenceDate).YYYYMMDDFormat, new RegExp("-", "g"), '') : _replace(moment.currentDateTime().YYYYMMDDFormat, new RegExp("-", "g"), '');

            var template = readTemplate(username, password, nvdData.IsMobNVD == 0 ? "submit-nvd-to-nlis.xml" : "submit-nvd-mob-to-nlis.xml");
            template = template.replace('[speciesName]', (nvdData.SpeciesName == "Goat" ? "Goats" : nvdData.SpeciesName));
            template = template.replace('[movementDate]', movementDate);
            template = template.replace('[consignerPIC]', nvdData.ConsignerPIC || '');
            template = template.replace('[totalNumberOfLivestock]', nvdData.TotalLivestockQty || 0);
            template = template.replace('[consigneePIC]', nvdData.DestinationPIC || nvdData.ConsigneePIC || '');
            template = template.split('[MLAReferenceNumber]').join(nvdData.MLAReferenceNumber || '');
            template = template.replace('[eventTime]', moment.currentDateTime().HHMMSSFormat);
            return postXml(template);
        }
        else
            return false;
    }).then(function (response) {
        if (response) {
            var etree = et.parse(response);
            let nlisResponse = validateResponse(etree);
            if (nlisResponse != true)
                return nlisResponse;
            let referenceNumber = etree.findtext('./SOAP-ENV:Body/nlis:Lodgement-Result/nlis:lodgement-result-grp/nlis:transaction-id');
            let nvdUpdateObj = {
                NLISReferenceNumber: referenceNumber,
                NLISSubmittedDate: new Date(),
                NLISSubmittedByContactId: uuidToBuffer(contactId),
                IsPostedOnNLIS: 1
            }
            return updateModel(nvdUpdateObj, 'nvd', { UUID: nvdId }).then(function (res) {
                return getResponse(HttpStatus.SUCCESS);
            }).catch(function (err) {
                throw new Error(err);
            });
        }
        else
            return getResponse(HttpStatus.BAD_REQUEST, responseMessage);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    })
}

module.exports = {
    validateCredential: Promise.method(validateCredential),
    p2pTransfer: Promise.method(p2pTransfer),
    replacedTags: Promise.method(replacedTags),
    beastEnquiry: Promise.method(beastEnquiry),
    picErpStatus: Promise.method(picErpStatus),
    killUpload: Promise.method(killUpload),
    submitConsignmentToNlis: Promise.method(submitConsignmentToNlis)
}