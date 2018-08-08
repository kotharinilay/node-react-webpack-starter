'use strict';

/*************************************
 * database interaction methods related to 
 * 'BreedType' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// create breed type record to DB
let create = (obj, trans = null) => {
    return models.breedtype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function () {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get breed type record count
let getCount = () => {
    return models.breedtype.count().then(function (result, err) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all breed type record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'BreedTypeCode'
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (BreedTypeName LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_breedtype WHERE Language='${language}' ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get breed type record by Id
let getById = (uuid, language) => {
    return models.view_breedtype.find({
        where: { UUID: uuid, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update breed type record to DB
let update = (obj, condition, trans = null) => {
    return models.breedtype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete breed type record to DB
let remove = (condition, trans = null) => {
    return models.breedtype.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all breed type record 
let getBreedType = (language) => {
    let query = `SELECT UUID as Id, BreedTypeName, BreedTypeCode, 
                 concat(BreedTypeName,' (', BreedTypeCode,')') AS 'NameCode'
                 FROM view_breedtype WHERE Language='${language}' ORDER BY BreedTypeName ASC`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get breed type list to delete
let checkReferenceExist = (breedTypeIds) => {
    return models.breedtype.findAll({
        raw: true, where: { UUID: breedTypeIds, IsDeleted: 0, '$breed.Id$': null },
        include: [{
            required: false,
            model: models.breed,
            as: 'breed',
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

// private function responsible to create language wise data
let createLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`INSERT INTO breedtypedata (BreedTypeId, Language, BreedTypeCode, BreedTypeName)
        VALUES(fn_UuidToBin('${f.BreedTypeId}'), '${f.Language}', '${f.BreedTypeCode}', '${f.BreedTypeName}') `);
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
            batch.push(`UPDATE breedtypedata SET BreedTypeCode= '${f.BreedTypeCode}', BreedTypeName = '${f.BreedTypeName}'
                        WHERE BreedTypeId= fn_UuidToBin('${f.BreedTypeId}') AND Language= '${f.Language}'`);
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
    getBreedTypeDataSet: getDataSet,
    getBreedTypeById: getById,
    getBreedTypeBinding: getBreedType,
    getBreedTypeCount: getCount,
    createBreedType: create,
    updateBreedType: update,
    updateBreedTypeLanguageData: updateLanguageData,
    checkBreedTypeReferenceExist: checkReferenceExist
}