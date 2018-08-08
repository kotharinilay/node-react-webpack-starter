'use strict';

/***********************************
 * feed/feed composition/feed stock logics
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';
import { map as _map, sum as _sum, max as _max } from 'lodash';

import { getLivestockByCondition, getLatestLivestockPropertyHistory, bulkCreateLivestockEvent, updateLivestockPropertyHistory } from '../../repository/livestock';
import { createLivestockFeed, bulkCreateLivestockFeedDetail, getLivestockFeedDataSet } from '../../repository/livestockfeed';
import { getEnclosureByPropertyId } from '../../repository/enclosure';
import {
    createFeed, updateFeed, getFeedDataSet, getFeedStockCompById, checkFeedName, getFeedByCondition
} from '../../repository/feed';
import { bulkCreateFeedComposition, removeFeedComposition, getFeedCompDataSet } from '../../repository/feedcomposition';
import { createFeedStock, updateFeedStock, getFeedStockByFeedId } from '../../repository/feedstock';
import { bulkCreateAuditLog, updateAuditLog } from '../../repository/auditlog';
import { createAudit, updateAudit } from '../../business/private/common';
import { LivestockFeedDetailMapper } from '../../schema/mapper';
import { newUUID, uuidToBuffer, bufferToUUID } from '../../../shared/uuid';
import { digitDecimal } from '../../../shared/format/number';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';

// perform server validations
let serverValidations = (feedName, feedCompanyId) => {
    if (!feedName) {
        return getResponse(400, 'VALIDATION.1079');
    }
    else if (!feedCompanyId) {
        return getResponse(400, 'VALIDATION.1080');
    }
    else if (feedName.length > 50) {
        return getResponse(400, 'VALIDATION.1082');
    }
    return null;
}

// perform server validations for record feed
let serverValidationsRecordFeed = (recordFeedObj) => {
    let { feed, dateoffeed, enclosure, quantity, cost } = recordFeedObj;
    if (!feed) {
        return getResponse(400, 'VALIDATION.1134');
    }
    else if (!dateoffeed) {
        return getResponse(400, 'VALIDATION.1135');
    }
    else if (!enclosure) {
        return getResponse(400, 'VALIDATION.1136');
    }
    else if (quantity > 10) {
        return getResponse(400, 'VALIDATION.1137');
    }
    else if (cost <= 0) {
        return getResponse(400, 'VALIDATION.1138');
    }
    return null;
}

// create a new records of feed/feedcomposition/feedStock
let create = (feed, feedComposition, feedStock, contactId) => {
    let response = serverValidations(feed.Name, feed.CompanyId);
    if (response != null)
        return response;

    let auditArr = [];
    let feedId = newUUID();
    let auditId = newUUID();

    let auditObj = {
        Id: uuidToBuffer(auditId),
        UUID: auditId,
        CreatedBy: uuidToBuffer(contactId),
        CreatedStamp: new Date(),
        CreatedFromSource: 'web'
    }
    let feedObj = {
        Id: uuidToBuffer(feedId),
        UUID: feedId,
        AuditLogId: uuidToBuffer(auditId),
        Name: feed.Name,
        CompanyId: uuidToBuffer(feed.CompanyId),
        PropertyId: feed.PropertyId ? uuidToBuffer(feed.PropertyId) : null
    }

    auditArr.push(auditObj);

    _map(feedComposition, f => {
        f.UUID = f.Id;
        f.Id = uuidToBuffer(f.Id);
        f.FeedId = feedObj.Id;
    });

    _map(feedStock, f => {
        f.UUID = f.Id;
        f.Id = uuidToBuffer(f.Id);
        f.FeedId = feedObj.Id;
        f.CompanyId = uuidToBuffer(f.CompanyId);
        f.PropertyId = f.PropertyId ? uuidToBuffer(f.PropertyId) : null;

        auditArr.push({
            Id: uuidToBuffer(f.AuditLogId),
            UUID: f.AuditLogId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date(),
            CreatedFromSource: 'web'
        });
        f.AuditLogId = uuidToBuffer(f.AuditLogId);
    });

    return models.sequelize.transaction(function (t) {
        return bulkCreateAuditLog(auditArr, t).then(function (auditRes) {
            return createFeed(feedObj, t);
        }).then(function () {
            return bulkCreateFeedComposition(feedComposition, t);
        }).then(function () {
            return createFeedStock(feedStock, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

// update records of feed/feedcomposition/feedStock
let update = (feed, feedComposition, feedStock, updateStockDB, updateFeedCompDB, contactId) => {
    let response = serverValidations(feed.Name, feed.CompanyId);
    if (response != null)
        return response;

    let auditObj = {
        ModifiedBy: uuidToBuffer(contactId),
        ModifiedStamp: new Date(),
        ModifiedFromSource: 'web'
    }

    let feedObj = {
        Name: feed.Name,
        CompanyId: uuidToBuffer(feed.CompanyId),
        PropertyId: feed.PropertyId ? uuidToBuffer(feed.PropertyId) : null
    }

    if (updateFeedCompDB) {
        _map(feedComposition, f => {
            f.UUID = f.Id;
            f.Value = f.Value.toString();
            f.Id = uuidToBuffer(f.Id);
            f.FeedId = uuidToBuffer(feed.FeedId);
        });
    }

    let createAuditStock = [];
    let createStock = [];
    let updateAuditStock = [];
    let updateAuditStockCondition = [];
    let updateStock = [];
    let updateStockCondition = [];

    if (updateStockDB) {
        feedStock.filter(f => {
            if (f.NewEntry == true) {
                delete f.NewEntry;
                delete f.Company;
                delete f.Property;
                delete f.Type;

                f.UUID = f.Id;
                f.Id = uuidToBuffer(f.Id);
                f.FeedId = uuidToBuffer(feed.FeedId);
                f.CompanyId = uuidToBuffer(f.CompanyId);
                f.PropertyId = f.PropertyId ? uuidToBuffer(f.PropertyId) : null;

                createAuditStock.push({
                    Id: uuidToBuffer(f.AuditLogId),
                    UUID: f.AuditLogId,
                    CreatedBy: uuidToBuffer(contactId),
                    CreatedStamp: new Date(),
                    CreatedFromSource: 'web'
                });
                f.AuditLogId = uuidToBuffer(f.AuditLogId);

                createStock.push(f);
            }
            else {
                updateAuditStockCondition.push({ Id: uuidToBuffer(f.AuditLogId) });
                updateStockCondition.push({ UUID: f.Id });

                if (f.IsDeleted == 1) {
                    updateAuditStock.push({
                        DeletedBy: uuidToBuffer(contactId),
                        DeletedStamp: new Date(),
                        DeletedFromSource: 'web'
                    });
                }
                else {
                    updateAuditStock.push({
                        ModifiedBy: uuidToBuffer(contactId),
                        ModifiedStamp: new Date(),
                        ModifiedFromSource: 'web'
                    });
                }

                updateStock.push({
                    StockOnHand: f.StockOnHand,
                    StockOnDate: f.StockOnDate,
                    StockCost: f.StockCost,
                    CompanyId: uuidToBuffer(f.CompanyId),
                    PropertyId: f.PropertyId ? uuidToBuffer(f.PropertyId) : null,
                    IsDeleted: f.IsDeleted
                });
            }
        });
    }

    return models.sequelize.transaction(function (t) {
        return updateAuditLog(auditObj, { Id: new Buffer(feed.AuditLogId) }, t).then(function () {
            return updateFeed(feedObj, { UUID: feed.FeedId }, t);
        }).then(function (res) {
            if (updateFeedCompDB)
                return removeFeedComposition({ FeedId: uuidToBuffer(feed.FeedId) }, t);
            else
                return true;
        }).then(function (res) {
            if (updateFeedCompDB)
                return bulkCreateFeedComposition(feedComposition, t);
            else
                return true;
        }).then(function () {
            if (updateStockDB) {
                let updateAuditArr = [];
                for (var i = 0; i < updateAuditStock.length; i++) {
                    updateAuditArr.push(updateAuditLog(updateAuditStock[i], updateAuditStockCondition[i], t));
                }
                return Promise.all(updateAuditArr);
            }
            else
                return true;
        }).then(function () {
            if (updateStockDB) {
                let updateStockArr = [];
                for (var j = 0; j < updateStock.length; j++) {
                    updateStockArr.push(updateFeedStock(updateStock[j], updateStockCondition[j], t));
                }
                return Promise.all(updateStockArr);
            }
            else
                return true;
        }).then(function () {
            return bulkCreateAuditLog(createAuditStock, t);
        }).then(function () {
            return createFeedStock(createStock, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// remove feed/feedcomposition/feedStock records
let remove = (feedIds, auditLogIds, contactId) => {
    if (feedIds.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let feedObj = {
        IsDeleted: 1
    }
    let auditObj = {
        DeletedBy: uuidToBuffer(contactId),
        DeletedStamp: new Date(),
        DeletedFromSource: 'web'
    }

    auditLogIds = auditLogIds.map(function (r) {
        return new Buffer(r);
    });

    let buffFeedIds = feedIds.map(function (r) {
        return uuidToBuffer(r);
    });

    let stockIds = [];
    return models.sequelize.transaction(function (t) {
        return getFeedStockByFeedId(buffFeedIds, t).then(function (res) {
            _map(res, s => {
                auditLogIds.push(s.AuditLogId);
                stockIds.push(s.Id);
            });
            return updateAuditLog(auditObj, { Id: auditLogIds }, t);
        }).then(function () {
            return updateFeedStock(feedObj, { Id: stockIds }, t);
        }).then(function () {
            return updateFeed(feedObj, { UUID: feedIds }, t)
        }).then(function () {
            return removeFeedComposition({ FeedId: buffFeedIds }, t);
        });

    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// fetch all feed with server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText) => {
    return getFeedDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText).then(function (response) {
        return getResponse(200, null, response);
    });
}

// fetch all feed composition with server filtering/sorting/paging
let getCompositionDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj) => {
    return getFeedCompDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj).then(function (response) {
        return getResponse(200, null, response);
    });
}

// get records of feed/feedcomposition/feedStock to edit
let getFeedStockComp = (id) => {
    if (!id) {
        return getResponse(400, resMessages.mendatory);
    }

    return getFeedStockCompById(id).then(function (response) {
        return getResponse(200, null, { data: { feed: response[0].length > 0 ? response[0][0] : null, feedComposition: response[1], feedStock: response[2] } });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// check feed name duplication
let checkDuplicateFeed = (name, feedId) => {
    if (!name)
        return getResponse(400, 'VALIDATION.1079');

    return checkFeedName(name, feedId).then(function (result) {
        return getResponse(200, null, { isDuplicateFeedName: !result });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// fetch all record feed with server filtering/sorting/paging
let getRecordFeedDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText) => {
    return getLivestockFeedDataSet(pageSize, skipRec, sortOrder, sortColumn, filterObj,searchText).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getRecordFeedData = (topPIC, language) => {
    let { CompanyId, BusinessId, PropertyId } = topPIC;
    // CompanyId = 'a20c13d0-fca6-11e6-ba2c-47975f99871e';
    let response = null;
    return getEnclosureByPropertyId(PropertyId, language).then(function (resEnclosure) {
        response = { enclosure: [] };
        if (resEnclosure.total > 0) {
            response.enclosure = _map(resEnclosure.data, function (i) {
                return { Id: i.Id, Name: i.Name, NameCode: i.NameCode };
            })
        }
        let condition = {
            IsDeleted: 0,
            $or: [
                { CompanyId: uuidToBuffer(CompanyId) },
                { CompanyId: uuidToBuffer(BusinessId) },
                { PropertyId: uuidToBuffer(PropertyId) }
            ]
        }
        return getFeedByCondition(condition, [['UUID', 'Id'], 'Name']);
    }).then(function (resFeed) {
        response.feed = resFeed;
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// create record feed
let createRecordFeed = (recordFeedObj, contactId) => {
    let response = serverValidationsRecordFeed(recordFeedObj);
    if (response != null)
        return response;

    let resLivestock = null;
    let resLivestockPropertyHistory = null;
    return getLivestockByCondition(`l.CurrentEnclosureId = fn_UuidToBin('${recordFeedObj.enclosure}')`, '', 'l.NumberOfHead, l.Id, l.UUID').then(function (res) {
        resLivestock = res;
        let livestockIds = [];
        _map(resLivestock, l => {
            livestockIds.push(`p.LivestockId = fn_UuidToBin('${bufferToUUID(l.Id)}')`);
        });
        let condition = `(${livestockIds.join(' OR ')}) and p.PropertyId = fn_UuidToBin('${recordFeedObj.propertyId}') `;
        return getLatestLivestockPropertyHistory(condition);
    }).then(function (res) {
        resLivestockPropertyHistory = res;

        let createAuditIdArr = [];
        let updateAuditIdArr = [];
        let livestockFeedDetailArr = [];
        let livestockEventArr = [];
        let livestockPropertyHistoryArr = [];

        let livestockFeedId = newUUID();
        let livestockFeedAuditId = newUUID();

        createAuditIdArr.push(livestockFeedAuditId);

        let livestockFeedObj = {
            Id: uuidToBuffer(livestockFeedId),
            UUID: livestockFeedId,
            AuditLogId: uuidToBuffer(livestockFeedAuditId),
            FeedId: uuidToBuffer(recordFeedObj.feed),
            DateOfFeed: recordFeedObj.dateoffeed,
            PropertyId: uuidToBuffer(recordFeedObj.propertyId),
            EnclosureId: uuidToBuffer(recordFeedObj.enclosure),
            TotalLivestockCount: _sum(_map(resLivestock, 'NumberOfHead')),//need to update
            TotalFeedQty: digitDecimal(recordFeedObj.quantity),
            CostPerTonne: digitDecimal(recordFeedObj.cost),
            TotalCost: digitDecimal(parseFloat(recordFeedObj.quantity) * parseFloat(recordFeedObj.cost)),
            IsContractorPerson: recordFeedObj.contractor ? 1 : 0,
            FeedByPersonId: uuidToBuffer(recordFeedObj.contact.Id),
            FeedPersonName: typeof (recordFeedObj.contact) == 'string' ? recordFeedObj.contact : (recordFeedObj.contact.Name || null)
        }

        _map(resLivestock, l => {
            let FeedQty = digitDecimal(((parseFloat(recordFeedObj.quantity) * 1000) / livestockFeedObj.TotalLivestockCount) * l.NumberOfHead); // Feed Qty in KG
            let FeedCost = digitDecimal(((parseFloat(recordFeedObj.quantity) * parseFloat(recordFeedObj.cost)) / livestockFeedObj.TotalLivestockCount) * l.NumberOfHead);
            let livestockFeedDetail = LivestockFeedDetailMapper(new Buffer(l.Id), livestockFeedObj.PropertyId, livestockFeedObj.EnclosureId,
                l.NumberOfHead, livestockFeedObj.DateOfFeed, null, contactId, livestockFeedObj.Id, FeedQty, FeedCost);
            createAuditIdArr.push(livestockFeedDetail.LivestockEvent_AuditLogId);
            livestockEventArr.push(livestockFeedDetail.LivestockEvent)
            livestockFeedDetailArr.push(livestockFeedDetail.LivestockFeedDetail);

            let obj = resLivestockPropertyHistory.find(x => bufferToUUID(x.LivestockId) == l.UUID && bufferToUUID(x.PropertyId) == recordFeedObj.propertyId);
            if (obj) {
                updateAuditIdArr.push(obj.AuditLogId);
                livestockPropertyHistoryArr.push({
                    obj: {
                        CostOfFeed: digitDecimal(parseFloat(obj.CostOfFeed) + parseFloat(FeedCost)),
                        QtyOfFeed: digitDecimal(parseFloat(obj.QtyOfFeed) + parseFloat(FeedQty))
                    },
                    condition: { UUID: obj.UUID }
                });
            }
        })

        return models.sequelize.transaction(function (t) {
            return createAudit(createAuditIdArr, contactId, t).then(function () {
                return updateAudit(updateAuditIdArr, [], contactId, t);
            }).then(function () {
                return createLivestockFeed(livestockFeedObj, t);
            }).then(function () {
                if (livestockEventArr.length > 0)
                    return bulkCreateLivestockEvent(livestockEventArr, t);
                else return true;
            }).then(function () {
                if (livestockFeedDetailArr.length > 0)
                    return bulkCreateLivestockFeedDetail(livestockFeedDetailArr, t);
                else return true;
            }).then(function () {
                if (livestockPropertyHistoryArr.length > 0) {
                    let promiseArr = [];
                    _map(livestockPropertyHistoryArr, propHistory => {
                        promiseArr.push(updateLivestockPropertyHistory(propHistory.obj, propHistory.condition, t));
                    });
                    return Promise.all(promiseArr);
                }
                else return true;
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });

    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

module.exports = {
    createFeedStockComp: Promise.method(create),
    updateFeedStockComp: Promise.method(update),
    deleteFeedStockComp: Promise.method(remove),
    getFeedDataSet: Promise.method(getDataSet),
    getFeedCompDataSet: Promise.method(getCompositionDataSet),
    getFeedStockComp: Promise.method(getFeedStockComp),
    checkFeedName: Promise.method(checkDuplicateFeed),
    getRecordFeedDataSet: Promise.method(getRecordFeedDataSet),
    getRecordFeedData: Promise.method(getRecordFeedData),
    createRecordFeed: Promise.method(createRecordFeed)
}