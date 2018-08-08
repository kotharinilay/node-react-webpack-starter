'use strict';

/*************************************
 * database interaction methods related to 
 * 'Breed' table
 * *************************************/

import models from '../schema';
import { newUUID, uuidToBuffer } from '../../shared/uuid';
import { forEach as _forEach } from 'lodash';

// create breed record to DB
let create = (obj, trans = null) => {
    return models.breed.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all breed record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'vb.SpeciesName';
        sortOrder = 'asc';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (vb.BreedName LIKE '${searchText}') `;
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS CONCAT(vb.SpeciesId, '#', IFNULL(vb.BreedTypeId,'')) AS Id, vb.SpeciesId, 
        vb.BreedTypeId,
        vb.SpeciesName as SpeciesNameCode,
        vb.BreedTypeName as BreedTypeNameCode      
        FROM view_breed vb
        WHERE vb.Language='${language}' ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        
        SELECT FOUND_ROWS() AS Total;`;

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

// get breed detail grid data
let getDetailDataset = (speciesId, breedTypeId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = ' vb.SystemCode';
    }

    let filterSpecie = '';
    if (speciesId != null && speciesId != undefined) {
        filterSpecie = ` vb.SpeciesId = '${speciesId}' `;
    }
    let filterBreedType = '';
    if (breedTypeId != null && breedTypeId != undefined) {
        filterBreedType = ` ${filterSpecie != '' ? ' AND ' : null} vb.BreedTypeId = '${breedTypeId}' `;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS vb.Id, vb.SystemCode, vb.AuditLogId, vb.CreatedStamp,
        vb.BreedCode, vb.BreedName
        FROM view_breed vb
        LEFT JOIN auditlog a ON a.Id = fn_UuidToBin(vb.AuditLogId)
        ${filterSpecie != '' || filterBreedType != '' ? ' WHERE ' : null}
        ${filterSpecie}${filterBreedType}
        ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT FOUND_ROWS() AS Total; `;

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

// get breed record by Id
let getById = (id, language) => {
    return models.view_breed.find({
        raw: true, where: { Id: id, Language: language }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update breed record to DB
let update = (obj, condition, trans = null) => {
    return models.breed.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get breed record count
let getCount = () => {
    return models.breed.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get breed record by species Ids
let getBySpeciesId = (speciesIds) => {
    return models.breed.findAll({
        raw: true, where: { SpeciesId: speciesIds, IsDeleted: 0 },
        include: [{
            model: models.species,
            attributes: ['UUID'],
            as: 'specyId'
        }],
        attributes: ['UUID']
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
        batch.push(`INSERT INTO breeddata (BreedId, Language, BreedCode, BreedName)
        VALUES(fn_UuidToBin('${f.BreedId}'), '${f.Language}', '${f.BreedCode}', '${f.BreedName}') `);
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
            batch.push(`UPDATE breeddata SET BreedCode= '${f.BreedCode}', BreedName = '${f.BreedName}'
        WHERE BreedId= fn_UuidToBin('${f.BreedId}') AND Language= '${f.Language}'`);
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

// get breed records
let getAll = (condition) => {
    return models.view_breed.findAll({
        raw: true, where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getBreedCount: getCount,
    getBreedDataSet: getDataSet,
    getBreedBySpeciesId: getBySpeciesId,
    getBreedById: getById,
    createBreed: create,
    updateBreed: update,
    getBreedDetailDataset: getDetailDataset,
    getAllBreed: getAll
}