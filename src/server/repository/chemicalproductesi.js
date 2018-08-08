'use strict';

/*************************************
 * database interaction methods related to 
 * 'chemicalproductesi' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create multiple chemical product ESI record to DB
let bulkCreate = (obj, trans = null) => {
    return models.chemicalproductesi.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product ESI record of specific chemical product
let getChemicalProductESIAll = (chemicalProductId) => {
    return models.chemicalproductesi.findAll({
        raw: true, where: { ChemicalProductId: chemicalProductId },
        attributes: ['UUID', 'CountryId', 'SpeciesId', 'NumberOfDays']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete chemical product ESI records from DB
let remove = (condition, trans = null) => {
    return models.chemicalproductesi.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getChemicalProductESIAll: getChemicalProductESIAll,
    createChemicalProductESI: bulkCreate,
    removeChemicalProductESI: remove
}