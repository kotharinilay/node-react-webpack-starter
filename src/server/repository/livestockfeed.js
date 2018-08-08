'use strict';

/*************************************
 * database interaction methods related to 
 * 'livestockfeed' table
 * *************************************/

import models from '../schema';
import { map as _map } from 'lodash';

// create livestock feed record to DB
let createLivestockFeed = (obj, trans = null) => {
    return models.livestockfeed.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// bulk create livestock feed record to DB
let bulkCreateLivestockFeedDetail = (obj, trans = null) => {
    return models.livestockfeeddetail.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all feed record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, filterObj, searchText) => {

    if (!sortColumn) {
        sortColumn = 'DateOfFeed';
    }

    let filterQuery = ` `;
    if (filterObj && filterObj.propertyId) {
        filterQuery = ` WHERE lf.PropertyId = fn_UuidToBin('${filterObj.propertyId}')`;
        if (filterObj.monthOfFeed)
            filterQuery += ` AND DATE_FORMAT(lf.DateOfFeed, '%b-%Y') = '${filterObj.monthOfFeed}'`;
    }

    let searchQuery='';
    if(searchText){
        searchQuery = ` AND (f.Name LIKE '${searchText}' OR e.Name LIKE '${searchText}')`;
    }

    let baseQuery = `
    select SQL_CALC_FOUND_ROWS lf.UUID as Id, f.Name as FeedName, lf.DateOfFeed, e.Name as EnclosureName, lf.TotalFeedQty, lf.TotalCost from livestockfeed lf
    left join feed f on f.Id = lf.FeedId
    left join enclosure e on e.Id = lf.EnclosureId
    ${filterQuery} ${searchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
    
    SELECT FOUND_ROWS() as Total;

    select distinct DATE_FORMAT(DateOfFeed, '%b-%Y') as MonthOfFeed, DATE_FORMAT(DateOfFeed, '%b-%Y') as MonthOfFeed1 from livestockfeed where IsDeleted = 0 Order by DateOfFeed desc;`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
            total: resultData[1][0].Total,
            month: resultData[2]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}


module.exports = {
    createLivestockFeed: createLivestockFeed,
    bulkCreateLivestockFeedDetail: bulkCreateLivestockFeedDetail,
    getLivestockFeedDataSet: getDataSet
}