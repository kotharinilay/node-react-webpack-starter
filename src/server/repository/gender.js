'use strict';

/*************************************
 * database interaction methods related to 
 * 'Gender' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create gender record to DB
let create = (obj, trans = null) => {
    return models.gender.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get gender record count
let getCount = () => {
    return models.gender.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// get all gender record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'GenderCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (GenderName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_gender WHERE Language = '${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get gender record by Id
let getById = (id, language) => {
    return models.view_gender.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update gender record to DB
let update = (obj, condition, trans = null) => {
    return models.gender.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete gender record to DB
let remove = (condition, trans = null) => {
    return models.gender.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {

    let batch = [];
    _forEach(obj, function (f) {
        batch.push(`INSERT INTO genderdata (GenderId, Language, GenderCode, GenderName)
        VALUES(fn_UuidToBin('${f.GenderId}'), '${f.Language}', '${f.GenderCode}', '${f.GenderName}') `);
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
            batch.push(`UPDATE genderdata SET GenderCode= '${f.GenderCode}', GenderName = '${f.GenderName}'
                        WHERE GenderId= fn_UuidToBin('${f.GenderId}') AND Language= '${f.Language}'`);
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

// get all gender records
let getAll = (condition) => {
    return models.view_gender.findAll({
        where: condition, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getGenderDataSet: getDataSet,
    getGenderCount: getCount,
    getGenderById: getById,
    createGender: create,
    updateGender: update,
    removeGender: remove,
    updateGenderLanguageData: updateLanguageData,
    getAllGender: getAll
}