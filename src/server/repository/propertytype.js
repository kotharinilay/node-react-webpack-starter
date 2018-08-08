'use strict';

/*************************************
 * database interaction methods related to 
 * 'PropertyType' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create property type record to DB
let create = (obj, trans = null) => {
    return models.propertytype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get property type record count
let getCount = () => {
    return models.propertytype.count({ where: { IsDeleted: 0 } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get property type record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'PropertyTypeCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (PropertyTypeName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS * FROM view_propertytype WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
         SELECT FOUND_ROWS() as Total;`

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

// get property type record by Id
let getById = (id, language) => {
    return models.view_propertytype.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update property type record to DB
let update = (obj, condition, trans = null) => {
    return models.propertytype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete property type record to DB
let remove = (condition, trans = null) => {
    return models.propertytype.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getPropertyTypes = (language) => {
    let query = `SELECT Id, SystemCode, PropertyTypeName, PropertyTypeCode, 
                concat(PropertyTypeName, ' (', PropertyTypeCode, ')') AS 'NameCode'
                FROM view_propertytype WHERE Language = '${language}' ORDER BY PropertyTypeName ASC`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {

    let batch = [];
    _forEach(obj, function (f) {
        batch.push(`INSERT INTO propertytypedata (PropertyTypeId, Language, PropertyTypeCode, PropertyTypeName)
        VALUES(fn_UuidToBin('${f.PropertyTypeId}'), '${f.Language}', '${f.PropertyTypeCode}', '${f.PropertyTypeName}') `);
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
            batch.push(`UPDATE propertytypedata SET PropertyTypeCode= '${f.PropertyTypeCode}', PropertyTypeName = '${f.PropertyTypeName}'
                        WHERE PropertyTypeId = fn_UuidToBin('${f.PropertyTypeId}') AND Language= '${f.Language}'`);
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
    getPropertyTypeDataSet: getDataSet,
    getPropertyTypeCount: getCount,
    getPropertyTypeById: getById,
    getPropertyTypeBindings: getPropertyTypes,
    createPropertyType: create,
    updatePropertyType: update,
    removePropertyType: remove,
    updatePropertyTypeLanguageData: updateLanguageData
}