'use strict';

/*************************************
 * database interaction methods related to 
 * 'Maturity' table
 * *************************************/

import models from '../schema';
import { forEach as _forEach } from 'lodash';
import Promise from 'bluebird';

// create maturity record to DB
let create = (obj, trans = null) => {
    return models.maturity.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all maturity record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'vm.SpeciesNameCode';
        sortOrder = 'asc';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (vm.MaturityName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS vm.SpeciesId as Id, vm.SpeciesNameCode
        FROM view_maturity vm
        WHERE vm.SpeciesLanguage='${language}' AND vm.Language='${language}'
        ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        
        SELECT FOUND_ROWS() AS Total;`;
    
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

// get maturity detail grid data
let getDetailDataset = (speciesId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'CreatedStamp';
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS vm.Id,vm.SystemCode,vm.AuditLogId,vm.CreatedStamp,vm.MaturityCode,vm.MaturityName 
        FROM view_maturity vm
        WHERE vm.SpeciesLanguage='${language}' AND vm.Language='${language}' AND vm.SpeciesId = '${speciesId}' ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
            
        SELECT FOUND_ROWS() AS Total;`;
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

// get maturity record by Id
let getById = (id, language) => {
    return models.view_maturity.find({
        raw: true, where: { Id: id, SpeciesLanguage: language, Language: language }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update maturity record to DB
let update = (obj, condition, trans = null) => {
    return models.maturity.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get maturity record count
let getCount = () => {
    return models.maturity.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get maturity record by species Id
let getBySpeciesId = (speciesIds, language) => {
    return models.view_maturity.findAll({
        raw: true, where: { SpeciesId: speciesIds, Language: language, SpeciesLanguage: language }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {

    let batch = [];
    _forEach(obj, function (f) {
        batch.push(`INSERT INTO maturitydata (MaturityId, Language, MaturityCode, MaturityName)
        VALUES(fn_UuidToBin('${f.MaturityId}'), '${f.Language}', '${f.MaturityCode}', '${f.MaturityName}') `);
    });

    return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let updateLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {

        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`UPDATE maturitydata SET MaturityCode= '${f.MaturityCode}', MaturityName = '${f.MaturityName}'
                        WHERE MaturityId = fn_UuidToBin('${f.MaturityId}') AND Language= '${f.Language}'`);
        });
        if (batch.length > 0) {
            return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
                resolve(result);
            }).catch(function (err) {
                throw new Error(err);
            });
        }
        return resolve();
    });
}

// get maturity records
let getAll = (condition) => {
    return models.view_maturity.findAll({
        raw: true, where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getMaturityDataSet: getDataSet,
    getMaturityCount: getCount,
    getMaturityById: getById,
    getMaturityBySpeciesId: getBySpeciesId,
    createMaturity: create,
    updateMaturity: update,
    getMaturityDetailDataset: getDetailDataset,
    getAllMaturity: getAll
}