'use strict';

/***********************************
 * Country
 * *********************************/

import Promise from 'bluebird';
import { getProperties } from '../../repository/property';
import { getResponse } from '../../lib/index';

// get all countries
function getAll(search) {
    let condition = {};
    if (search) {
        condition = { PIC: { $like: '%' + search + '%' } }
    }
    return getProperties(condition, [['UUID', 'Id'], 'PIC', 'Name']).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllProperty: Promise.method(getAll)
}