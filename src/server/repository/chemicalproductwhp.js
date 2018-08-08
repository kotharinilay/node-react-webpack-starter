'use strict';

/*************************************
 * database interaction methods related to 
 * 'chemicalproductwhp' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create multiple chemical product WHP record to DB
let bulkCreate = (obj, trans = null) => {
    return models.chemicalproductwhp.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product WHP record of specific chemical product
let getChemicalProductWHPAll = (chemicalProductId) => {
    return models.chemicalproductwhp.findAll({
        raw: true, where: { ChemicalProductId: chemicalProductId },
        attributes: ['UUID', 'ActivityId', 'SpeciesId', 'NumberOfDays']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete chemical product WHP records from DB
let remove = (condition, trans = null) => {
    return models.chemicalproductwhp.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getChemicalProductWHPAll: getChemicalProductWHPAll,
    createChemicalProductWHP: bulkCreate,
    removeChemicalProductWHP: remove
}