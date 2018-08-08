'use strict';

/*************************************
 * database interaction methods related to 
 * 'EnclosureType' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';
import { forEach as _forEach } from 'lodash';

// create enclosure type record to DB
let create = (obj, trans = null) => {
    return models.enclosuretype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get enclosure type record count
let getCount = () => {
    return models.enclosuretype.count().then(function (result, err) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get enclosure type record for grid
let getDataSet = (language, pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'EnclosureTypeCode';
    }

    let configuredByAdmin = 1;

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (EnclosureTypeName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_enclosuretype WHERE IsConfiguredByAdmin = ${configuredByAdmin} AND Language = '${language}' ${searchQuery}                 
         ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get enclosure type record by Id
let getById = (uuid, language) => {
    return models.view_enclosuretype.find({
        where: { Id: uuid, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update enclosure type record to DB
let update = (obj, condition, trans = null) => {
    return models.enclosuretype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete enclosure type record to DB
let remove = (condition, trans = null) => {
    return models.enclosuretype.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all enclosure type record for drop down
let getEnclosureType = (language) => {
    return models.view_enclosuretype.findAll({
        where: { Language: language }, raw: true,
        attributes: ['Id',
            [sequelize.fn('concat', sequelize.col('EnclosureTypeName'), ' (', sequelize.col('EnclosureTypeCode'), ')'), 'NameCode']]
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
        batch.push(`INSERT INTO enclosuretypedata (EnclosureTypeId, Language, EnclosureTypeCode, EnclosureTypeName)
        VALUES(fn_UuidToBin('${f.EnclosureTypeId}'), '${f.Language}', '${f.EnclosureTypeCode}', '${f.EnclosureTypeName}') `);
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
            batch.push(`UPDATE enclosuretypedata SET EnclosureTypeCode= '${f.EnclosureTypeCode}', EnclosureTypeName = '${f.EnclosureTypeName}'
                        WHERE EnclosureTypeId= fn_UuidToBin('${f.EnclosureTypeId}') AND Language= '${f.Language}'`);
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

// get all enclosure type for drop down
let getBindings = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_enclosuretype_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getEnclosureTypeDataSet: getDataSet,
    getEnclosureTypeCount: getCount,
    getEnclosureTypeById: getById,
    getAllEnclosureType: getEnclosureType,
    createEnclosureType: create,
    updateEnclosureType: update,
    removeEnclosureType: remove,
    updateEnclosureTypeLanguageData: updateLanguageData,
    getEnclosureTypeBindings: getBindings
}