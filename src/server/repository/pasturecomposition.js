'use strict';

/*************************************
 * database interaction methods related to 
 * 'pasturecomposition' table
 * *************************************/

import models from '../schema';
import { dataSetResponse } from '../lib/index';
import { isUUID } from '../../shared/format/string';
import { formatDateTime } from '../../shared/format/date';

// get all pasture composition record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj) => {
    sortColumn = sortColumn || 'EventDate';
    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (en.Name LIKE '${searchText}' OR pc.Comment LIKE '${searchText}' OR
                             pc.CompositionType like '${searchText}')`;
    }
    if (filterObj && typeof filterObj == 'object') {
        for (var key in filterObj) {
            if (filterObj.hasOwnProperty(key)) {
                if (isUUID(filterObj[key].toString())) {
                    searchQuery += ` AND ${key} = fn_UuidToBin('${filterObj[key]}')`;
                }
                else {
                    if (key == 'fromDate') {
                        let date = formatDateTime(filterObj[key]).YYYYMMDDFormat;
                        searchQuery += ` AND pc.EventDate >= '${date}'`;
                    }
                    else if (key == 'toDate') {
                        let date = formatDateTime(filterObj[key]).YYYYMMDDFormat;
                        searchQuery += ` AND  pc.EventDate <= '${date}'`;
                    }

                }
            }
        }
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS 
        pc.UUID AS Id, pc.EventDate, pc.Lucerne, pc.Fescue, pc.Ryegrass,
        pc.Clover, pc.Annuals, pc.Weeds, pc.CompositionType, pc.Comment,
        en.Name AS EncluserName, a.UUID AS AuditLogId
        FROM pasturecomposition pc
        LEFT JOIN enclosure en ON en.Id = pc.EnclosureId
        LEFT JOIN auditlog a ON a.Id = pc.AuditLogId
        WHERE pc.IsDeleted = 0 
        ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT FOUND_ROWS() AS Total; `;
    return models.sequelize.query(baseQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return dataSetResponse(result);
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getPastureCompositionDataSet: getDataSet
}