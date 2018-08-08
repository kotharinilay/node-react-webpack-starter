'use strict';

/***********************************
 * feed/feed composition/feed stock api comes here
 * *********************************/

import {
    createFeedStockComp, updateFeedStockComp, deleteFeedStockComp, getFeedStockComp, getFeedDataSet,
    getFeedCompDataSet, checkFeedName, getRecordFeedDataSet, getRecordFeedData, createRecordFeed
} from '../../business/private/feed';

export default function (router) {

    // create or update feed details
    router.post('/feedstockcomp/save', function (req, res, next) {
        let { feed, feedComposition, feedStock, updateStockDB, updateFeedCompDB } = req.body;
        if (!feed.FeedId) {
            return createFeedStockComp(feed, feedComposition, feedStock, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateFeedStockComp(feed, feedComposition, feedStock, updateStockDB, updateFeedCompDB, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // get feed/feed composition/feed stock details by Id
    router.get('/feedstockcomp/detail', function (req, res, next) {
        return getFeedStockComp(req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve feed data with server side paging/filtering/sorting
    router.get('/feed/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText = null } = JSON.parse(req.query.params);
        return getFeedDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve feed composition data with server side paging/filtering/sorting
    router.get('/feedcomposition/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj } = JSON.parse(req.query.params);
        return getFeedCompDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // delete selected feed/feedcomposition/feedstock
    router.post('/feedstockcomp/delete', function (req, res, next) {
        let { feedIds, auditLogIds } = req.body;
        return deleteFeedStockComp(feedIds, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // check feed name duplication
    router.get('/feed/checkduplication', function (req, res, next) {
        let { name, feedId = null } = req.query;
        return checkFeedName(name, feedId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });


    // retrieve record feed data with server side paging/filtering/sorting
    router.get('/recordfeed/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder,searchText, filterObj = null } = JSON.parse(req.query.params);
        return getRecordFeedDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj,searchText).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // save 
    router.get('/recordfeed/getdata', function (req, res, next) {
        let { language } = req.authInfo;
        let topPIC = JSON.parse(req.query.topPIC);
        return getRecordFeedData(topPIC, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // create or update record feed details
    router.post('/recordfeed/save', function (req, res, next) {
        let { contactId } = req.authInfo;
        return createRecordFeed(req.body.recordFeedObj, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}
