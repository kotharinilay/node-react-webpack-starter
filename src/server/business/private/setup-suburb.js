'use strict';

/***********************************
 * Suburb
 * *********************************/

import Promise from 'bluebird';
import { getSuburb, getSuburbDetail } from '../../repository/suburb';
import { getResponse } from '../../lib/index';

// get all suburb
let getAll = (search, countryId) => {
    let condition = {};
    if (search) {
        condition = { Name: { $like: search + '%' }, IsDeleted: 0 }
    }
    return getSuburb(condition, countryId).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

// get suburb details with associated state
let getDetail = (id, language) => {
    return getSuburbDetail(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllSuburb: Promise.method(getAll),
    getSuburbDetail: Promise.method(getDetail)
}