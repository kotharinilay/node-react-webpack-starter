'use strict';

/*************************************
 * database interaction methods related to 
 * 'Audit Log' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';

// create auditlog record to DB
let create = (obj, trans = null) => {
    return models.auditlog.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple auditlog record to DB
let bulkCreate = (obj, trans = null) => {
    return models.auditlog.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get auditlog record by Id
let getById = (id) => {
    return models.auditlog.find({ raw: true, where: { UUID: id } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update auditlog record to DB
let update = (obj, condition, trans = null) => {
    return models.auditlog.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete auditlog record to DB
let remove = (condition, trans = null) => {
    return models.auditlog.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getAuditLogById: getById,
    createAuditLog: create,
    updateAuditLog: update,
    removeAuditLog: remove,
    bulkCreateAuditLog: bulkCreate
}