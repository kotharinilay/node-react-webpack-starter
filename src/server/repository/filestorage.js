'use strict';

/*************************************
 * database interaction methods related to 
 * 'Audit Log' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';
import { forEach as _forEach } from 'lodash';
import { currentDateTime, localToUTC } from '../../shared/format/date';

// create multiple file storage record to DB
let bulkCreate = (obj, trans = null) => {

    _forEach(obj, function (i) {
        i.FileTimestamp = localToUTC(currentDateTime().DateTimeMoment);
    });
    return models.filestorage.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get file storage record by Id
let getById = (id) => {
    return models.filestorage.find({ raw: true, where: { UUID: id } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update multiple file storage record to DB
let update = (obj, condition) => {
    return models.filestorage.update(obj, { where: condition }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete multiple file storage record to DB
let remove = (condition, trans = null) => {
    return models.filestorage.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getFileStorageById: getById,
    updateFileStorage: update,
    removeFileStorage: remove,
    bulkCreateFileStorage: bulkCreate
}