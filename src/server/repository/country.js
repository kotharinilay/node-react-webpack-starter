'use strict';

/*************************************
 * database interaction methods related to 
 * 'country' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// get all country record for drop down
let getCountry = (language) => {
    return models.view_country.findAll({
        raw: true,
        where: { Language: language },
        attributes: ['Id', [sequelize.fn('concat', sequelize.col('CountryName'), ' (', sequelize.col('CountryCode'), ')'), 'CountryName']]
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getCountry: getCountry
}