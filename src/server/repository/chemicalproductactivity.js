'use strict';

/*************************************
 * database interaction methods related to 
 * 'chemicalproductactivity' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// get all chemical product activity record for drop down
let getChemicalProductActivity = () => {
    return models.chemicalproductactivity.findAll({
        raw: true,
        attributes: [['UUID','Id'], 'ActivityName']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getChemicalProductActivity: getChemicalProductActivity
}