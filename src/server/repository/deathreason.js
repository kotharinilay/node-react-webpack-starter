'use strict';

/*************************************
 * database interaction methods related to 
 * 'deathreason' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create death reason record to DB
let create = (obj, trans = null) => {
    return models.deathreason.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get death reason record count
let getCount = () => {
    return models.deathreason.count().then(function (result, err) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get death reason record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'DeathReasonCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (DeathReasonName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_deathreason WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get death reason record by Id
let getById = (id, language) => {
    return models.view_deathreason.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update death reason record to DB
let update = (obj, condition, trans = null) => {
    return models.deathreason.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete death reason record to DB
let remove = (condition, trans = null) => {
    return models.deathreason.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {

    let batch = [];
    _forEach(obj, function (f) {
        batch.push(`INSERT INTO deathreasondata (DeathReasonId, Language, DeathReasonCode, DeathReasonName)
        VALUES(fn_UuidToBin('${f.DeathReasonId}'), '${f.Language}', '${f.DeathReasonCode}', '${f.DeathReasonName}') `);
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
            batch.push(`UPDATE deathreasondata SET DeathReasonCode= '${f.DeathReasonCode}', DeathReasonName = '${f.DeathReasonName}'
                        WHERE DeathReasonId= fn_UuidToBin('${f.DeathReasonId}') AND Language= '${f.Language}'`);
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

module.exports = {
    getDeathReasonDataSet: getDataSet,
    getDeathReasonCount: getCount,
    getDeathReasonById: getById,
    createDeathReason: create,
    updateDeathReason: update,
    removeDeathReason: remove,
    updateDeathReasonLanguageData: updateLanguageData
}