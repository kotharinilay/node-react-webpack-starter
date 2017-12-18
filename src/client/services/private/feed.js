'use strict';

/*************************************
 * feed/feed composition/feed stock services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// save/update feed/feed composition/feed stock data
function saveFeedStockComp(feedObj) {
    return post('/feedstockcomp/save', feedObj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of feed/feed composition/feed stock for modify
function getFeedStockComp(id) {
    return get('/feedstockcomp/detail', { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete data of feed/feed composition/feed stock
function deleteFeedStockComp(feedIds, auditLogIds) {
    return post('/feedstockcomp/delete', { feedIds: feedIds, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Check feed name duplication
function checkDuplicateFeed(name, feedId = null) {
    return get('/feed/checkduplication', { name: name, feedId: feedId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    saveFeedStockComp: saveFeedStockComp,
    getFeedStockComp: getFeedStockComp,
    deleteFeedStockComp: deleteFeedStockComp,
    checkDuplicateFeed: checkDuplicateFeed
}