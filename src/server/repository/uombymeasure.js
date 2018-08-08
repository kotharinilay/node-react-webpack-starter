'use strict';

/*************************************
 * database interaction methods related to 
 * 'uombymeasure' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';
import { uuidToBuffer } from '../../shared/uuid';

// create multiple record to DB
let bulkCreate = (obj, trans = null) => {
    return models.uombymeasure.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure type record by UoMId
let getUoMByMeasure = (uomId) => {
    return models.uombymeasure.findAll({
        where: { UoMId: uuidToBuffer(uomId) },
        raw: true
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// delete uom by measure record
let remove = (condition, trans = null) => {
    return models.uombymeasure.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get unit of measure type record by UoMType
let getByType = (uomTypeSystemCode, language) => {
    let baseQuery = `
        select u.UUID as Id, ud.UoMName as Name, ud.UoMCode as Code, 
        u.SystemCode
        from uombymeasure um
        left join uomtype ut on ut.Id = um.UoMTypeId
        left join uom u on u.Id = um.UoMId
        left join uomdata ud on ud.UoMId = um.UoMId
        where u.IsDeleted = 0 and ut.SystemCode = '${uomTypeSystemCode}' and ud.Language = '${language}';`;

    return models.sequelize.query(baseQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return JSON.parse(JSON.stringify(result));
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getUoMByMeasure: getUoMByMeasure,
    bulkCreateUnitByMeasure: bulkCreate,
    removeUnitByMeasure: remove,
    getUomByMeasureByType: getByType
}