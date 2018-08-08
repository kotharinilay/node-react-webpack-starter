'use strict';

/*************************************
 * database interaction methods related to 
 * 'feedcomposition' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';

// create feed composition record to DB
let bulkCreate = (obj, trans = null) => {
    return models.feedcomposition.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete feed composition record to DB
let remove = (condition, trans = null) => {
    return models.feedcomposition.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all feed composition record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj) => {

    if (sortColumn == null) {
        sortColumn = 'Name  ';
    }

    let searchQuery = '';
    if (filterObj)
        searchQuery = `LEFT JOIN feed f ON f.Id = c.FeedId WHERE f.UUID = '${filterObj}'`;

    if (searchText) {
        searchQuery = searchQuery ? ` AND ` : ` WHERE ` + `c.Name LIKE '${searchText}'`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS c.* FROM feedcomposition c ${searchQuery} ORDER BY c.${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get feed record by feedId
let getByFeedId = (id) => {
    return models.feedcomposition.find({
        raw: true, where: { FeedId: id }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    bulkCreateFeedComposition: bulkCreate,
    removeFeedComposition: remove,
    getFeedCompDataSet: getDataSet,
    getFeedCompositionByFeedId: getByFeedId
}