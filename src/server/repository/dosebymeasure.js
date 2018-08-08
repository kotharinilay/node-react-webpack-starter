'use strict';

/*************************************
 * database interaction methods related to 
 * 'dosebymeasure' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create multiple dose by measure record to DB
let bulkCreate = (obj, trans = null) => {
    return models.dosebymeasure.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all death reason record
let getDoseByMeasureAll = (configuredByAdmin) => {
    return models.dosebymeasure.findAll({
        raw: true, where: { IsConfiguredByAdmin: configuredByAdmin },
        include: [{
            model: models.uom,
            as: 'uom',
            attributes: ['UUID'],
            where: { IsDeleted: 0 }
        }],
        attributes: ['UUID', 'UoMId', 'AuditLogId']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete death reason records to DB
let remove = (condition, trans = null) => {
    return models.dosebymeasure.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getDoseByMeasureAll: getDoseByMeasureAll,
    createDoseByMeasure: bulkCreate,
    removeDoseByMeasure: remove    
}