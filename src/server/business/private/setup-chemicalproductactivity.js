'use strict';

/***********************************
 * Chemical Product Activity
 * *********************************/

import Promise from 'bluebird';
import { getChemicalProductActivity } from '../../repository/chemicalproductactivity';
import { getResponse } from '../../lib/index';

// get all product activities
let getAll = () => {
    return getChemicalProductActivity().then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllChemicalProductActivity: Promise.method(getAll)
}