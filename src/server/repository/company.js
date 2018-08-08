'use strict';

/*************************************
 * database interaction methods related to 
 * 'company' table
 * *************************************/

import models from '../schema';
import { uuidToBuffer } from '../../shared/uuid';

// get company hierarchy record for dropdown
let getHierarchy = (companyId, regionId, businessId, siteAdmin, superUser, contactId, regionDisabled) => {
    let query = 'CALL sp_companyhierarchy(' + companyId + ', ' + regionId + ', ' + businessId + ', ' + siteAdmin + ', ' + superUser + ', ' + contactId + ', ' + regionDisabled + ');';
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result));
        let companyData = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });
        let regionData = Object.keys(resultData[1]).map(function (k) { return resultData[1][k] });
        let businessData = Object.keys(resultData[2]).map(function (k) { return resultData[2][k] });
        let propertyData = Object.keys(resultData[3]).map(function (k) { return resultData[3][k] });
        let hierarchyRoleData = Object.keys(resultData[4]).map(function (k) { return resultData[4][k] });
        let companyDisabled = hierarchyRoleData.length > 0 ? hierarchyRoleData[0].companyDisable == 1 : false;
        let regionDisabled = hierarchyRoleData.length > 0 ? hierarchyRoleData[0].regionDisable == 1 : false;
        return { company: companyData, region: regionData, business: businessData, property: propertyData, isCompanyDisabled: companyDisabled, isRegionDisabled: regionDisabled };
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get ids of company hierarchy record for dropdown
let getHierarchyIds = (id) => {
    let query = "CALL sp_companyhierarchyids('" + id + "');";
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response[0];
    }).catch(function (err) {
        throw new Error(err);
    });
}

let findCompany = (obj) => {

    obj.companyName = obj.companyName == null || obj.companyName.length == 0 ? null : "'" + obj.companyName + "'";
    obj.businessName = obj.businessName == null || obj.businessName.length == 0 ? null : "'" + obj.businessName + "'";
    obj.contactName = obj.contactName == null || obj.contactName.length == 0 ? null : "'" + obj.contactName + "'";
    obj.serviceTypeId = obj.serviceTypeId == null || obj.serviceTypeId.length == 0 ? null : "'" + obj.serviceTypeId + "'";
    obj.abn = obj.abn == null || obj.abn.length == 0 ? null : "'" + obj.abn + "'";
    obj.acn = obj.acn == null || obj.acn.length == 0 ? null : "'" + obj.acn + "'";
    obj.suburbId = obj.suburbId == null || obj.suburbId.length == 0 ? null : "'" + obj.suburbId + "'";

    let params = obj.companyName + "," + obj.businessName + "," + obj.contactName + "," + obj.serviceTypeId + "," + obj.abn + "," + obj.acn + "," + obj.suburbId;
    let query = "CALL sp_findcompany(" + params + ")";

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// generate sql query
let generateQuery = (language, pageSize, skipRec, sortColumn = 'c.Name', sortOrder = 'asc', searchQuery = '', havingQuery = '', joinQuery = '') => {
    let query =
        `SELECT SQL_CALC_FOUND_ROWS DISTINCT c.UUID AS Id, c.Name, a.UUID AS AuditLogId, c.Email,
        CONCAT(s.Name, ', ', sd.StateCode, ', ',s.PostCode) AS Address,
        c.Mobile, c.ABN, c.ACN, GROUP_CONCAT(std.ServiceTypeName) AS ServiceType,
        GROUP_CONCAT(sert.UUID) AS ServiceTypeId, sert.ColorCode,
        csp.ValidFromDate, csp.ValidToDate        
        FROM company c
        LEFT JOIN companyservicetype cst ON cst.CompanyId = c.Id
        LEFT JOIN servicetype sert ON sert.Id = cst.ServiceTypeId
        LEFT JOIN servicetypedata std ON std.ServiceTypeId = sert.Id AND std.Language = '${language}' 
        LEFT JOIN auditlog a ON a.Id = c.AuditLogId
        LEFT JOIN suburb s ON c.BusinessSuburbId = s.Id
        LEFT JOIN state st ON s.StateId = st.Id
        LEFT JOIN statedata sd ON sd.StateId = st.Id AND sd.Language = '${language}' 
        LEFT JOIN companysubscriptionplan csp ON csp.CompanyId = c.Id AND csp.ValidFromDate <= NOW() AND csp.ValidToDate >= NOW()        
        ${joinQuery}
        WHERE c.IsDeleted = 0 AND c.CompanyType = 'C' AND c.IsAgliveSupportAdmin = 0 ${searchQuery} 
        GROUP BY c.UUID ${havingQuery} ORDER BY ${sortColumn} ${sortOrder} `;

    if (skipRec != null || pageSize != null) {
        query += `LIMIT `;
        if (skipRec != null && pageSize != null)
            query += ` ${skipRec},${pageSize} `;
        else if (skipRec != null) {
            query += ` ${skipRec} `;
        }
        else if (pageSize != null) {
            query += ` ${pageSize} `;
        }

    }
    query += ';';
    return query
}

let getAutoCompleteData = (language, pageSize, filterObj) => {

    let havingQuery = '';
    if (filterObj && typeof filterObj == 'object') {
        for (var key in filterObj) {
            if (filterObj.hasOwnProperty(key)) {
                havingQuery += ` HAVING ${key} LIKE '%${filterObj[key]}%'`;
            }
        }
    }

    let baseQuery = generateQuery(language, pageSize, null, 'c.Name', 'asc', '', havingQuery);
    return models.sequelize.query(baseQuery).then(function (result) {
        let res = JSON.parse(JSON.stringify(result[0]));
        return res;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get company data for grid
let getDataSet = (pageSize, skipRec, sortOrder = 'asc', sortColumn = 'Name', searchText, filterObj, language) => {
    sortColumn = sortColumn || 'Name';
    sortOrder = sortOrder || 'asc';
    let searchQuery = '';
    let havingQuery = '';
    let joinQuery = '';
    if (filterObj && typeof filterObj == 'object') {
        for (var key in filterObj) {
            if (filterObj.hasOwnProperty(key)) {
                if (typeof filterObj[key] == 'object') {
                    if (filterObj[key].length > 0) {
                        havingQuery += ` HAVING ${key} LIKE '%${filterObj[key].toString()}%'`;
                    }
                }
                else {
                    searchQuery += ` AND ${key} = '${filterObj[key]}'`;
                }
            }
        }
    }
    if (searchText) {
        joinQuery = `LEFT JOIN contact ct ON ct.Id = c.ManagerId 
            LEFT JOIN company r on r.CompanyId = c.Id and r.CompanyType = 'R' and r.IsDeleted = 0
            LEFT JOIN company b on (b.CompanyId = c.Id or b.RegionId = r.Id) and b.CompanyType = 'B' and b.IsDeleted = 0`;
        searchQuery += ` AND (c.Name LIKE '${searchText}' OR c.ShortCode LIKE '${searchText}' 
            OR s.Name LIKE '${searchText}' OR sd.StateName LIKE '${searchText}'
            OR ct.FirstName LIKE '${searchText}' OR ct.LastName LIKE '${searchText}'
            OR r.Name LIKE '${searchText}' OR b.Name LIKE '${searchText}') `;
    }
    let baseQuery = generateQuery(language, pageSize, skipRec, sortColumn, sortOrder, searchQuery, havingQuery, joinQuery);
    baseQuery += `SELECT FOUND_ROWS() AS Total; `;

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

// get company by Id
let getById = (id) => {
    return models.company.findOne({
        raw: true,
        where: { UUID: id }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get company by email
let getByEmail = (email) => {
    return models.company.findOne({
        raw: true,
        where: { Email: email, IsDeleted: 0 }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    })
}

// get basic company details by specific condition
let getByCondition = (condition) => {
    return models.company.findAll({
        raw: true,
        where: condition,
        attributes: [['UUID', 'Id'], 'CompanyId', 'RegionId', 'CompanyType', 'Name', 'AuditLogId']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get company by name
let getByName = (name, companyId, type, id) => {
    let condition = { Name: name, IsDeleted: 0 };
    if (id) {
        condition.UUID = { $ne: id };
    }
    if (type != 'C') {
        condition.CompanyId = uuidToBuffer(companyId);
    }
    return models.company.findOne({
        raw: true,
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    })
}

// update company record to DB
let update = (obj, condition, trans = null) => {
    return models.company.update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create company record to DB
let create = (obj, trans = null) => {
    return models.company.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get company details
let getDetails = (id, language) => {
    let baseQuery = `
    SELECT c.UUID AS Id, c.CompanyType, c.Name AS CompanyName, c.ShortCode, c.Mobile, c.Telephone, 
    c.Fax, c.Email, c.Website, c.ABN, c.ACN, c.BusinessAddress, c.BusinessSuburbId,
    c.BusinessCountryId, c.PostalCountryId, c.AuditLogId, 
    sb.Name AS BusinessSuburb, sb.PostCode AS BusinessPostCode, 
    sd1.StateName as 'BusinessStateName',
    c.PostalAddress, c.PostalSuburbId, sp.Name AS PostalSuburb, sp.PostCode AS PostalPostCode,
    sd2.StateName as 'PostalStateName',
    c.ManagerId, c.AsstManagerId, c.LogoFileId, fs.FilePath AS LogoPath,
    fs.MimeType AS LogoType, fs.FileName AS LogoName, c.IsAgliveSupportAdmin
    FROM company c
    LEFT JOIN suburb sb ON c.BusinessSuburbId = sb.Id
    LEFT JOIN suburb sp ON c.PostalSuburbId = sp.Id
    LEFT JOIN state stb ON sb.StateId = stb.Id
    LEFT JOIN statedata sd1 ON sd1.StateId = stb.Id AND sd1.Language='${language}'
    LEFT JOIN state stp ON sp.StateId = stp.Id
    LEFT JOIN statedata sd2 ON sd2.StateId = stp.Id AND sd2.Language='${language}'
    LEFT JOIN filestorage fs ON c.LogoFileId = fs.Id
    WHERE c.IsDeleted = 0 AND c.UUID = '${id}';

    SELECT ServiceTypeId
    FROM companyservicetype
    WHERE fn_BinToUuid(CompanyId) = '${id}'
    ;`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            companyData: resultData[0],
            serviceType: resultData[1]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get region data for grid
let getRegionDataSet = (pageSize, skipRec, sortOrder = 'asc', sortColumn = 'Name', searchText, filterObj, language) => {
    sortColumn = sortColumn || 'Name';
    sortOrder = sortOrder || 'asc';

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS com.UUID AS Id, com.Name, CONCAT(con.FirstName, ' ', con.LastName) AS Manager,
        CONCAT(s.Name, ', ', std.StateCode) AS Suburb,
        CONCAT(con.Email, ' ', con.Mobile) As Contact, a.UUID AS AuditLogId,
        (SELECT COUNT(p.PIC) FROM property p WHERE p.CompanyId IN (SELECT cr.Id FROM company cr WHERE cr.RegionId = com.Id)) AS PICCount,
        SUM(IF(com.ManagerId is NOT NULL,1,0)) + SUM(IF(com.AsstManagerId is NOT NULL,1,0)) + 
        SUM(IF(b.ManagerId is NOT NULL,1,0)) + SUM(IF(b.AsstManagerId is NOT NULL,1,0)) AS UserCount
        FROM company com
        LEFT JOIN auditlog a ON com.AuditLogId = a.Id
        LEFT JOIN suburb s ON com.BusinessSuburbId = s.Id
        LEFT JOIN state st ON s.StateId = st.Id
        LEFT JOIN statedata std ON std.StateId = st.Id AND std.Language='${language}'
        LEFT JOIN contact con ON com.ManagerId = con.Id
        LEFT JOIN company b on b.RegionId = com.Id and b.CompanyType='B'
        WHERE com.IsDeleted = 0 AND com.CompanyType = 'R' AND com.CompanyId = fn_UuidToBin('${filterObj}')
        GROUP BY com.Id ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT FOUND_ROWS() AS Total; `;
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

// get business data for grid
let getBusinessDataSet = (pageSize, skipRec, sortOrder = 'asc', sortColumn = 'Name', searchText, filterObj, language) => {
    sortColumn = sortColumn || 'Name';
    sortOrder = sortOrder || 'asc';

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS com.UUID AS Id, com.Name, CONCAT(con.FirstName, ' ', con.LastName) AS Manager,
        CONCAT(s.Name, ', ', std.StateCode) AS Suburb,
        CONCAT(con.Email, ' ', con.Mobile) As Contact, a.UUID AS AuditLogId,
        (SELECT COUNT(p.PIC) FROM property p WHERE p.CompanyId IN (com.Id)) AS PICCount,
        SUM(IF(com.ManagerId is NOT NULL,1,0)) + SUM(IF(com.AsstManagerId is NOT NULL,1,0)) AS UserCount
        FROM company com
        LEFT JOIN auditlog a ON com.AuditLogId = a.Id
        LEFT JOIN suburb s ON com.BusinessSuburbId = s.Id
        LEFT JOIN state st ON s.StateId = st.Id
        LEFT JOIN statedata std ON std.StateId = st.Id AND std.Language='${language}'
        LEFT JOIN contact con ON com.ManagerId = con.Id
        WHERE com.IsDeleted = 0 AND com.CompanyType = 'B' AND com.CompanyId = fn_UuidToBin('${filterObj}')
        GROUP BY com.Id ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT FOUND_ROWS() AS Total; `;
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

// get region/business unit details
let getSubComapnyDetails = (id, type, language) => {

    let baseQuery = `
    SELECT c.UUID AS Id, c.CompanyType, c.Mobile, c.Telephone, c.Name, c.ShortCode,
    c.Fax, c.Email, c.Website, c.ABN, c.ACN, c.BusinessAddress, c.BusinessSuburbId,
    c.BusinessCountryId, c.PostalCountryId, c.AuditLogId, 
    sb.Name AS BusinessSuburb, sb.PostCode AS BusinessPostCode, 
    sdb.StateName as 'BusinessStateName',
    c.PostalAddress, c.PostalSuburbId, sp.Name AS PostalSuburb, sp.PostCode AS PostalPostCode,
    sdp.StateName as 'PostalStateName',
    c.ManagerId, c.AsstManagerId, c.RegionId,
    c.IsAgliveSupportAdmin 
    FROM company c
    LEFT JOIN suburb sb ON c.BusinessSuburbId = sb.Id
    LEFT JOIN suburb sp ON c.PostalSuburbId = sp.Id
    LEFT JOIN state stb ON sb.StateId = stb.Id
    LEFT JOIN statedata sdb ON sdb.StateId = stb.Id AND sdb.Language='${language}'
    LEFT JOIN state stp ON sp.StateId = stp.Id
    LEFT JOIN statedata sdp ON sdp.StateId = stp.Id AND sdp.Language='${language}'
    WHERE c.IsDeleted = 0 AND c.UUID = '${id}';

    ${type == 'B' ? 'SELECT ServiceTypeId FROM companyservicetype WHERE fn_BinToUuid(CompanyId) = "' + id + '"' : ''} 
    `;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            companyData: resultData[0],
            serviceType: resultData[1]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all region within company record for drop down
let getRegion = (companyId) => {
    return models.company.findAll({
        raw: true,
        where: { IsDeleted: 0, CompanyId: uuidToBuffer(companyId), CompanyType: 'R' },
        attributes: [['UUID', 'Id'], 'Name']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getHierarchy: getHierarchy,
    getHierarchyIds: getHierarchyIds,
    findCompany: findCompany,
    getCompanyDataSet: getDataSet,
    getCompanyById: getById,
    updateCompany: update,
    createCompany: create,
    getComapnyDetails: getDetails,
    getCompanyByEmail: getByEmail,
    getCompanyRegionDataSet: getRegionDataSet,
    getCompanyBusinessDataSet: getBusinessDataSet,
    getSubComapnyDetails: getSubComapnyDetails,
    getCompanyByName: getByName,
    getAllRegionData: getRegion,
    getCompanyByCondition: getByCondition,
    getAutoCompleteData: getAutoCompleteData
}