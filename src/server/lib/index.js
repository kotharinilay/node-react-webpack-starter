'use strict';

/**************************************
 * comman functions for server area
 ************************************/

import fs from 'fs';

// Common messages for api response
function resMessages() {
    return {
        transactionDeclined: 'Transaction declined',
        somethingWrong: 'COMMON.SOMETHING_WRONG',
        invalidInput: 'COMMON.INVALID_DETAILS',
        mendatory: 'COMMON.MANDATORY_DETAILS',
        unauthorized: 'COMMON.UNAUTHORIZED',
        emailFromReq: 'COMMON.EMAIL_FROM_REQ',
        emailToReq: 'COMMON.EMAIL_TO_REQ',
        emailSubjectReq: 'COMMON.EMAIL_SUBJECT_REQ',
        emailMessageReq: 'COMMON.EMAIL_MESSAG_EREQ',
        selectOnlyOne: 'COMMON.SELECT_AT_LEAST_ONE',
        selectAtLeastOne: 'COMMON.SELECT_AT_LEAST_ONE',
        picReq: 'COMMON.PIC_REQ',
        picInvalid: 'COMMON.PIC_INVALID',
        val_PicReq: 'COMMON.VALIDATION.1102',
        val_PicInvalid: 'COMMON.VALIDATION.1103',
        val_PicDuplicate: 'COMMON.VALIDATION.1110',
        val_SelectCompany: 'COMMON.VALIDATION.1104'
    };
}

/**************************************
 * Get response for api call
 * if options = { test:'123' } -> { status: 200, response: { success: true, test: '123' } }
 *  
 * Examples...
 * getResponse() -> { status: 200, response: { success: true } }
 * getResponse(400, 'something wrong') -> { status: 400, response: { success: false, error: 'something wrong' } }
 * getResponse(200, null, { test: '123' }) -> { status: 200, response: { success: true, test: '123' } }
 ************************************/
function getResponse(status = HttpStatus.SUCCESS, error = null, options = null) {
    let result = {
        status: status,
        response: {
            success: (status == HttpStatus.SUCCESS),
            error: error
        }
    }

    if (options)
        Object.assign(result.response, { ...options });

    return result;
}

// Http Status Codes
let HttpStatus = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
}

// Generate data grid response based on result
let dataSetResponse = (result) => {
    let resultData = JSON.parse(JSON.stringify(result));
    let data = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });
    let total = Object.keys(resultData[1]).map(function (k) { return resultData[1][k] });
    return { data: data, total: total[0].Total };
}

// convert JSON to CSV data
let jsonToCSVConvertor = (JSONData, ShowLabel) => {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += arrData[i][index] ? arrData[i][index] + ',' : ',';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    return CSV;
}

// copy file from src to dest
function copyFile(src, dest) {
    let readStream = fs.createReadStream(src);
    readStream.once('error', (err) => {
        // console.log(err);
    });
    readStream.once('end', () => {
        //console.log('done copying');
    });
    readStream.pipe(fs.createWriteStream(dest));
}

function getCommaSeparatedIds(ids) {
    let uuids = [];
    ids.map(id => {
        uuids.push(`'${id}'`);
    });
    return uuids.join();
}

module.exports = {
    resMessages: resMessages(),
    getResponse: getResponse,
    HttpStatus: HttpStatus,
    dataSetResponse: dataSetResponse,
    jsonToCSVConvertor: jsonToCSVConvertor,
    copyFile: copyFile,
    getCommaSeparatedIds: getCommaSeparatedIds
}