'use strict';

/*************************************
 * database interaction methods related to 
 * 'feed' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';

// create feed record to DB
let create = (obj, trans = null) => {
    return models.feed.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update feed record to DB
let update = (obj, condition, trans = null) => {
    return models.feed.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all feed record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'Name';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` WHERE (Name LIKE '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_feed ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// get feed record by Id
let getById = (condition, attr) => {
    return models.feed.findAll({
        raw: true,
        attributes: attr,
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get feed/feedcomposition/feedstock records by FeedId
let getFeedStockCompById = (feedId) => {
    let baseQuery = `
    SELECT f.UUID as Id, f.Name, c.UUID as CompanyId, c.Name as Company, p.UUID as PropertyId, c.CompanyType as Type, p.PIC as Property, f.AuditLogId
    FROM feed f
    left join company c on c.Id = f.CompanyId
    left join property p on p.Id = f.PropertyId
    WHERE f.UUID = '${feedId}' and f.IsDeleted=0;

    SELECT c.UUID as Id, c.Name, c.Value
    FROM feedcomposition c
    left join feed f on c.FeedId = f.Id
    WHERE f.UUID = '${feedId}' and f.IsDeleted=0;

    SELECT s.UUID as Id, s.StockOnHand, s.StockOnDate, c.UUID as CompanyId, c.Name as Company, c.CompanyType as Type, p.UUID as PropertyId, p.PIC as Property, s.StockCost, a.UUID as AuditLogId, s.IsDeleted
    FROM feedstock s
    left join feed f on f.Id = s.FeedId
    left join AuditLog a on a.Id = s.AuditLogId
    left join company c on c.Id = s.CompanyId
    left join property p on p.Id = s.PropertyId
    WHERE f.UUID = '${feedId}' and f.IsDeleted=0 and s.IsDeleted=0;    
    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        return resultData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// check feed name duplication
let checkFeedName = (name, feedId) => {
    return models.feed.count({ raw: true, where: { Name: name, UUID: { $not: feedId } } }).then(function (result) {
        return result == 0;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getFeedDataSet: getDataSet,
    getFeedByCondition: getById,
    getFeedStockCompById: getFeedStockCompById,
    createFeed: create,
    updateFeed: update,
    checkFeedName: checkFeedName
}