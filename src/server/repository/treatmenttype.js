'use strict';

/*************************************
 * database interaction methods related to 
 * 'treatmenttype' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create treatment type record to DB
let create = (obj, trans = null) => {
    return models.treatmenttype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get treatment type record count
let getCount = () => {
    return models.treatmenttype.count({ where: { IsDeleted: 0 } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get treatment type record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'TreatmentTypeCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (TreatmentTypeName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_treatmenttype WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get treatment type record by Id
let getById = (id, language) => {
    return models.view_treatmenttype.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update treatment type record to DB
let update = (obj, condition, trans = null) => {
    return models.treatmenttype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete treatment type record to DB
let remove = (condition, trans = null) => {
    return models.treatmenttype.destroy({ where: condition, transaction: trans }).then(function (result) {
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
            batch.push(`INSERT INTO treatmenttypedata (TreatmentTypeId, Language, TypeCode, TypeName)
                        VALUES(fn_UuidToBin('${f.TreatmentTypeId}'), '${f.Language}', '${f.TypeCode}', '${f.TypeName}') `);
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
            batch.push(`UPDATE treatmenttypedata SET TypeCode= '${f.TypeCode}', TypeName = '${f.TypeName}'
                        WHERE TreatmentTypeId=fn_UuidToBin('${f.TreatmentTypeId}') AND Language= '${f.Language}'`);
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
    getTreatmentTypeCount: getCount,
    getTreatmentTypeById: getById,
    getTreatmentTypeDataSet: getDataSet,
    createTreatmentType: create,
    updateTreatmentType: update,
    removeTreatmentType: remove,
    updateTreatmentTypeLanguageData: updateLanguageData
}