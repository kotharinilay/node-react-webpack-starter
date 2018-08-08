'use strict';

/*************************************
 * database interaction methods related to 
 * 'chemicalproduct' table
 * *************************************/

import models from '../schema';
import Promise from 'bluebird';
import sequelize from 'sequelize';

// create chemical product record to DB
let create = (obj, trans = null) => {
    return models.chemicalproduct.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText) => {

    if (sortColumn == null || sortColumn == undefined) {
        sortColumn = 'CreatedStamp';
    }

    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (Name LIKE '${searchText}' OR Code LIKE '${searchText}' OR
                             DisposalNotes LIKE '${searchText}' )`;
    }

    let baseQuery =
        `SELECT cp.UUID AS Id, cp.Name, cp.Code, cp.DisposalNotes, SUM(cps.StockOnHand) AS StockOnHand,
        cp.AuditLogId, a.CreatedStamp
        FROM chemicalproduct cp
        LEFT JOIN auditlog a ON cp.AuditLogId = a.Id
        LEFT JOIN chemicalproductstock cps ON cp.Id = cps.ChemicalProductId
        WHERE cp.IsDeleted = 0 ${searchQuery}  GROUP BY cp.Id
        ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
                SELECT COUNT(1) as Total FROM chemicalproduct WHERE IsDeleted = 0;`;
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

// get chemical product record by Id
let getById = (uuid, language) => {
    let baseQuery = `
    SELECT UUID AS Id, Species, Code, Name, IsActive, DisposalNotes, AuditLogId,
    ProductCategoryId
    FROM chemicalproduct
    WHERE UUID = '${uuid}';

    SELECT cpe.UUID AS Id, CountryId, SpeciesId, NumberOfDays, 
    sd.SpeciesName as 'SpeciesName',
    cd.CountryName as 'CountryName'
    FROM chemicalproductesi cpe
    LEFT JOIN chemicalproduct cp ON cp.Id = cpe.ChemicalProductId
    LEFT JOIN species s ON s.Id = cpe.SpeciesId
    LEFT JOIN speciesdata sd ON sd.SpeciesId = s.Id AND sd.Language='${language}'     
    LEFT JOIN country c ON c.Id = cpe.CountryId 
    LEFT JOIN countrydata cd ON cd.CountryId = c.Id AND sd.Language='${language}' 
    WHERE cp.UUID = '${uuid}';

    SELECT cpw.UUID AS Id, ActivityId, SpeciesId, NumberOfDays, cpa.ActivityName, 
    sd.SpeciesName as 'SpeciesName'
    FROM chemicalproductwhp cpw
    LEFT JOIN chemicalproduct cp ON cp.Id = cpw.ChemicalProductId
    LEFT JOIN chemicalproductactivity cpa ON cpa.Id = cpw.ActivityId
	LEFT JOIN species s ON s.Id = cpw.SpeciesId
    LEFT JOIN speciesdata sd ON sd.SpeciesId = s.Id AND sd.Language='${language}'     
    WHERE cp.UUID = '${uuid}';

    SELECT cps.UUID AS Id, BatchNumber, StockOnHand, StockDate, Cost, cps.UoMId, Supplier, DateOfManufacturing, ExpiryDate,
    StoragePIC, StorageAddress, StorageSuburbId, cps.AuditLogId, p.UUID AS PropertyId,
    ud.UoMName AS 'UomName'
    FROM chemicalproductstock cps
    LEFT JOIN chemicalproduct cp ON cp.Id = cps.ChemicalProductId
    LEFT JOIN property p ON p.PIC=cps.StoragePIC
    LEFT JOIN uom u ON u.Id=cps.UoMId
    LEFT JOIN uomdata ud ON ud.UoMId = u.Id AND ud.Language='${language}'
    WHERE cps.IsDeleted = 0 AND cp.UUID = '${uuid}';
    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
        }
        return resultData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update chemical product record to DB
let update = (obj, condition, trans = null) => {
    return models.chemicalproduct.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all chemical product for dropdown binding
let getBySearch = (searchText, companyId, regionId, businessId, propertyId, speciesId) => {
    companyId = companyId ? `'${companyId}'` : null;
    regionId = regionId ? `'${regionId}'` : null;
    businessId = businessId ? `'${businessId}'` : null;
    propertyId = propertyId ? `'${propertyId}'` : null;
    speciesId = speciesId ? `'${speciesId}'` : null;

    let query = `CALL sp_chemicalproduct_ddl(${propertyId},${companyId},${regionId},${businessId},${speciesId},'${searchText}');`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getChemicalProductDataSet: getDataSet,
    getChemicalProductById: getById,
    createChemicalProduct: create,
    updateChemicalProduct: update,
    getChemicalProductSearch: getBySearch
}