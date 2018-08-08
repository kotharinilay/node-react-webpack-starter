'use strict';

/*************************************
 * database interaction methods related to 
 * 'treatmentmethod' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create treatment method record to DB
let create = (obj, trans = null) => {
    return models.treatmentmethod.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get treatment method record count
let getCount = () => {
    return models.treatmentmethod.count({ where: { IsDeleted: 0 } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get treatment method record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'TreatmentMethodCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (TreatmentMethodName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_treatmentmethod WHERE Language='${language}' ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get treatment method record by Id
let getById = (id, language) => {
    return models.view_treatmentmethod.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update treatment method record to DB
let update = (obj, condition, trans = null) => {
    return models.treatmentmethod.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete treatment method record to DB
let remove = (condition, trans = null) => {
    return models.treatmentmethod.destroy({ where: condition, transaction: trans }).then(function (result) {
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
            batch.push(`INSERT INTO treatmentmethoddata (TreatmentMethodId, Language, MethodCode, MethodName)
                        VALUES(fn_UuidToBin('${f.TreatmentMethodId}'), '${f.Language}', '${f.MethodCode}', '${f.MethodName}') `);
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
            batch.push(`UPDATE treatmentmethoddata SET MethodCode= '${f.MethodCode}', MethodName = '${f.MethodName}'
                        WHERE TreatmentMethodId=fn_UuidToBin('${f.TreatmentMethodId}') AND Language= '${f.Language}'`);
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

// get all treatmentmethod product for dropdown binding
let getBySearch = (searchText, companyId, regionId, businessId, propertyId, language) => {
    companyId = companyId ? `'${companyId}'` : null;
    regionId = regionId ? `'${regionId}'` : null;
    businessId = businessId ? `'${businessId}'` : null;
    propertyId = propertyId ? `'${propertyId}'` : null;

    let query = `CALL sp_treatmentmethod_ddl(${propertyId},${companyId},${regionId},${businessId},'${language}','${searchText}');`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getTreatmentMethodDataSet: getDataSet,
    getTreatmentMethodCount: getCount,
    getTreatmentMethodById: getById,
    createTreatmentMethod: create,
    updateTreatmentMethod: update,
    removeTreatmentMethod: remove,
    updateTreatmentMethodLanguageData: updateLanguageData,
    getTreatmentMethodSearch: getBySearch
}