'use strict';

/**************************
 * action list of e-NVD 
 * **************************** */

function setNVDCommonDetail(type, payload) {
    return {
        type: type,
        payload
    }
}

module.exports = {
    setNVDCommonDetail: setNVDCommonDetail
}