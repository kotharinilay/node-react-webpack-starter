'use strict';

/*************************************
 * database interaction methods related to 
 * 'Enclosure' table
 * *************************************/

import models from '../schema';
import { dataSetResponse } from '../lib/index';

// create multiple enclosure record to DB
let bulkCreate = (obj, trans = null) => {
    return models.enclosure.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update enclosure record to DB
let update = (obj, condition, trans = null) => {
    return models.enclosure.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all enclosure record for grid based on PropertyId
let getDataSetByPropertyId = (pageSize, skipRec, sortOrder, sortColumn, searchText, propertyId, language) => {
    sortColumn = sortColumn || 'CreatedStamp';

    let filterQuery = "";
    if (propertyId)
        filterQuery += "and p.UUID = \\'" + propertyId + "\\' ";

    filterQuery += "order by " + sortColumn + " " + sortOrder + " Limit " + skipRec + "," + pageSize;
    let query = "CALL sp_enclosure('" + language + "','" + filterQuery + "');";
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return dataSetResponse(result);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get enclosures by property id
let getByPropertyId = (propertyId, language) => {
    let filterQuery = "and p.UUID = \\'" + propertyId + "\\' ";
    let query = "CALL sp_enclosure('" + language + "','" + filterQuery + "');";
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return dataSetResponse(result);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get enclosures by filter and supply attributes
let getAll = (attr, condition) => {
    return models.enclosure.findAll({
        where: condition,
        raw: true,
        attributes: attr,
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getEnclosureDataSet: getDataSetByPropertyId,
    getEnclosureByPropertyId: getByPropertyId,
    getAll: getAll,
    bulkCreateEnclosure: bulkCreate,
    updateEnclosure: update
}