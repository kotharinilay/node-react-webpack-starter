'use strict';

/***********************************
 * Logic related to pasture composition
 * *********************************/

import Promise from 'bluebird';
import { getPastureCompositionDataSet } from '../../repository/pasturecomposition';
import { HttpStatus, getResponse } from '../../lib/index';

// fetch all pasture composition for selected property with server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj = null) => {
    return getPastureCompositionDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    });
}

module.exports = {
    getPastureCompositionDataSet: Promise.method(getDataSet)
}