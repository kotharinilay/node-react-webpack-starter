'use strict';

/***********************************
 * Chemical Product
 * *********************************/

import Promise from 'bluebird';
import {
    createChemicalProduct, getChemicalProductDataSet,
    getChemicalProductById, updateChemicalProduct, getChemicalProductSearch
} from '../../repository/chemicalproduct';
import { getChemicalProductESIAll, createChemicalProductESI, removeChemicalProductESI } from '../../repository/chemicalproductesi';
import {
    getChemicalProductStockAll, createChemicalProductStock,
    removeChemicalProductStock, updateChemicalProductStock, getChemicalProductStockSearch
} from '../../repository/chemicalproductstock';
import { getChemicalProductWHPAll, createChemicalProductWHP, removeChemicalProductWHP } from '../../repository/chemicalproductwhp';
import { createAuditLog, updateAuditLog, bulkCreateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp) => {
    if (!chemicalproduct.chemicalproductName) {
        return getResponse(400, 'VALIDATION.1083');
    }
    else if (!chemicalproduct.chemicalproductCode) {
        return getResponse(400, 'VALIDATION.1084');
    }
    else if (!chemicalproduct.species.length > 0) {
        return getResponse(400, 'VALIDATION.1085');
    }
    else if (chemicalproduct.chemicalproductName.length > 50) {
        return getResponse(400, 'VALIDATION.1086');
    }
    else if (chemicalproduct.chemicalproductCode.length > 20) {
        return getResponse(400, 'VALIDATION.1087');
    }

    if (chemicalproductesi.length > 0) {
        chemicalproductesi.map((esiObj) => {
            if (!esiObj.countryId) {
                return getResponse(400, 'VALIDATION.1088');
            }
            else if (!esiObj.speciesId) {
                return getResponse(400, 'VALIDATION.1085');
            }
            else if (!esiObj.numberOfDays) {
                return getResponse(400, 'VALIDATION.1089');
            }
        });
    }

    if (chemicalproductwhp.length > 0) {
        chemicalproductwhp.map((whpObj) => {
            if (!whpObj.activityId) {
                return getResponse(400, 'VALIDATION.1090');
            }
            else if (!whpObj.speciesId) {
                return getResponse(400, 'VALIDATION.1085');
            }
            else if (!whpObj.numberOfDays) {
                return getResponse(400, 'VALIDATION.1089');
            }
        });
    }

    if (chemicalproductstock.length > 0) {
        chemicalproductstock.map((stockObj) => {
            if (!stockObj.isDeleted) {
                if (!stockObj.stockonhand) {
                    return getResponse(400, 'VALIDATION.1091');
                }
                else if (!stockObj.uomId) {
                    return getResponse(400, 'VALIDATION.1092');
                }
                else if (!stockObj.batchnumber) {
                    return getResponse(400, 'VALIDATION.1093');
                }
                else if (stockObj.batchnumber.length > 20) {
                    return getResponse(400, 'VALIDATION.1094');
                }
            }
        });
    }
    return null;
}

// create new chemical product
let create = (chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp, contactId) => {
    let response = serverValidations(chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp);
    if (response != null)
        return response;

    let chemicalProductId = newUUID();
    let auditId = newUUID();

    let auditObj = [];
    auditObj.push({
        Id: uuidToBuffer(auditId),
        UUID: auditId,
        CreatedBy: uuidToBuffer(contactId),
        CreatedStamp: new Date(),
        CreatedFromSource: 'web'
    });
    let chemicalProductESIObj = [];
    let chemicalProductWHPObj = [];
    let chemicalProductStockObj = [];

    let chemicalProductObj = {
        Id: uuidToBuffer(chemicalProductId),
        UUID: chemicalProductId,
        AuditLogId: uuidToBuffer(auditId),
        Code: chemicalproduct.chemicalproductCode,
        Name: chemicalproduct.chemicalproductName,
        DisposalNotes: chemicalproduct.disposalNotes,
        ProductCategoryId: uuidToBuffer(chemicalproduct.chemicalcategory),
        Species: models.Sequelize.fn('COLUMN_CREATE', ["Species", chemicalproduct.species]),
        IsConfiguredByAdmin: chemicalproduct.configuredByAdmin,
    }

    if (chemicalproductesi.length > 0) {
        chemicalproductesi.map((esiObj) => {
            chemicalProductESIObj.push({
                Id: uuidToBuffer(esiObj.Id),
                ChemicalProductId: chemicalProductObj.Id,
                UUID: esiObj.Id,
                CountryId: uuidToBuffer(esiObj.countryId),
                SpeciesId: uuidToBuffer(esiObj.speciesId),
                NumberOfDays: esiObj.numberOfDays
            });
        });
    }
    if (chemicalproductwhp.length > 0) {
        chemicalproductwhp.map((whpObj) => {
            chemicalProductWHPObj.push({
                Id: uuidToBuffer(whpObj.Id),
                UUID: whpObj.Id,
                ChemicalProductId: chemicalProductObj.Id,
                ActivityId: uuidToBuffer(whpObj.activityId),
                SpeciesId: uuidToBuffer(whpObj.speciesId),
                NumberOfDays: whpObj.numberOfDays
            });
        });
    }
    if (chemicalproductstock.length > 0) {
        chemicalproductstock.map((stockObj) => {
            let stockAuditId = newUUID();
            chemicalProductStockObj.push({
                Id: uuidToBuffer(stockObj.Id),
                UUID: stockObj.Id,
                ChemicalProductId: chemicalProductObj.Id,
                BatchNumber: stockObj.batchnumber,
                StockOnHand: stockObj.stockonhand,
                StockDate: stockObj.stockDate,
                Cost: stockObj.cost,
                UoMId: uuidToBuffer(stockObj.uomId),
                Supplier: stockObj.supplier,
                DateOfManufacturing: stockObj.manufactureDate,
                ExpiryDate: stockObj.usebyDate,
                StoragePIC: stockObj.pictext,
                AuditLogId: uuidToBuffer(stockAuditId),
            });
            auditObj.push({
                Id: uuidToBuffer(stockAuditId),
                UUID: stockAuditId,
                CreatedBy: uuidToBuffer(contactId),
                CreatedStamp: new Date(),
                CreatedFromSource: 'web'
            });
        });
    }
    return models.sequelize.transaction(function (t) {
        return bulkCreateAuditLog(auditObj, t).then(function () {
            return createChemicalProduct(chemicalProductObj, t)
        }).then(function () {
            return createChemicalProductESI(chemicalProductESIObj, t)
        }).then(function () {
            return createChemicalProductWHP(chemicalProductWHPObj, t)
        }).then(function () {
            return createChemicalProductStock(chemicalProductStockObj, t)
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// update existing chemical product
let update = (chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp, contactId) => {
    let response = serverValidations(chemicalproduct, chemicalproductstock, chemicalproductesi, chemicalproductwhp);
    if (response != null)
        return response;

    let chemicalProductId = newUUID();
    let auditId = newUUID();
    let newAuditObj = [];
    let updateAuditObjs = [];
    let updateAuditConditions = [];
    let updateStockObjs = [];
    let updateStockConditions = [];
    let chemicalProductESIObj = [];
    let chemicalProductWHPObj = [];
    let chemicalProductStockObj = [];

    updateAuditObjs.push({
        ModifiedBy: uuidToBuffer(contactId),
        ModifiedStamp: new Date(),
        ModifiedFromSource: 'web'
    });

    updateAuditConditions.push({
        Id: new Buffer(chemicalproduct.auditId.data)
    });

    let chemicalProductObj = {
        Code: chemicalproduct.chemicalproductCode,
        Name: chemicalproduct.chemicalproductName,
        DisposalNotes: chemicalproduct.disposalNotes,
        ProductCategoryId: uuidToBuffer(chemicalproduct.chemicalcategory),
        Species: chemicalproduct.species.length > 0 ? JSON.stringify(chemicalproduct.species) : null
    }
    let chemicalProductCondition = {
        UUID: chemicalproduct.chemicalproductId
    }
    let deleteCondition = {
        ChemicalProductId: uuidToBuffer(chemicalproduct.chemicalproductId)
    }

    if (chemicalproductesi.length > 0) {
        chemicalproductesi.map((esiObj) => {
            chemicalProductESIObj.push({
                Id: uuidToBuffer(esiObj.Id),
                ChemicalProductId: uuidToBuffer(chemicalproduct.chemicalproductId),
                UUID: esiObj.Id,
                CountryId: uuidToBuffer(esiObj.countryId),
                SpeciesId: uuidToBuffer(esiObj.speciesId),
                NumberOfDays: esiObj.numberOfDays
            });
        });
    }
    if (chemicalproductwhp.length > 0) {
        chemicalproductwhp.map((whpObj) => {
            chemicalProductWHPObj.push({
                Id: uuidToBuffer(whpObj.Id),
                UUID: whpObj.Id,
                ChemicalProductId: uuidToBuffer(chemicalproduct.chemicalproductId),
                ActivityId: uuidToBuffer(whpObj.activityId),
                SpeciesId: uuidToBuffer(whpObj.speciesId),
                NumberOfDays: whpObj.numberOfDays
            });
        });
    }
    if (chemicalproductstock.length > 0) {
        chemicalproductstock.map((stockObj) => {
            if (stockObj.auditId) {
                if (stockObj.isDeleted) {
                    updateStockObjs.push({
                        IsDeleted: 1
                    });
                    updateAuditObjs.push({
                        DeletedBy: uuidToBuffer(contactId),
                        DeletedStamp: new Date(),
                        DeletedFromSource: 'web'
                    });
                }
                else {
                    updateStockObjs.push({
                        BatchNumber: stockObj.batchnumber,
                        StockOnHand: stockObj.stockonhand,
                        StockDate: stockObj.stockDate,
                        Cost: stockObj.cost,
                        UoMId: uuidToBuffer(stockObj.uomId),
                        Supplier: stockObj.supplier,
                        DateOfManufacturing: stockObj.manufactureDate,
                        ExpiryDate: stockObj.usebyDate,
                        StoragePIC: stockObj.pictext
                    });
                    updateAuditObjs.push({
                        ModifiedBy: uuidToBuffer(contactId),
                        ModifiedStamp: new Date(),
                        ModifiedFromSource: 'web'
                    });
                }
                updateStockConditions.push({
                    UUID: stockObj.Id
                });
                updateAuditConditions.push({
                    Id: new Buffer(stockObj.auditId.data)
                });
            }
            else {
                let stockAuditId = newUUID();
                chemicalProductStockObj.push({
                    Id: uuidToBuffer(stockObj.Id),
                    UUID: stockObj.Id,
                    ChemicalProductId: uuidToBuffer(chemicalproduct.chemicalproductId),
                    BatchNumber: stockObj.batchnumber,
                    StockOnHand: stockObj.stockonhand,
                    StockDate: stockObj.stockDate,
                    Cost: stockObj.cost,
                    UoMId: uuidToBuffer(stockObj.uomId),
                    Supplier: stockObj.supplier,
                    DateOfManufacturing: stockObj.manufactureDate,
                    ExpiryDate: stockObj.usebyDate,
                    StoragePIC: stockObj.pictext,
                    AuditLogId: uuidToBuffer(stockAuditId),
                });
                newAuditObj.push({
                    Id: uuidToBuffer(stockAuditId),
                    UUID: stockAuditId,
                    CreatedBy: uuidToBuffer(contactId),
                    CreatedStamp: new Date(),
                    CreatedFromSource: 'web'
                });
            }
        });
    }

    return models.sequelize.transaction(function (t) {
        return removeChemicalProductESI(deleteCondition, t).then(function () {
            return removeChemicalProductWHP(deleteCondition, t);
        }).then(function () {
            return updateChemicalProduct(chemicalProductObj, chemicalProductCondition, t);
        }).then(function () {
            return createChemicalProductESI(chemicalProductESIObj, t);
        }).then(function () {
            return createChemicalProductWHP(chemicalProductWHPObj, t)
        }).then(function () {
            return bulkCreateAuditLog(newAuditObj, t);
        }).then(function () {
            return createChemicalProductStock(chemicalProductStockObj, t)
        }).then(function () {
            let updateAuditArr = [];
            for (var i = 0; i < updateAuditObjs.length; i++) {
                updateAuditArr.push(updateAuditLog(updateAuditObjs[i], updateAuditConditions[i], t));
            }
            return Promise.all(updateAuditArr);
        }).then(function () {
            let updateStockArr = [];
            for (var j = 0; j < updateStockObjs.length; j++) {
                updateStockArr.push(updateChemicalProductStock(updateStockObjs[j], updateStockConditions[j], t));
            }
            return Promise.all(updateStockArr);
        })
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected chemical categories
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let chemicalProductObj = {
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

    return models.sequelize.transaction(function (t) {
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updateChemicalProduct(chemicalProductObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch chemical product by Id
let getDetail = (uuid, language) => {
    return getChemicalProductById(uuid, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// fetch data with server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText = null) => {
    return getChemicalProductDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// search chemical product for autocomplete binding
let getChemicalProductListSearch = (searchText, topPIC, speciesId) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getChemicalProductSearch(searchText, CompanyId, RegionId, BusinessId, PropertyId, speciesId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

// search chemical product stock for batch number autocomplete binding
let getChemicalProductStockListSearch = (searchText, chemicalProductId, speciesId) => {
    return getChemicalProductStockSearch(searchText, chemicalProductId, speciesId).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

module.exports = {
    getChemicalProductDataSet: Promise.method(getDataSet),
    getChemicalProductDetail: Promise.method(getDetail),
    createChemicalProduct: Promise.method(create),
    updateChemicalProduct: Promise.method(update),
    deleteChemicalProduct: Promise.method(remove),
    getChemicalProductListSearch: Promise.method(getChemicalProductListSearch),
    getChemicalProductStockListSearch: Promise.method(getChemicalProductStockListSearch)
}