'use strict';

/**************************************
 * comman functions for server area
 ************************************/

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
function getResponse(status = 200, error = null, options = null) {
    let result = {
        status: status,
        response: {}
    }

    if (error) {
        result.response.success = false;
        result.response.error = error;
    }
    else
        result.response.success = true;

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

// Generate data grid filter query
let gridFilterQuery = (sortColumn, sortOrder, skipRec, pageSize) => {
    return "order by " + sortColumn + " " + sortOrder + " Limit " + skipRec + "," + pageSize;
}

module.exports = {
    resMessages: resMessages(),
    getResponse: getResponse,
    HttpStatus: HttpStatus,
    dataSetResponse: dataSetResponse,
    gridFilterQuery: gridFilterQuery
}