'use strict';

/*************************************
 * database interaction methods related to 
 * 'accreditationprogram' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import { forEach as _forEach } from 'lodash';

// get accreditation program record count
let getCount = () => {
    return models.accreditationprogram.count().then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all accreditation program record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, language) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'AccreditationProgramCode'
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (AccreditationProgramName LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_accreditationprogram WHERE IsDeleted = 0 AND Language='${language}'  ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get accreditation program record by Id
let getById = (id) => {
    return models.view_accreditationprogram.find({
        where: { Id: id, Language: 'en' }, raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create accreditation program record to DB
let create = (obj, trans = null) => {
    return models.accreditationprogram.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return createLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update program record to DB
let update = (obj, condition, trans = null) => {
    return models.accreditationprogram.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).then(function (result) {
        return updateLanguageData(obj.LocalizedData, trans);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete accreditation program record to DB
let remove = (condition, trans = null) => {
    return models.accreditationprogram.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all accreditation program record for dropdown
let getAll = (language) => {
    return models.view_accreditationprogram.findAll({
        raw: true,
        where: { Language: language, IsActive: 1, IsDeleted: 0 }
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
        batch.push(`INSERT INTO accreditationprogramdata (ProgramId,Language,ProgramCode,ProgramName) 
                    VALUES (fn_UuidToBin('${f.ProgramId}'),'${f.Language}','${f.ProgramCode}','${f.ProgramName}')`);
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
            batch.push(`UPDATE accreditationprogramdata SET ProgramCode='${f.ProgramCode}',ProgramName='${f.ProgramName}' 
                    WHERE ProgramId=fn_UuidToBin('${f.ProgramId}') AND Language='${f.Language}'`);
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
    getProgramDataSet: getDataSet,
    getProgramCount: getCount,
    getProgramById: getById,
    createProgram: create,
    updateProgram: update,
    removeProgram: remove,
    getAllProgram: getAll
}