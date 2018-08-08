'use strict';

/*************************************
 * database interaction methods related to 
 * 'livestockcarcass' table
 * *************************************/

import models from '../schema';

// create livestockcarcass record to DB
let create = (obj, trans = null) => {
    return models.livestockcarcass.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    createLivestockCarcass: create
}