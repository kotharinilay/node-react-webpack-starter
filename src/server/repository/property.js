'use strict';

/*************************************
 * database interaction methods related to 
 * 'Property' table
 * *************************************/

import models from '../schema';
import { isEmpty } from 'lodash';
import { dataSetResponse } from '../lib/index';
import { getRoleName } from '../../shared/index';

// create property record to DB
let create = (obj, trans = null) => {
    return models.property.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update feed record to DB
let update = (obj, condition, trans = null) => {
    return models.property.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all properties record for autocomplete
function getProperties(condition, columnAttributes) {
    return models.property.findAll({
        raw: true,
        attributes: columnAttributes,
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get property details by conditions
let getByCondition = (condition, joins, columns) => {
    let baseQuery = `select ${columns} from property p ${joins} where p.IsDeleted = 0 and ${condition};`;
    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get filter data
function getFilterData(language) {
    let baseQuery = `
        SELECT Id, concat(PropertyTypeName,' (', PropertyTypeCode,')') AS 'Name' FROM view_propertytype WHERE Language = '${language}' Order by PropertyTypeName;
        SELECT Id, concat(StateName,' (', StateCode,')') AS 'Name' FROM view_state WHERE Language = '${language}' Order by StateName;
        `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            propertyType: resultData[0],
            state: resultData[1]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// get all property record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, searchText, filterObj, language, contactId, isSiteAdmin) => {
    sortColumn = sortColumn || 'CreatedStamp';

    let filterQuery = ` `;
    if (isSiteAdmin == 0)
        filterQuery = ` AND pa.ContactId = fn_UuidToBin(\\'${contactId}\\')`;
    if (!isEmpty(filterObj)) {
        filterQuery += filterObj.state ? ` AND st.UUID = \\'${filterObj.state}\\'` : '';
        filterQuery += filterObj.propertyType ? ` AND t.UUID = \\'${filterObj.propertyType}\\'` : '';
        filterQuery += filterObj.companyId ? ` AND c.UUID = \\'${filterObj.companyId}\\'` : '';
    }
    if (searchText) {
        filterQuery = ` AND (p.PIC LIKE \\'${searchText}\\' OR p.Name LIKE \\'${searchText}\\' OR s.Name LIKE \\'${searchText}\\' OR 
                        sd.StateName LIKE \\'${searchText}\\' OR concat(c1.FirstName,\\' \\',c1.LastName) LIKE \\'${searchText}\\' OR concat(c2.FirstName,\\' \\',c2.LastName) LIKE \\'${searchText}\\' OR 
                        ptd.PropertyTypeName LIKE \\'${searchText}\\' OR p.BrandText LIKE \\'${searchText}\\' OR p.EarmarkText LIKE \\'${searchText}\\')`;
    }

    filterQuery += "order by " + sortColumn + " " + sortOrder;
    if (skipRec != null && pageSize != null)
        filterQuery += " Limit " + skipRec + "," + pageSize;

    let query = "CALL sp_property('" + language + "','" + filterQuery + "');";
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return dataSetResponse(result);
    }).catch(function (err) {
        throw new Error(err);
    });
}

let findProperty = (obj) => {

    obj.propertyName = obj.propertyName == null ? null : "'" + obj.propertyName + "'";
    obj.PIC = obj.PIC == null ? null : "'" + obj.PIC + "'";
    obj.companyName = obj.companyName == null ? null : "'" + obj.companyName + "'";
    obj.businessName = obj.businessName == null ? null : "'" + obj.businessName + "'";
    obj.contactName = obj.contactName == null ? null : "'" + obj.contactName + "'";
    obj.propertyTypeId = obj.propertyTypeId == null ? null : "'" + obj.propertyTypeId + "'";
    obj.suburbId = obj.suburbId == null ? null : "'" + obj.suburbId + "'";

    let params = obj.propertyName + "," + obj.PIC + "," + obj.companyName + "," + obj.businessName + "," + obj.contactName + "," + obj.propertyTypeId + "," + obj.suburbId;
    let query = "CALL sp_findproperty(" + params + ")";

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// check given pic is duplicate
let checkDuplicatePIC = (pic, propertyId) => {
    return models.property.count({ raw: true, where: { PIC: pic, UUID: { $not: propertyId }, IsDeleted: 0 } }).then(function (result) {
        return result == 0;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get list of Manager and AsstManager
let getMngrAsstMngr = (companyId, regionId, businessId) => {

    companyId = companyId ? "'" + companyId + "'" : null;
    regionId = regionId ? "'" + regionId + "'" : null;
    businessId = businessId ? "'" + businessId + "'" : null;

    let query = 'CALL sp_contactroles(' + companyId + ', ' + regionId + ', ' + businessId + ', false);';
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result));
        let response = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });
        return getRoleName(response);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get property by id
let getById = (uuid, language) => {
    let filterQuery = ` AND p.UUID = \\'${uuid}\\'`;
    let query = "CALL sp_property('" + language + "','" + filterQuery + "');";
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return dataSetResponse(result);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// Top PIC search method
let getPropertySearch = (searchValue, contactId, companyId, isSiteAdministrator, isSuperUser) => {

    let contactSearchText = '';

    let query = ` SELECT p.Id, p.UUID as PropertyId, p.PIC, p.Name, pt.ColorCode, s.Name as SuburbName, 
    st.SystemCode as StateCode, s.PostCode,fs.FilePath as LogoUrl, fs1.FilePath as BrandingUrl,
    c.Id AS CompanyId, b.Id AS BusinessId, b.RegionId 
    FROM property p 
    LEFT JOIN propertytype pt ON pt.Id = p.PropertyTypeId
    LEFT JOIN filestorage fs ON fs.Id = p.LogoFileId
    LEFT JOIN filestorage fs1 ON fs1.Id = p.BrandFileId
    LEFT JOIN suburb s ON s.Id = p.SuburbId
    LEFT JOIN state st ON st.Id = s.StateId 
    LEFT JOIN company c ON c.Id = p.CompanyId AND c.CompanyType='C'
    LEFT JOIN company b ON b.Id = p.CompanyId AND b.CompanyType='B'`;


    if (isSiteAdministrator == false) {
        // fetch only accessible properties
        query += ` INNER JOIN propertyaccess pa ON pa.PropertyId = p.Id 
             WHERE p.CompanyId IS NOT NULL 
             AND pa.ContactId = fn_UuidToBin('${contactId}') AND (pa.IsExternal=0 OR 
             (pa.IsExternal=1 AND pa.ValidFromDate <= UTC_DATE() AND pa.ValidToDate >= UTC_DATE()))`;
    }

    if (query.includes('WHERE'))
        query += ` AND p.IsDeleted=0 `;
    else
        query += ` WHERE p.IsDeleted=0 `;

    if (searchValue != null && searchValue != undefined && searchValue.length > 0) {
        query +=
            ` AND (p.PIC LIKE '%${searchValue}%' 
              OR p.Name LIKE '%${searchValue}%' 
              OR s.Name LIKE '%${searchValue}%' 
              OR st.SystemCode LIKE '%${searchValue}%' 
              OR s.PostCode LIKE '%${searchValue}%' )`;

        contactSearchText = ` and concat(c.FirstName, ' ', c.LastName) like '%${searchValue}%'`;
    }
    query += ` ORDER BY p.PIC `; // order by property name
    query += ` LIMIT 10 `;        // fetch only top 10

    let response = { propertyData: [], contactData: [] };
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        response.propertyData = result;
        if (result.length == 0) {
            let contactQuery = `
                SELECT c.UUID as Id, CONCAT(c.FirstName, ' ', c.LastName) as Name, c.Mobile, c.Email, c.VehicleRegNumber 
                FROM contact c
                LEFT JOIN company cp ON c.CompanyId = cp.Id AND cp.IsAgliveSupportAdmin = 0
                WHERE cp.UUID = '${companyId}' ${contactSearchText} AND c.IsDeleted = 0 AND c.IsPrivate = 0 AND c.IsActive = 1
                ORDER BY c.FirstName LIMIT 10;`;

            return models.sequelize.query(contactQuery, { type: models.sequelize.QueryTypes.SELECT });
        }
        else return false;
    }).then(function (result) {
        if (result)
            response.contactData = result;
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get properties under company/region/business
let getPropertiesByCompany = (condition) => {
    return models.property.findAll({
        raw: true,
        include: [{
            required: true,
            model: models.company,
            as: 'company',
            attributes: [],
            where: condition,
        }],
        attributes: [['UUID', 'Id'], 'PIC']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getInductionInitialData = (uuid) => {
    let query = `SELECT IFNULL(p.DefaultGPS,s.DefaultGPS) AS DefaultGPS , PIC, LivestockIdentifier
                FROM property p
                LEFT JOIN suburb s ON p.SuburbId = s.Id
                WHERE p.UUID = '${uuid}'`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// check reference of property in livestock table to delete
let checkPropertyReference = (propertyIds) => {
    let baseQuery = `SELECT DISTINCT p.UUID, p.AuditLogId
        FROM property p
        left JOIN livestock l ON l.CurrentPropertyId = p.Id
        where IFNULL(l.IsDeleted, 1) = 0 and p.UUID in (${propertyIds.join(',')});`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getProperties: getProperties,
    getPropertyFilterData: getFilterData,
    getPropertyDataSet: getDataSet,
    getPropertySearch: getPropertySearch,
    findProperty: findProperty,
    checkPIC: checkDuplicatePIC,
    getPropertyMngrAsstMngr: getMngrAsstMngr,
    createProperty: create,
    updateProperty: update,
    getPropertyDetailById: getById,
    getPropertiesByCompany: getPropertiesByCompany,
    getInductionInitialData: getInductionInitialData,
    getPropertyByCondition: getByCondition,
    checkPropertyReference: checkPropertyReference
}