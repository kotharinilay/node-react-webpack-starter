'use strict';

/*************************************
 * database interaction methods related to 
 * 'Contact' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';
import { map } from 'lodash';
import { isUUID } from '../../shared/format/string';
import { uuidToBuffer, bufferToUUID } from '../../shared/uuid';
import { userRole } from '../../shared/index';

// create contact record to DB
let create = (obj, trans = null) => {
    return models.contact.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getContactDataSet = (pageSize, skipRec, sortOrder = 'asc', sortColumn = 'Name', searchText, filterObj, language) => {
    let searchQuery = '';
    let addJoin = '';
    if (searchText) {
        searchQuery = ` AND (c.FirstName LIKE '${searchText}' OR c.LastName LIKE '${searchText}' OR
                             c.Email like '${searchText}' OR c.Mobile like '${searchText}' OR 
                             c.BusinessAddress like '${searchText}' OR s.Name like '${searchText}' OR
                             c.VehicleRegNumber like '${searchText}' OR c.BadgeNumber like '${searchText}' OR
                             c.SaleAgentCode like '${searchText}' OR 
                             std.StateCode like '${searchText}')`;
    }
    if (filterObj && typeof filterObj == 'object') {
        for (var key in filterObj) {
            if (filterObj.hasOwnProperty(key)) {
                if (key == 'RegionId') {
                    addJoin = `LEFT JOIN company com ON c.CompanyId = com.CompanyId 
                               AND (com.UUID = '${filterObj[key]}' OR com.RegionId = fn_UuidToBin('${filterObj[key]}'))`;
                    searchQuery += ` AND (com.ManagerId = c.Id OR com.AsstManagerId = c.Id)`;
                }
                else if (key == 'BusinessId') {
                    addJoin = `LEFT JOIN company com ON c.CompanyId = com.CompanyId AND com.UUID = '${filterObj[key]}'`;
                    searchQuery += ` AND (com.ManagerId = c.Id OR com.AsstManagerId = c.Id)`;
                }
                else if (isUUID(filterObj[key].toString())) {
                    searchQuery += ` AND ${key} = fn_UuidToBin('${filterObj[key]}')`;
                }
                else {
                    searchQuery += ` AND ${key} = '${filterObj[key]}'`;
                }
            }
        }
    }

    searchQuery += `ORDER BY ${sortColumn} ${sortOrder}`;
    if (skipRec != null && pageSize != null)
        searchQuery += ` LIMIT ${skipRec},${pageSize}`;

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS c.UUID AS Id, CONCAT(c.FirstName, ' ', c.LastName) AS Name, a.UUID AS AuditLogId, c.Email,
        c.Mobile, c.UserName, c.IsActive, c.IsPrivate,
        CONCAT(s.Name, ', ', std.StateCode) AS Suburb
        FROM contact c
        LEFT JOIN auditlog a ON a.Id = c.AuditLogId
        LEFT JOIN suburb s ON c.BusinessSuburbId = s.Id
        LEFT JOIN state st ON s.StateId = st.Id
        LEFT JOIN statedata std ON std.StateId = st.Id AND std.Language='${language}'
        ${addJoin}
        WHERE c.IsDeleted = 0 ${searchQuery};
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

// get user details
let getUserDetails = (id, language) => {
    let baseQuery = `
    SELECT con.UUID AS Id, con.FirstName, con.LastName, con.Mobile, con.Telephone, con.Fax, con.Email, com.UUID AS CompanyId,
    con.IsPrivate, con.IsSuperUser, con.UserName, con.IsActive, com.Name AS CompanyName, com.ShortCode AS ShortCode,
    con.BusinessAddress, con.BusinessSuburbId, sb.Name AS BusinessSuburb, sb.PostCode AS BusinessPostCode,
    con.ContactCode, con.BadgeNumber, con.BusinessStateId, com.BusinessCountryId,
    stbd.StateName as 'BusinessStateName',
    con.PostalAddress, con.PostalSuburbId, sp.Name AS PostalSuburb, sp.PostCode AS PostalPostCode,
    con.PostalStateId, stbp.StateName as 'PostalStateName',
    con.VehicleRegNumber, con.SaleAgentCode, con.BadgeNumber, con.SignatureFileId, fss.FilePath AS SignaturePicPath,
    fss.MimeType AS SignaturePicType, fss.FileName AS SignaturePicName,
	 con.AvatarFileId, fsa.FilePath AS AvatarPicPath, fsa.MimeType AS AvatarPicType, fsa.FileName AS AvatarPicName,
    con.PreferredLanguage, con.AuditLogId, con.IsNvdSignatureAllowed

    FROM contact con
    LEFT JOIN company com ON con.CompanyId = com.Id
    LEFT JOIN suburb sb ON con.BusinessSuburbId = sb.Id
    LEFT JOIN suburb sp ON con.PostalSuburbId = sp.Id
    LEFT JOIN state stb ON con.BusinessStateId = stb.Id
    LEFT JOIN statedata stbd ON stbd.StateId = stb.Id AND stbd.Language = '${language}'
    LEFT JOIN state stp ON con.PostalStateId = stp.Id
    LEFT JOIN statedata stbp ON stbp.StateId = stp.Id AND stbp.Language = '${language}'
    LEFT JOIN filestorage fss ON con.SignatureFileId = fss.Id
    LEFT JOIN filestorage fsa ON con.AvatarFileId = fsa.Id
    WHERE con.IsDeleted = 0  AND con.UUID = '${id}'`;

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

// Get only PreferredWidgets from contact
let getWidgetsById = (id) => {
    return models.contact.findOne({
        raw: true, where: { UUID: id },
        attributes: [[sequelize.fn('COLUMN_JSON', sequelize.col('PreferredWidgets')), 'PreferredWidgets']]
    }).then(function (result) {
        return result ? result.PreferredWidgets : null;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// Update PreferredWidgets based on given array of widgets
let updateWidgetsById = (widgets, id) => {
    let revisedWidgets = (widgets != undefined && widgets.length > 0) ? sequelize.fn('COLUMN_CREATE', widgets) : null;
    return models.contact.update({ PreferredWidgets: revisedWidgets }, { where: { UUID: id } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact record by token value
let getByToken = (token) => {
    return models.contact.find({ raw: true, where: { Id: id } }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact record by email
let getByEmail = (email) => {
    return models.contact.find({
        raw: true,
        include: [{
            model: models.filestorage,
            attributes: [['FilePath', 'Path']],
            as: 'avatar'
        }, {
            model: models.property,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'propertylogo'
            }],
            attributes: [['UUID', 'PropertyId'], ['Name', 'Name'], ['PIC', 'PIC']],
            as: 'property'
        }, {
            model: models.company,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'companylogo'
            }],
            attributes: ['UUID', 'Name'],
            as: 'company'
        }], where: { Email: email }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact record by id
let getById = (id) => {
    return models.contact.find({
        raw: true,
        include: [{
            model: models.filestorage,
            attributes: [['FilePath', 'Path']],
            as: 'avatar'
        },
        {
            model: models.property,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'propertylogo'
            },
            {
                model: models.company,
                attributes: [['Id', 'companyId'], ['Name', 'companyName'], ['RegionId', 'regionId']],
                as: 'company'
            }],
            attributes: [['UUID', 'PropertyId'], ['Name', 'Name'], ['PIC', 'PIC']],
            as: 'property'
        },
        {
            model: models.company,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'companylogo'
            }],
            attributes: [['UUID', 'CompanyId'], ['Name', 'CompanyName'], 'IsAgliveSupportAdmin',
            ['BusinessCountryId', 'CountryId']],
            as: 'company'
        }],
        where: { UUID: id }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact record by user name
let getByUserName = (username) => {
    return models.contact.findOne({
        raw: true,
        include: [{
            model: models.filestorage,
            attributes: [['FilePath', 'Path']],
            as: 'avatar'
        }, {
            model: models.property,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'propertylogo'
            }],
            attributes: [['UUID', 'PropertyId'], ['Name', 'Name'], ['PIC', 'PIC']],
            as: 'property'
        }, {
            model: models.company,
            include: [{
                model: models.filestorage,
                attributes: [['FilePath', 'Path']],
                as: 'companylogo'
            }],
            attributes: ['UUID', 'Name', 'IsAgliveSupportAdmin', ['BusinessCountryId', 'CountryId']],
            as: 'company'
        }], where: { UserName: username }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update contact record to DB
let update = (obj, condition, trans = null) => {
    let updateRes = null;
    let contactRes = null;
    return models.contact.update(obj, { where: condition, transaction: trans }).then(function (result) {
        updateRes = result;
        return models.contact.find({ raw: true, attributes: ['UUID', 'CompanyId', 'IsSiteAdministrator', 'IsSuperUser'], where: condition });
    }).then(function (result) {
        contactRes = result;
        return models.token.findAll({ raw: true, attributes: ['Token'], where: { ContactId: uuidToBuffer(contactRes.UUID) } });
    }).then(function (result) {
        return { tokenRes: result, updateRes: updateRes, contactRes: contactRes };
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete contact record to DB
let remove = (condition, trans = null) => {
    return models.contact.destroy({ raw: true, where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getAccessiblePICs = (id, language, isSiteAdministrator) => {
    let baseQuery = `
    SELECT p.UUID, p.PIC, p.Name,p.SuburbId, 
    CONCAT(s.Name, ', ', std.StateCode) AS Suburb, 
    ${isSiteAdministrator == false ? 'pa.ValidFromDate, pa.ValidToDate,' : ''}
    'Manage Livestock' Role
    FROM property p
    ${isSiteAdministrator == false ?
            'INNER JOIN propertyaccess pa ON p.Id = pa.PropertyId' +
            'INNER JOIN contact c ON pa.ContactId = c.Id' : ''}
    LEFT JOIN suburb s ON p.SuburbId = s.Id
    LEFT JOIN state st ON s.StateId = st.Id
    LEFT JOIN statedata std ON std.StateId = st.Id AND std.Language='${language}'
    WHERE ${isSiteAdministrator == false ? 'c.UUID = "' + id + '" AND p.IsDeleted=0' : 'p.IsDeleted=0'} 

    UNION

    SELECT p.UUID, p.PIC, p.Name,p.SuburbId, 
    CONCAT(s.Name, ', ', std.StateCode) AS Suburb, ${isSiteAdministrator == false ? 'null, null,' : ''}
	CASE WHEN p.PropertyManagerId IS NOT NULL THEN '${userRole.propertyManager}'
    WHEN p.AsstPropertyManagerId IS NOT NULL THEN '${userRole.propertyAsstManager}' END AS Role
    FROM property p
    INNER JOIN contact c on p.PropertyManagerId = c.Id OR p.AsstPropertyManagerId = c.Id
    LEFT JOIN suburb s ON p.SuburbId = s.Id
    LEFT JOIN state st ON s.StateId = st.Id
    LEFT JOIN statedata std ON std.StateId = st.Id AND std.Language='${language}'
    WHERE c.UUID = '${id}'`;

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

// get assigned roles to user
let getUserRegionRoles = (contactId, companyId) => {
    let baseQuery = `
    SELECT region.Name AS RegionName, IFNULL(c.TypeName, '${userRole.noAccess}') AS RoleName, c.FirstName, c.Email, c.ContactId,
    region.RegionCompanyId
    FROM
    (SELECT r.Name, r.CompanyId, r.Id AS RegionCompanyId FROM company r
    WHERE r.CompanyType = 'R' AND
    r.CompanyId = fn_UuidToBin('${companyId}')) region
    LEFT JOIN
    (SELECT con.FirstName, con.Email, con.IsSiteAdministrator, com.Name, com.Id,
    con.UUID AS ContactId,
    CASE WHEN com.ManagerId = fn_UuidToBin('${contactId}') THEN '${userRole.regionManager}'
	 		 WHEN com.AsstManagerId = fn_UuidToBin('${contactId}') THEN '${userRole.regionAsstManager}' END AS 'TypeName'
    FROM contact con
    INNER JOIN company com ON con.CompanyId = com.CompanyId
    WHERE con.UUID = '${contactId}' AND com.CompanyType = 'R') c 
    ON c.Id = region.RegionCompanyId;
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

// get assigned roles to user
// contact Id : UUID
// companyId : UUID
let getUserBusinessRoles = (contactId, companyId) => {
    //let companyId = new Buffer(companyId.data);
    let baseQuery = `
    SELECT business.Name AS BusinessName, IFNULL(c.TypeName, '${userRole.noAccess}') AS RoleName, c.FirstName, c.Email, c.ContactId,
    business.BusinessCompanyId
    FROM
    (SELECT b.Name, b.CompanyId, b.Id AS BusinessCompanyId FROM company b
    WHERE b.CompanyType = 'B' AND
    b.CompanyId = fn_UuidToBin('${companyId}')) business
    LEFT JOIN
    (SELECT con.FirstName, con.Email, con.IsSiteAdministrator, com.Name, com.Id,
    con.UUID AS ContactId,
    CASE WHEN com.ManagerId = fn_UuidToBin('${contactId}') THEN '${userRole.businessManager}'
	 		 WHEN com.AsstManagerId = fn_UuidToBin('${contactId}') THEN '${userRole.businessAsstManager}' END AS 'TypeName'
    FROM contact con
    INNER JOIN company com ON con.CompanyId = com.CompanyId
    WHERE con.UUID = '${contactId}' AND com.CompanyType = 'B') c 
    ON c.Id = business.BusinessCompanyId;
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

let findContact = (obj) => {

    obj.companyName = obj.companyName == null ? null : "'" + obj.companyName + "'";
    obj.businessName = obj.businessName == null ? null : "'" + obj.businessName + "'";
    obj.contactName = obj.contactName == null ? null : "'" + obj.contactName + "'";
    obj.abn = obj.abn == null ? null : "'" + obj.abn + "'";
    obj.acn = obj.acn == null ? null : "'" + obj.acn + "'";
    obj.suburbId = !obj.suburbId ? null : "'" + obj.suburbId + "'";

    let params = obj.companyName + "," + obj.businessName + "," + obj.contactName + "," + obj.abn + "," + obj.acn + "," + obj.suburbId;
    let query = "CALL sp_findcontact(" + params + ")";

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get assigned roles to contact
let getContactCurrentRoles = (contactId, companyId) => {
    let baseQuery = `
    SELECT com.Id, com.CompanyId AS 'ParentId', CASE WHEN com.ManagerId = fn_UuidToBin('${contactId}') THEN 'RegionManager'
                    WHEN com.AsstManagerId = fn_UuidToBin('${contactId}') THEN 'RegionAsstManager'
                    ELSE NULL END AS 'CurrentRole'

    FROM company com
    WHERE com.CompanyType='R' AND com.CompanyId = fn_UuidToBin('${companyId}')

    UNION

    SELECT com.Id, com.RegionId AS 'ParentId', CASE WHEN com.ManagerId = fn_UuidToBin('${contactId}') THEN 'BusinessManager'
                    WHEN com.AsstManagerId = fn_UuidToBin('${contactId}') THEN 'BusinessAsstManager'
                    ELSE NULL END AS 'CurrentRole'

    FROM company com
    WHERE com.CompanyType='B' AND com.CompanyId = fn_UuidToBin('${companyId}');

    SELECT p.Id, p.CompanyId, c.CompanyType, CASE WHEN p.PropertyManagerId = fn_UuidToBin('${contactId}') THEN 'PropertyManager'
                  WHEN p.AsstPropertyManagerId = fn_UuidToBin('${contactId}') THEN 'AsstPropertyManager'
                  ELSE NULL END AS 'CurrentRole'
    FROM property p
    LEFT JOIN company c ON p.CompanyId = c.Id
    WHERE c.Id = fn_UuidToBin('${companyId}') OR c.CompanyId = fn_UuidToBin('${companyId}');

    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
            propertyRoles: resultData[1]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all active contact record for drop down
let getContact = (companyId) => {
    return models.contact.findAll({
        raw: true,
        where: { IsDeleted: 0, IsActive: 1, CompanyId: uuidToBuffer(companyId) },
        attributes: [['UUID', 'Id'], [sequelize.fn('concat', sequelize.col('FirstName'), ' ', sequelize.col('LastName')), 'Name']]
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get regions, business unit of selected companies
let getByCompanyId = (condition) => {
    return models.contact.findAll({
        raw: true,
        where: condition,
        attributes: [['UUID', 'Id'], 'FirstName', 'AuditLogId']
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getSuperuserCount = (companyId, contactId) => {
    companyId = uuidToBuffer(companyId);
    let condition = {
        CompanyId: companyId,
        IsSuperUser: 1,
        IsDeleted: 0
    }
    if (isUUID(contactId)) {
        condition.UUID = { $ne: contactId };
    }
    return models.contact.count({
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestock configuration
let getLivestockConfiguration = (contactId) => {
    return models.contact.find({
        raw: true, where: { UUID: contactId }, attributes: ['PreferredLivestockConfiguration']
    }).then(function (result) {
        let response = result.PreferredLivestockConfiguration ? JSON.parse(result.PreferredLivestockConfiguration) : null;
        return response
    }).catch(function (err) {
        throw new Error(err);
    });
}

// set livestock configuration
let setLivestockConfiguration = (contactId, filterObj) => {
    return models.contact.update(
        { PreferredLivestockConfiguration: JSON.stringify(filterObj) },
        { where: { UUID: contactId } }
    ).then(function (result) {
        return filterObj;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact list
let getBySearch = (search, companyId) => {
    let filterQuery = companyId ? ` and cp.UUID = '${companyId}'` : '';

    let query = ` select c.UUID as Id, c.UUID as Value, concat(c.FirstName, ' ', c.LastName) as Name, 
            cp.Name as CompanyName, c.Mobile, c.Email, 
            IF(c.IsNvdSignatureAllowed = 1, c.SignatureFileId, null) as SignatureFileId,
            f.FilePath, f.FileName, f.MimeType
            from contact c
            left join company cp on cp.Id = c.CompanyId
            left join filestorage f on f.Id = c.SignatureFileId
            where c.IsDeleted = 0 and c.IsActive = 1 and cp.IsDeleted = 0 and 
            (c.FirstName like '%${search}%' or c.LastName like '%${search}%'
            or concat(c.FirstName, ' ', c.LastName) like '%${search}%') ${filterQuery};`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get list of contact to whoom property is accessible
let getPropertyAccessContacts = (propertyId, includePICAccess) => {
    let query = "CALL sp_propertyaccesscontacts('" + propertyId + "', " + includePICAccess + ")";

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact details by conditions
let getByCondition = (condition, joins, columns) => {
    let baseQuery = `select ${columns} from contact c ${joins} where c.IsDeleted = 0 and ${condition};`;
    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get list of transporter company
let getTransporterCompany = (search, transporterSystemCode) => {
    let query = `SELECT com.UUID AS CompanyId, com.Name AS CompanyName FROM companyservicetype cst
        JOIN servicetype st ON cst.ServiceTypeId = st.Id
        LEFT JOIN company com ON cst.CompanyId = com.Id
        WHERE st.SystemCode = '${transporterSystemCode}' AND st.IsDeleted = 0
        AND com.Name LIKE '%${search}%'
        ORDER BY com.Name;`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw err;
    });
}

// get list of Sale Agent company
let getSaleAgentCompany = (search, saleagentSystemCode) => {
    let query = `SELECT com.UUID AS CompanyId, com.Name AS CompanyName FROM companyservicetype cst
        JOIN servicetype st ON cst.ServiceTypeId = st.Id
        LEFT JOIN company com ON cst.CompanyId = com.Id
        WHERE st.SystemCode = '${saleagentSystemCode}' AND st.IsDeleted = 0
        AND com.Name LIKE '%${search}%'
        ORDER BY com.Name;`;

    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw err;
    });
}

module.exports = {
    getContactById: getById,
    getContactByToken: getByToken,
    getContactByEmail: getByEmail,
    getContactByUserName: getByUserName,
    getWidgetsById: getWidgetsById,
    getUserDetails: getUserDetails,
    getAccessiblePICs: getAccessiblePICs,
    getUserRegionRoles: getUserRegionRoles,
    getUserBusinessRoles: getUserBusinessRoles,
    getContactDataSet: getContactDataSet,
    findContact: findContact,
    createContact: create,
    updateContactDetail: update,
    updateWidgetsById: updateWidgetsById,
    removeContact: remove,
    getContactCurrentRoles: getContactCurrentRoles,
    getContact: getContact,
    getContactByCompanyId: getByCompanyId,
    superuserCount: getSuperuserCount,
    getLivestockConfiguration: getLivestockConfiguration,
    setLivestockConfiguration: setLivestockConfiguration,
    getContactSearch: getBySearch,
    getPropertyAccessContacts: getPropertyAccessContacts,
    getContactByCondition: getByCondition,
    getTransporterCompany: getTransporterCompany,
    getSaleAgentCompany: getSaleAgentCompany
}