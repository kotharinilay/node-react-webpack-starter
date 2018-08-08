'use strict';

/*************************************
 * database interaction methods related to 
 * 'Uom' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';
import { forEach as _forEach } from 'lodash';

// create unit of measure record to DB
let create = (obj, trans = null) => {
    return models.uom.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'UomCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (UomName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_uom WHERE Language='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get unit of measure record by Id
let getById = (id, language) => {
    return models.view_uom.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all unit of measure record for drop down
function getUoM(condition) {
    return models.view_uom.findAll({
        raw: true,
        attributes: ['Id', 'UomName', 'SystemCode', [sequelize.fn('concat', sequelize.col('UomName'), ' (', sequelize.col('UomCode'), ')'), 'NameCode']],
        where: condition,
        order:[
            ['UomName', 'asc']
        ]
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update unit of measure record to DB
let update = (obj, condition, trans = null) => {
    return models.uom.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete unit of measure record to DB
let remove = (condition, trans = null) => {
    return models.uom.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure record to delete by Id
let checkReferenceExist = (uomIds) => {
    return models.uom.findAll({
        raw: true, where: { UUID: uomIds, IsDeleted: 0, '$uomconversion.Id$': null, '$uomconversion1.Id$': null },
        include: [{
            required: false,
            model: models.uomconversion,
            as: 'uomconversion',
            attributes: [],
            where: { IsDeleted: 0 }
        }, {
            required: false,
            model: models.uomconversion,
            as: 'uomconversion1',
            attributes: [],
            where: { IsDeleted: 0 }
        }],
        attributes: ['UUID']
    }).then(function (result) {
        let response = [];
        result.map((d) => {
            response.push(d.UUID);
        })
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure record count
let getCount = () => {
    return models.uom.count({ where: { IsDeleted: 0 } }).then(function (result) {
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
            batch.push(`INSERT INTO uomdata (UoMId, Language, UoMCode, UoMName)
                        VALUES(fn_UuidToBin('${f.UoMId}'), '${f.Language}', '${f.UoMCode}', '${f.UoMName}') `);
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
            batch.push(`UPDATE uomdata SET UoMCode= '${f.UoMCode}', UoMName = '${f.UoMName}'
                        WHERE UoMId=fn_UuidToBin('${f.UoMId}') AND Language= '${f.Language}'`);
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
    getUoMDataSet: getDataSet,
    getUoMById: getById,
    getUoMBinding: getUoM,
    getUoMCount: getCount,
    createUoM: create,
    updateUoM: update,
    updateUoMLanguageData: updateLanguageData,
    removeUoM: remove,
    checkUoMReferenceExist: checkReferenceExist
}