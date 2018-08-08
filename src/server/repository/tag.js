'use strict';

/*************************************
 * database interaction methods related to 
 * 'tag' and 'tagstatus' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';
import { isEmpty as _isEmpty, forEach as _forEach } from 'lodash';

// get all tag status
let getTagStatus = (language) => {
    return models.view_tagstatus.findAll({
        raw: true,
        where: { Language: language },
        attributes: ['Id', 'StatusName', 'SystemCode']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all tag colour
let getTagColour = () => {
    return models.tagcolour.findAll({
        raw: true,
        attributes: ['Id', 'Colour', 'Year']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getByEID = (idetifier, eid) => {
    let condition = {};
    condition[idetifier] = eid;
    return models.tag.findAll({
        raw: true,
        where: condition,
        attributes: ['Id', 'EID', 'NLISID', 'AuditLogId', 'SpeciesId', 'CurrentStatusId']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, propertyId, issueFromDate, issueToDate, searchValue, topSearchText,language) => {

    if (!_isEmpty(sortColumn)) {
        sortColumn = 'EID';
    }

    let searchQuery = '', operator=' AND ';    
    if (!_isEmpty(searchValue)) {
        searchValue = '%' + searchValue.toLowerCase() + '%';
        searchQuery = ` AND (LOWER(EID) LIKE '${searchValue}' OR LOWER(NLISID) LIKE '${searchValue}' OR
                             LOWER(VisualTag) LIKE '${searchValue}' OR LOWER(TagStatus) LIKE '${searchValue}' OR LOWER(Species) LIKE '${searchValue}')`;
        operator = ' OR ';
    }

    if (!_isEmpty(issueFromDate) && !_isEmpty(issueToDate)) {
        searchQuery += ` AND IssueDate >= CAST('${issueFromDate}' as DATE) AND IssueDate <= CAST('${issueToDate}' as DATE)`;
        operator = ' OR ';
    }
    else if (!_isEmpty(issueFromDate)) {
        searchQuery += ` AND IssueDate >= CAST('${issueFromDate}' as DATE) `;
        operator = ' OR ';
    }
    else if (!_isEmpty(issueToDate)) {
        searchQuery += ` AND IssueDate <= CAST('${issueToDate}' as DATE)`;
        operator = ' OR ';
    }

    let topSearchQuery = '';
    if(topSearchText){
        topSearchQuery =  operator +` (LOWER(EID) LIKE '${topSearchText}' OR LOWER(NLISID) LIKE '${topSearchText}' OR
                             LOWER(VisualTag) LIKE '${topSearchText}' OR LOWER(TagStatus) LIKE '${topSearchText}' OR LOWER(Species) LIKE '${topSearchText}')`;                            
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS * FROM view_tags WHERE OriginPropertyId=fn_UuidToBin('${propertyId}') AND TagStatusLanguage='${language}' AND SpeciesLanguage='${language}' ${searchQuery} ${topSearchQuery} ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
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

// update tag(s) record to DB
let update = (obj, condition, trans = null) => {
    return models.tag.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple tag history record to DB
let bulkCreateHistory = (obj, trans = null) => {
    return models.taghistory.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple tag record to DB
let bulkCreate = (obj, trans = null) => {
    return models.tag.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getByCondition = (condition) => {
    return models.tag.findAll({
        raw: true,
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getTagStatus: getTagStatus,
    getTagByEID: getByEID,
    getTagColour: getTagColour,
    getTagDataSet: getDataSet,
    updateTag: update,
    bulkCreateTagHistory: bulkCreateHistory,
    bulkCreateTag: bulkCreate,
    getTagByCondition: getByCondition
}