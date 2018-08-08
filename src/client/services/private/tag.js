'use strict';

/*************************************
 * consists API calls for Tag
 * *************************************/

import { get } from '../../lib/http/http-service';

// get tag from eid value
function getByEID(identifier, eid) {
    return get('/tags/getbyeid', { identifier: identifier, eid: eid }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get tag status master data
function getTagStatus() {
    return get('/tags/gettagstatus').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}


module.exports = {
    getTagByEID: getByEID,
    getTagStatus: getTagStatus
}