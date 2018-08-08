'use strict';

/*************************************
 * database interaction methods related to 
 * 'SpeciesType' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

let create = (obj, trans = null) => {
    return models.speciestype.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function (res) {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get species type record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {
    
    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'st.SpeciesNameCode';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (st.SpeciesTypeName LIKE '${searchText}' )`
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS st.SpeciesId, 
        st.SpeciesNameCode
        FROM view_speciestype st        
        WHERE st.SpeciesLanguage='${language}' ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT  FOUND_ROWS() as Total;`
    
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

// get species type detail grid data
let getDetailDataset = (speciesId, language, pageSize, skipRec, sortOrder, sortColumn) => {
    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'st.SpeciesTypeCode';
    }

    let baseQuery =
        `SELECT DISTINCT SQL_CALC_FOUND_ROWS st.Id, st.SystemCode, st.AuditLogId, st.CreatedStamp,
        st.SpeciesTypeCode,
        st.SpeciesTypeName
        FROM view_speciestype st        
        WHERE st.SpeciesId = '${speciesId}' AND st.SpeciesTypeLanguage='${language}' AND st.SpeciesLanguage='${language}' 
        ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};            

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

// get species type record by Id
let getById = (id, language) => {
    return models.view_speciestype.find({
        raw: true, where: { Id: id, SpeciesTypeLanguage: language, SpeciesLanguage: language }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update species type record to DB
let update = (obj, condition, trans = null) => {
    return models.speciestype.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function (res) {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        return new Error(err);
    });
}

// get species type record count
let getCount = () => {
    return models.speciestype.count({ where: { IsDeleted: 0 } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get species type record by species Id
let getBySpeciesId = (speciesIds) => {
    return models.speciestype.findAll({
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
    return new Promise(function (resolve, reject) {
        let batch = [];
        _forEach(obj, function (f) {
            batch.push(`INSERT INTO speciestypedata (SpeciesTypeId, Language, SpeciesTypeCode, SpeciesTypeName)
                        VALUES(fn_UuidToBin('${f.SpeciesTypeId}'), '${f.Language}', '${f.SpeciesTypeCode}', '${f.SpeciesTypeName}') `);
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
            batch.push(`UPDATE speciestypedata SET SpeciesTypeCode= '${f.SpeciesTypeCode}', SpeciesTypeName = '${f.SpeciesTypeName}'
                        WHERE SpeciesTypeId= fn_UuidToBin('${f.SpeciesTypeId}') AND Language= '${f.Language}'`);
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

// get species type records for binding
let getBinding = (language, companyId, regionId, businessId, propertyId, speciesId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';

    let query = `CALL sp_speciestype_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}','${speciesId}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getSpeciesTypeDataSet: getDataSet,
    getSpeciesTypeCount: getCount,
    getSpeciesTypeById: getById,
    getSpeciesTypeBySpeciesId: getBySpeciesId,
    createSpeciesType: create,
    updateSpeciesType: update,
    getSpeciesTypeDetailDataset: getDetailDataset,
    getSpeciesTypeBinding: getBinding
}