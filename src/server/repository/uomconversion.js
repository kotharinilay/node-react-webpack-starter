'use strict';

/*************************************
 * database interaction methods related to 
 * 'Uomconversion' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create unit of measure conversion record to DB
let create = (obj, trans = null) => {
    return models.uomconversion.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all unit of measure conversion record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'CreatedStamp';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (FromUoM LIKE '${searchText}' OR ToUoM LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_uomconversion WHERE FromLanguage='${language}' AND ToLanguage='${language}' ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
         SELECT FOUND_ROWS() as Total;`;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
            total: resultData[1][0].Total
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure conversion record by Id
let getById = (id) => {
    return models.uomconversion.find({
        where: { UUID: id }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update unit of measure conversion record to DB
let update = (obj, condition, trans = null) => {
    return models.uomconversion.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete unit of measure conversion record to DB
let remove = (condition, trans = null) => {
    return models.uomconversion.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getUoMConversionDataSet: getDataSet,
    getUoMConversionById: getById,
    createUoMConversion: create,
    updateUoMConversion: update,
    removeUoMConversion: remove
}