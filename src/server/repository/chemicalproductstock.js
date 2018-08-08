'use strict';

/*************************************
 * database interaction methods related to 
 * 'chemicalproductstock' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create multiple chemical product Stock record to DB
let bulkCreate = (obj, trans = null) => {
    return models.chemicalproductstock.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product Stock record of specific chemical product
let getChemicalProductStockAll = (chemicalProductId) => {
    return models.chemicalproductstock.findAll({
        raw: true, where: { ChemicalProductId: chemicalProductId },
        attributes: ['UUID', 'BatchNumber', 'StockOnHand', 'StockDate', 'Cost', 'UoMId', 'Supplier', 'DateOfManufacturing',
            'ExpiryDate', 'StoragePIC', 'AuditLogId']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete chemical product Stock records from DB
let remove = (condition, trans = null) => {
    return models.chemicalproductstock.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update chemical product stock record to DB
let update = (obj, condition, trans = null) => {
    return models.chemicalproductstock.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product stock for batch number dropdown binding
let getBySearch = (searchText, chemicalProductId, speciesId) => {

    let query = `
        select cps.UUID as Id, cps.BatchNumber, cps.StockOnHand, cps.StockDate,
        cps.Cost, cps.UoMId, cps.AuditLogId, cpe.NumberOfDays as esi, cpw.NumberOfDays as whp
        from chemicalproductstock cps
        left join chemicalproductesi cpe on cpe.ChemicalProductId = cps.ChemicalProductId and cpe.SpeciesId = fn_UuidToBin('${speciesId}')
        left join chemicalproductwhp cpw on cpw.ChemicalProductId = cps.ChemicalProductId and cpw.SpeciesId = fn_UuidToBin('${speciesId}')
        where cps.IsDeleted = 0 and cps.BatchNumber like '${searchText}%' 
        and cps.ChemicalProductId = fn_UuidToBin('${chemicalProductId}');`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return JSON.parse(JSON.stringify(result));
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getChemicalProductStockAll: getChemicalProductStockAll,
    createChemicalProductStock: bulkCreate,
    removeChemicalProductStock: remove,
    updateChemicalProductStock: update,
    getChemicalProductStockSearch: getBySearch
}