'use strict';

/*************************************
 * database interaction methods related to 
 * 'feedstock' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';

// create feed record to DB
let bulkCreate = (obj, trans = null) => {
    return models.feedstock.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update feed stock record to DB
let update = (obj, condition, trans = null) => {
    return models.feedstock.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get feed stock record by Id
let getByFeedId = (id, trans = null, isDeleted = 0) => {
    return models.feedstock.findAll({
        raw: true, where: { FeedId: id, IsDeleted: isDeleted }, transaction: trans
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    createFeedStock: bulkCreate,
    updateFeedStock: update,
    getFeedStockByFeedId: getByFeedId
}