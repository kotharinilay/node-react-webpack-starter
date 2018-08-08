'use strict';

/*************************************
 * database interaction methods related to 
 * 'group' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';
import { forEach as _forEach } from 'lodash';

// create group record to DB
let create = (obj, trans = null) => {
    return models.livestockgroup.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get group record count
let getCount = () => {
    return models.livestockgroup.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all group record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'GroupCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (GroupName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_livestockgroup WHERE Language = '${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get group record by Id
let getById = (id, language) => {
    return models.view_livestockgroup.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update group record to DB
let update = (obj, condition, trans = null) => {
    return models.livestockgroup.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete group record to DB
let remove = (condition, trans = null) => {
    return models.livestockgroup.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all livestock group for drop down
let getBindings = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_livestockgroup_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`INSERT INTO livestockgroupdata (LivestockGroupId, Language, GroupCode, GroupName)
        VALUES(fn_UuidToBin('${f.LivestockGroupId}'), '${f.Language}', '${f.GroupCode}', '${f.GroupName}') `);
        });
        return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
            return resolve(result);
        }).catch(function (err) {
            throw new Error(err);
        });
        return resolve(result);
    });
}

// private function responsible to create language wise data
let updateLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {

        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`UPDATE livestockgroupdata SET GroupCode= '${f.GroupCode}', GroupName = '${f.GroupName}'
                        WHERE LivestockGroupId = fn_UuidToBin('${f.LivestockGroupId}') AND Language= '${f.Language}'`);
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
    getLivestockGroupDataSet: getDataSet,
    getLivestockGroupCount: getCount,
    getLivestockGroupById: getById,
    createLivestockGroup: create,
    updateLivestockGroup: update,
    removeLivestockGroup: remove,
    getLivestockGroupBindings: getBindings,
    updateLivestockGroupLanguageData: updateLanguageData
}