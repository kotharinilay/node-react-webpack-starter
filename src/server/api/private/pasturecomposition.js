'use strict';

/**************************************
 * APIs for pasture composition page
 ************************************/

import { getPastureCompositionDataSet } from '../../business/private/pasturecomposition';

export default function (router) {

    // retreive pasture composition data with server side paging/filtering/sortin
    router.get('/pasturecomposition/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        return getPastureCompositionDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function(err){
            next(err);
        });
    });

}