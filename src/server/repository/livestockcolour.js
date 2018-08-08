'use strict';

/*************************************
 * database interaction methods related to 
 * 'livestockcolour' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create livestock colour record to DB
let create = (obj, trans = null) => {
    return models.livestockcolour.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestock colour record count
let getCount = () => {
    return models.livestockcolour.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestock colour record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == undefined || sortColumn == null) {
        sortColumn = 'LivestockColourCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (LivestockColourName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_livestockcolour WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get livestock colour record by Id
let getById = (id, language) => {
    return models.view_livestockcolour.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update livestock colour record to DB
let update = (obj, condition, trans = null) => {
    return models.livestockcolour.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// deletes livestock colour record to DB
let remove = (condition, trans = null) => {
    return models.livestockcolour.destroy({ where: condition, transaction: trans }).then(function (result) {
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
            batch.push(`INSERT INTO livestockcolourdata (LivestockColourId, Language, ColourCode, ColourName)
        VALUES(fn_UuidToBin('${f.LivestockColourId}'), '${f.Language}', '${f.ColourCode}', '${f.ColourName}') `);
        });
        if (batch.length > 0) {
            return models.sequelize.query(batch.join(';'), { transaction: trans }).then(function (result) {
                return resolve(result);
            }).catch(function (err) {

                throw new Error(err);
            });
        }
        return resolve(result);
    });
}

// private function responsible to create language wise data
let updateLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {

        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`UPDATE livestockcolourdata SET ColourCode= '${f.ColourCode}', ColourName = '${f.ColourName}'
                        WHERE LivestockColourId = fn_UuidToBin('${f.LivestockColourId}') AND Language= '${f.Language}'`);
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

// get all livestock colours for drop down
let getLivestockColours = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_livestockcolor_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
    console.log(query);
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getLivestockColourDataSet: getDataSet,
    getLivestockColourCount: getCount,
    getLivestockColourById: getById,
    createLivestockColour: create,
    updateLivestockColour: update,
    removeLivestockColour: remove,
    updateLivestockColourLanguageData: updateLanguageData,
    getLivestockColourBindings: getLivestockColours
}