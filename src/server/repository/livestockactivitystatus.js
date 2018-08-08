'use strict';

/*************************************
 * database interaction methods related to 
 * 'livestockactivitystatus' table
 * *************************************/

import models from '../schema';

// get livestock activity status record by condition
let getAll = (condition) => {
    return models.view_livestockactivitystatus.findAll({ where: condition, raw: true }).then(function (result) {        
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getAllActivityStatus: getAll
}