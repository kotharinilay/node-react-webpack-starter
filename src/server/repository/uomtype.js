'use strict';

/*************************************
 * database interaction methods related to 
 * 'Speices' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// get unit of measure type record for frop down
let getUoMTypes = (language) => {
    let query = `SELECT Id,UoMTypeName FROM view_uomtype ORDER BY UoMTypeName ASC`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getUoMTypes: getUoMTypes
}