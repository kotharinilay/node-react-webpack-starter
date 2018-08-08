'use strict';

/*************************************
 * database interaction methods related to 
 * 'ServiceType' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create service type record to DB
let create = (obj, trans = null) => {
    return models.servicetype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get service type record count
let getCount = () => {
    return models.servicetype.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all service type record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'ServiceTypeCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (ServiceTypeName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS *  FROM view_servicetype WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get service type record by Id
let getById = (uuid, language) => {
    return models.view_servicetype.find({
        where: { Id: uuid, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update service type record to DB
let update = (obj, condition, trans = null) => {
    return models.servicetype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete service type record to DB
let remove = (condition, trans = null) => {
    return models.servicetype.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getServiceTypes = (language) => {

    let query = `SELECT Id, ServiceTypeName, ServiceTypeCode, 
                concat(ServiceTypeName, ' (', ServiceTypeCode, ')') AS 'NameCode'
                FROM view_servicetype WHERE Language = '${language}' ORDER BY ServiceTypeName ASC`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// bulk create companyservicetype
let bulkCreateCompanyservicetype = (obj, trans = null) => {
    return models.companyservicetype.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// bulk create companyservicetype
let deleteCompanyservicetype = (condition, trans = null) => {
    return models.companyservicetype.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {

    let batch = [];
    _forEach(obj, function (f) {
        batch.push(`INSERT INTO servicetypedata (ServiceTypeId, Language, ServiceTypeCode, ServiceTypeName)
        VALUES(fn_UuidToBin('${f.ServiceTypeId}'), '${f.Language}', '${f.ServiceTypeCode}', '${f.ServiceTypeName}') `);
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
            batch.push(`UPDATE servicetypedata SET ServiceTypeCode= '${f.ServiceTypeCode}', ServiceTypeName = '${f.ServiceTypeName}'
                        WHERE ServiceTypeId = fn_UuidToBin('${f.ServiceTypeId}') AND Language= '${f.Language}'`);
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
    getServiceTypeDataSet: getDataSet,
    getServiceTypeCount: getCount,
    getServiceTypeBinding: getServiceTypes,
    getServiceTypeById: getById,
    createServiceType: create,
    updateServiceType: update,
    removeServiceType: remove,
    createCompanyservicetype: bulkCreateCompanyservicetype,
    deleteCompanyservicetype: deleteCompanyservicetype
}