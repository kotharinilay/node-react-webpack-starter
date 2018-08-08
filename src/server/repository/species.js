'use strict';

/*************************************
 * database interaction methods related to 
 * 'Speices' table
 * *************************************/

import models from '../schema';
import { forEach as _forEach } from 'lodash'

// create species record to DB
let create = (obj, trans = null) => {
    return models.species.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all species record for grid
let getDataSet = (pageSize, skipRec, sortAsc, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'SystemCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery =
            ` AND (SpeciesName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_species WHERE Language = '${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortAsc} LIMIT ${skipRec},${pageSize};
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

// get species record by Id
let getById = (id, language) => {
    return models.view_species.find({
        where: { Id: id, Language: language }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update species record to DB
let update = (obj, condition, trans = null) => {
    return models.species.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get species record count
let getCount = () => {
    return models.species.count({ where: { IsDeleted: 0 } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete species record to DB
let remove = (condition, trans = null) => {
    return models.species.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all species record for drop down
let getSpecies = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_species_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
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
            batch.push(`INSERT INTO speciesdata (SpeciesId, Language, SpeciesCode, SpeciesName)
                        VALUES(fn_UuidToBin('${f.SpeciesId}'), '${f.Language}', '${f.SpeciesCode}', '${f.SpeciesName}') `);
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

// get species list to delete
let checkReferenceExist = (speciesIds) => {
    return models.species.findAll({
        raw: true, where: { UUID: speciesIds, IsDeleted: 0, '$breed.Id$': null, '$maturity.Id$': null },
        include: [{
            required: false,
            model: models.breed,
            as: 'breed',
            attributes: [],
            where: { IsDeleted: 0 }
        }, {
            required: false,
            model: models.maturity,
            as: 'maturity',
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
let updateLanguageData = (obj, trans = null) => {
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`UPDATE speciesdata SET SpeciesCode= '${f.SpeciesCode}', SpeciesName = '${f.SpeciesName}'
                        WHERE SpeciesId= fn_UuidToBin('${f.SpeciesId}') AND Language= '${f.Language}'`);
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
    getSpeciesDataSet: getDataSet,
    getSpeciesCount: getCount,
    getSpeciesBinding: getSpecies,
    getSpeciesById: getById,
    createSpecies: create,
    updateSpecies: update,
    removeSpecies: remove,
    updateSpeciesLanguageData: updateLanguageData,
    checkSpeciesReferenceExist: checkReferenceExist
}