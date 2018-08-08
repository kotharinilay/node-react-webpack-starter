'use strict';

/*************************************
 * database interaction methods related to 
 * 'nvdstatus' table
 * *************************************/

import models from '../schema';

// get NVD status record by condition
let getAll = (condition) => {
    return models.view_nvdstatus.findAll({ where: condition, raw: true }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getAllNVDActivityStatus: getAll
}