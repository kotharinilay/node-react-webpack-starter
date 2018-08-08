'use strict';

/***********************************
 * Country
 * *********************************/

import Promise from 'bluebird';
import { getCountry } from '../../repository/country';
import { getResponse } from '../../lib/index';

// get all countries
let getAll = (language) => {
    return getCountry(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllCountry: Promise.method(getAll)
}