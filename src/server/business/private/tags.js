'use strict';

/***********************************
 * Tags related logic
 * *********************************/

import Promise from 'bluebird';
import { getTagDataSet, getTagByEID, getTagStatus } from '../../repository/tag';
import { getResponse, HttpStatus } from '../../lib/index';
import { formatDateTime } from '../../../shared/format/date';
import { isEmpty as _isEmpty, isUndefined as _isUndefined } from 'lodash';

// get species by server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText, language) => {
    let propertyId = null, issueFromDate = null, issueToDate = null, searchValue = null;
    if (filterObj) {
        searchValue = filterObj.searchValue;
        propertyId = filterObj.propertyId;
        issueFromDate = _isUndefined(filterObj.issueFromDate) ? null : filterObj.issueFromDate;
        issueToDate = _isUndefined(filterObj.issueToDate) ? null : filterObj.issueToDate;

        if (!_isEmpty(issueFromDate) && !_isEmpty(issueToDate)) {
            issueFromDate = formatDateTime(issueFromDate).YYYYMMDDFormat;
            issueToDate = formatDateTime(issueToDate).YYYYMMDDFormat;
        }
        else if (!_isEmpty(issueFromDate)) {
            issueFromDate = formatDateTime(issueFromDate).YYYYMMDDFormat;
        }
        else if (!_isEmpty(issueToDate)) {
            issueToDate = formatDateTime(issueToDate).YYYYMMDDFormat;
        }
    }
    return getTagDataSet(pageSize, skipRec, sortOrder, sortColumn, propertyId, issueFromDate, issueToDate, searchValue, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getByEID = (idetifier, eid) => {
    return getTagByEID(idetifier, eid).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getTagStatusData = (language) => {
    return getTagStatus(language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    getTagDataSet: Promise.method(getDataSet),
    getTagByEID: Promise.method(getByEID),
    getTagStatusMaster: Promise.method(getTagStatusData)
};