'use strict';

/*************************************
 * database interaction methods related to 
 * 'treatmentsession' table
 * *************************************/

import models from '../schema';
import { getCommaSeparatedIds } from '../lib/index';

// create treatmentsession record to DB
let createSession = (obj, trans = null) => {
    return models.treatmentsession.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// bluk create treatmentsessionproduct record to DB
let bulkCreate = (obj, trans = null) => {
    return models.treatmentsessionproduct.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update treatmentsessionproduct record to DB
let update = (obj, condition, trans = null) => {
    return models.treatmentsessionproduct.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update treatmentsession record to DB
let updateSession = (obj, condition, trans = null) => {
    return models.treatmentsession.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all species record for grid
let getDataSet = (pageSize, skipRec, sortAsc, sortColumn, filterObj) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'SessionName';
    }

    let searchQuery = '';
    if (filterObj.companyId) {
        searchQuery = ` and ts.CompanyId = fn_UuidToBin('${filterObj.companyId}')`
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS
        Id, AuditLogId, 
        IF(GROUP_CONCAT(NULLIF(TreatName, '')) IS NULL, NULL, CONCAT(count(TreatName), ' Treats (', GROUP_CONCAT(NULLIF(TreatName, '') SEPARATOR ', '), ')')) as Treats,
        IF(GROUP_CONCAT(NULLIF(Name, '')) IS NULL, NULL, CONCAT(count(Name), ' Chemicals (', GROUP_CONCAT(NULLIF(Name, '') SEPARATOR ', '), ')')) as Chemicals,
        SessionName, Disease, LastUsedOn from
        (select distinct tsp.TreatName, cp.Name, ts.UUID as Id, ts.AuditLogId, ts.SessionName, ts.Disease, ts.LastUsedOn
        from treatmentsession ts
        left join treatmentsessionproduct tsp on tsp.TreatmentSessionId = ts.Id 
        left join chemicalproductstock cps on cps.Id = tsp.ChemicalProductStockId
        left join chemicalproduct cp on cp.Id = cps.ChemicalProductId
        where ts.IsDeleted = 0 and tsp.IsDeleted = 0 ${searchQuery}) as tbl
        GROUP BY SessionName
        ORDER BY ${sortColumn} ${sortAsc} LIMIT ${skipRec},${pageSize};
        
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

let getProductsByIds = (ids) => {
    let uuids = getCommaSeparatedIds(ids);
    let baseQuery = `
        select tsp.UUID as Id, tsp.IsDeleted, tsp.TreatName, tsp.IsVaccineChemical, tsp.Dosage, tsp.DosageUoMId,
        cps.UUID as ChemicalProductStockId, cps.Cost as StockCost, cps.StockOnHand, cps.UoMId as StockUoMId,
        cps.BatchNumber,
        cp.UUID as ChemicalProductId, cp.Name as ChemicalProduct,
        esi.NumberOfDays as ESI, whp.NumberOfDays as WHP,
        ts.UUID as SessionId, ts.SessionName, ts.AuditLogId as SessionAuditLogId
        from treatmentsessionproduct tsp
        left join chemicalproductstock cps on tsp.ChemicalProductStockId = cps.Id
        left join chemicalproduct cp on cp.Id = cps.ChemicalProductId
        left join chemicalproductesi esi on esi.ChemicalProductId = cps.ChemicalProductId
        left join chemicalproductwhp whp on whp.ChemicalProductId = cps.ChemicalProductId
        left join treatmentsession ts on ts.Id = tsp.TreatmentSessionId
        where tsp.IsDeleted = 0 and ts.UUID in (${uuids});`

    return models.sequelize.query(baseQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return JSON.parse(JSON.stringify(result));
    }).catch(function (err) {
        throw new Error(err);
    });
}


module.exports = {
    createTreatmentSession: createSession,
    bulkCreateTreatmentSessionProduct: bulkCreate,
    updateTreatmentSessionProduct: update,
    updateTreatmentSession: updateSession,
    getSessionDataSet: getDataSet,
    getTreatmentSessionProductsByIds: getProductsByIds
}