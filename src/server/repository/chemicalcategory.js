'use strict';

/*************************************
 * database interaction methods related to 
 * 'ChemicalCategory' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create chemical category record to DB
let create = (obj, trans = null) => {
    return models.chemicalcategory.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get chemical category record count
let getCount = () => {
    return models.chemicalcategory.count().then(function (result, err) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical category record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'ChemicalCategoryCode'
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (ChemicalCategoryName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_chemicalcategory WHERE Language='${language}' ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get chemical category record by Id
let getById = (uuid, language) => {
    return models.view_chemicalcategory.find({
        where: { Id: uuid, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update chemical category record to DB
let update = (obj, condition, trans = null) => {
    return models.chemicalcategory.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete chemical category record to DB
let remove = (condition, trans = null) => {
    return models.chemicalcategory.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical category record for drop down
let getChemicalCategory = (language) => {
    let query = `SELECT Id, ChemicalCategoryName, ChemicalCategoryCode, 
                concat(ChemicalCategoryName, ' (', ChemicalCategoryCode,')') AS 'NameCode'
                FROM view_chemicalcategory WHERE Language='${language}' ORDER BY ChemicalCategoryName ASC`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`INSERT INTO chemicalcategorydata (CategoryId, Language, ChemicalCategoryCode, ChemicalCategoryName)
                        VALUES(fn_UuidToBin('${f.CategoryId}'), '${f.Language}', '${f.ChemicalCategoryCode}', '${f.ChemicalCategoryName}') `);
        });

        if (batch.length > 0) {
            return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
                return resolve(result);
            }).catch(function (err) {
                throw new Error(err);
            });
        }
        return resolve();
    });
}

// private function responsible to create language wise data
let updateLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`UPDATE chemicalcategorydata SET ChemicalCategoryCode= '${f.ChemicalCategoryCode}', ChemicalCategoryName = '${f.ChemicalCategoryName}'
                        WHERE CategoryId = fn_UuidToBin('${f.CategoryId}') AND Language= '${f.Language}'`);
        });

        if (batch.length > 0) {
            return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
                return resolve(result);
            }).catch(function (err) {
                throw new Error(err);
            });
        }
        return resolve();
    });
}

module.exports = {
    getChemicalCategoryDataSet: getDataSet,
    getChemicalCategoryCount: getCount,
    getChemicalCategoryById: getById,
    getChemicalCategoryBinding: getChemicalCategory,
    createChemicalCategory: create,
    updateChemicalCategory: update,
    removeChemicalCategory: remove,
    updateChemicalCategoryLanguageData: updateLanguageData
}