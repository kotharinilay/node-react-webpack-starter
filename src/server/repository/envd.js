'use strict';

/*************************************
 * database interaction methods related to 
 * e-NVD
 * *************************************/

import models from '../schema';
import { accreditationProgramCodes } from '../../shared/constants';
import { formatDateTime } from '../../shared/format/date';
import { serviceTypes } from '../../shared/constants';

// get livestockpropertyhistory latest entrydate record by LivestockId and PropertyId
let getLivestockSummaryData = (livestockIds, language) => {
    let uuids = [];
    livestockIds.map(id => {
        uuids.push(`'${id}'`);
    });
    let baseQuery = `
    SELECT uuid() AS SummaryId, GROUP_CONCAT(l.UUID) AS LivestockId,SUM(l.NumberOfHead) AS NumberOfHead, la.EarmarkText, 
           la.BrandText, sd.SpeciesName, s.UUID AS SpeciesId, l.Mob, l.IsMob,
           CONCAT(IFNULL(CONCAT(bc.BreedName, ', '), '') ,IFNULL(CONCAT(md.MaturityName, ', '), ''), gd.GenderName) AS Description,
           m.UUID AS MaturityId, g.UUID AS GenderId, bc.BreedId
    FROM livestock l
    LEFT JOIN livestockattribute la ON l.Id = la.LivestockId
    LEFT JOIN (SELECT b.UUID AS BreedId, bd.BreedName, bci.LivestockId FROM breedcomposition bci
               LEFT JOIN breed b ON bci.BreedId = b.Id
               LEFT JOIN breeddata bd ON b.Id = bd.BreedId AND bd.Language = '${language}'
               GROUP BY bci.LivestockId) AS bc ON bc.LivestockId = l.Id
    LEFT JOIN species s ON l.SpeciesId = s.Id
    LEFT JOIN speciesdata sd ON s.Id = sd.SpeciesId AND sd.Language = '${language}'
    LEFT JOIN maturity m ON l.MaturityStatusId = m.Id
    LEFT JOIN maturitydata md ON m.Id = md.MaturityId AND md.Language = '${language}'
    LEFT JOIN gender g ON l.GenderId = g.Id
    LEFT JOIN genderdata gd ON g.Id = gd.GenderId AND gd.Language = '${language}'
    WHERE l.UUID IN (${uuids.join()})
    GROUP BY la.EarmarkText, la.BrandText, l.Mob, Description;
    `;

    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let checkEUAccreditation = (consignedToPropertyId, destinationPropertyId) => {
    consignedToPropertyId = consignedToPropertyId || '';
    destinationPropertyId = destinationPropertyId || '';
    let baseQuery = `SELECT COUNT(pap.Id) AS 'Count' FROM propertyaccreditationprogram pap
    LEFT JOIN accreditationprogram ap ON pap.AccreditationProgramId = ap.Id
    WHERE ap.SystemCode = '${accreditationProgramCodes.EUCattle}' AND pap.PropertyId IN (fn_UuidToBin('${consignedToPropertyId}'), 
          fn_UuidToBin('${destinationPropertyId}')) AND pap.IsActive = 1;`

    return models.sequelize.query(baseQuery).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all envd record for grid
let getDataSet = (pageSize, skipRec, sortOrder, sortColumn, filterObj, searchText) => {
    let euCondition = ``;
    let searchQuery = '';
    let joinQuery = '';

    if (filterObj) {
        let topPIC = filterObj.topPIC.PIC;
        let { contactId, companyId, isSiteAdministrator,
            assigneNVD, eNVDType, retrivedeNVD, species, eNVDStatus, hasEU, fromDate, toDate } = filterObj;

        let contactJoin = `LEFT JOIN contact cd ON cd.Id = nd.DeclarerContactId
                    LEFT JOIN contact ct ON ct.Id = nd.TransporterContactId
                    LEFT JOIN contact cs ON cs.Id = nd.SaleAgentContactId`;

        let picEqualCondition = `(nd.ConsignerPIC = '${topPIC}' OR nd.DestinationPIC = '${topPIC}' OR nd.ConsignerPIC = '${topPIC}')`;
        let contactEqualCondition = `(nd.DeclarerContactId = fn_UuidToBin('${contactId}') OR nd.TransporterContactId = fn_UuidToBin('${contactId}') OR nd.SaleAgentContactId = fn_UuidToBin('${contactId}'))`;
        let companyEqualCondition = `(cd.CompanyId = fn_UuidToBin('${companyId}') OR ct.CompanyId = fn_UuidToBin('${companyId}') OR cs.CompanyId = fn_UuidToBin('${companyId}'))`;
        let contactNotEqualCondition = `(nd.DeclarerContactId <> fn_UuidToBin('${contactId}') AND nd.TransporterContactId <> fn_UuidToBin('${contactId}') AND nd.SaleAgentContactId = fn_UuidToBin('${contactId}'))`;

        if (isSiteAdministrator == 1) {
            // If Logged In user is SiteAdministrator
            searchQuery += ` AND ${picEqualCondition}`;
        }
        else if (topPIC) {
            // If Logged in user is not SiteAdministrator
            // If Top PIC is selected (in case of producer)            
            if (assigneNVD == 2) {
                // If Assigned to ME is selected
                searchQuery += ` AND ${picEqualCondition} AND ${contactEqualCondition}`;
            }
            else if (assigneNVD == 3) {
                // If Assigned to Other is selected
                joinQuery = contactJoin;
                searchQuery += ` AND ${picEqualCondition} AND ${contactNotEqualCondition} AND ${companyEqualCondition}`;
            }
        }
        else {
            // If Logged in user is not SiteAdministrator
            // If Top PIC is not selecteed (in case of transporter/sale agent)
            if (assigneNVD == 2) {
                // If Assigned to ME is selected
                searchQuery += ` AND ${contactEqualCondition}`;
            }
            else if (assigneNVD == 3) {
                // If Assigned to Other is selected
                joinQuery = contactJoin;
                searchQuery += ` AND ${contactNotEqualCondition} AND ${companyEqualCondition}`;
            }
        }

        searchQuery += eNVDType ? ` AND n.NVDType = ${eNVDType}` : '';
        searchQuery += eNVDStatus ? ` AND n.LastNVDStatusId = fn_UuidToBin('${eNVDStatus}')` : '';
        searchQuery += species ? ` AND n.SpeciesId = fn_UuidToBin('${species}')` : '';
        searchQuery += retrivedeNVD != undefined ? ` AND n.IsForeignNVD = ${retrivedeNVD == true ? 1 : 0}` : '';

        euCondition = hasEU == true ? 'HasEU > 0' : '1=1';

        if (fromDate && toDate) {
            let fromDT = formatDateTime(fromDate).YYYYMMDDFormat;
            let toDT = formatDateTime(toDate).YYYYMMDDFormat;
            searchQuery += ` AND (DATE(n.NLISSubmittedDate) BETWEEN '${fromDT}' and '${toDT}' OR
                DATE(n.MovementCommenceDate) BETWEEN '${fromDT}' and '${toDT}' OR
                DATE(n.DateOfDelivery) BETWEEN '${fromDT}' and '${toDT}')`;
        }

    }

    if (searchText) {
        searchQuery += ` AND (n.SerialNumber LIKE '${searchText}' OR n.ReferenceNumber LIKE '${searchText}' OR
           nd.ConsignerPIC LIKE '${searchText}' OR nd.ConsigneePIC LIKE '${searchText}' OR nd.DestinationPIC LIKE '${searchText}' OR
           nd.ConsignerPropertyName LIKE '${searchText}' OR nd.ConsigneePropertyName LIKE '${searchText}' OR nd.DestinationPropertyName LIKE '${searchText}' OR
           s.Name LIKE '${searchText}' OR s1.Name LIKE '${searchText}' OR s2.Name LIKE '${searchText}' OR
           std.StateName LIKE '${searchText}' OR std1.StateName LIKE '${searchText}' OR std2.StateName LIKE '${searchText}')`;
    }

    let baseQuery =
        `select SQL_CALC_FOUND_ROWS * FROM (SELECT  
            n.UUID as Id, n.SerialNumber, n.IsPostedOnMLA, n.MLAReferenceNumber, n.MLASubmittedDate, n.ReferenceNumber, n.MovementCommenceDate, n.DateOfDelivery, 
            n.TotalLivestockQty, n.IsMobNVD, fi.FilePath as IndFileIcon, fm.FilePath as MobIcon, 
            sd.StatusName, sd.StatusCode, n.SupportedAccreditations,
            nd.ConsignerPIC as Consigner, 
            CONCAT(s.Name, ', ', std.StateCode, ', ', s.PostCode) as ConsignerAddress,            
            IF(nd.DestinationPropertyId is null, nd.ConsigneePIC, nd.DestinationPIC) as Consignee, 
             IF(nd.DestinationPropertyId is null, 
                CONCAT(s1.Name, ', ', std1.StateCode, ', ', s1.PostCode), 
                CONCAT(s2.Name, ', ', std2.StateCode, ', ', s2.PostCode)) as ConsigneeAddress,                
            ns.ColorCode, n.IsForeignNVD, SUM(l.HasEU) as HasEU, n.NVDType, a.UUID as AuditLogId, a.CreatedStamp,
            nd.TransporterCompanyId, nd.TransporterContactId
            FROM nvd n
            LEFT JOIN auditlog a ON a.Id = n.AuditLogId
            LEFT JOIN species sp ON sp.Id = n.SpeciesId
            LEFT JOIN filestorage fm ON sp.MobIconFileId = fm.Id
            LEFT JOIN filestorage fi ON sp.IndFileIconId = fi.Id
            LEFT JOIN nvd_detail nd ON nd.NVDId = n.Id
            LEFT JOIN nvd_livestock l ON l.NVDId = n.Id
            LEFT JOIN nvdstatus ns ON ns.Id = n.LastNVDStatusId
            LEFT JOIN nvdstatusdata sd ON sd.NVDStatusId = n.LastNVDStatusId AND sd.Language = '${filterObj.language}'
            LEFT JOIN suburb s ON s.Id = nd.ConsignerPropertySuburbId
            LEFT JOIN statedata std ON std.StateId = s.StateId and std.Language = '${filterObj.language}'
            LEFT JOIN suburb s1 ON s1.Id = nd.ConsigneePropertySuburbId
            LEFT JOIN statedata std1 ON std1.StateId = s1.StateId and std1.Language = '${filterObj.language}'
            LEFT JOIN suburb s2 ON s2.Id = nd.DestinationPropertySuburbId
            LEFT JOIN statedata std2 ON std2.StateId = s2.StateId and std2.Language = '${filterObj.language}'
            ${joinQuery}
            WHERE n.IsDeleted = 0 AND (DATE(n.NLISSubmittedDate) BETWEEN DATE_ADD(CURDATE(), INTERVAL -30 DAY) AND CURDATE() OR n.NLISSubmittedDate is null) ${searchQuery} 
            GROUP BY l.NVDId) as tbl WHERE ${euCondition} ORDER BY ${sortColumn} ${sortOrder}, CreatedStamp desc  LIMIT ${skipRec},${pageSize};

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

let getDeliveryInitialData = (nvdId, contactId, language) => {
    let baseQuery =
        `SELECT n.UUID AS Id, n.TotalLivestockQty, n.NVDType, n.ReferenceNumber, n.SerialNumber, n.MovementCommenceDate,
       n.AuditLogId, n.IsMobNVD, n.SpeciesId, 
       nd.DeclarerAcknowledgedDate, nd.DeclarerFirstName, nd.DeclarerLastName, nd.DeclarerMobile, nd.DeclarerEmail,
       nd.ConsignerPIC, nd.ConsignerPropertyName,  nd.ConsignerPropertyAddress, nd.ConsignerPropertyId,
       presub.Name AS ConsignerSuburbName, presub.PostCode AS ConsignerPostCode, prestd.StateName AS ConsignerStateName, 
       consigneesub.Name AS ConsigneeSuburbName, consigneesub.PostCode AS ConsigneePostCode, consigneestd.StateName AS ConsigneeStateName,
       destsub.Name AS DestinationSuburbName, destsub.PostCode AS DestinationPostCode, deststd.StateName AS DestinationStateName,
       nd.ConsigneePIC, nd.ConsigneePropertyAddress, nd.DestinationPIC, nd.DestinationPropertyAddress, nd.ConsigneeEmail, 
       nd.DestinationEmail, nd.ConsigneePropertyId,
       CONCAT(nd.SaleAgentFirstName, ' ', nd.SaleAgentLastName, ' (', n.SaleAgentCode, ')') AS SaleAgentName, nd.SaleAgentMobile, 
       nd.SaleAgentEmail, nd.SaleAgentCompanyName, nd.SaleAgentAddress, 
       CONCAT(salesub.Name, ', ', salestd.StateCode, ', ', salesub.PostCode) as SaleAgentSuburb, nd.TransporterCompanyName, 
       nd.TransporterDriverName, nd.TransporterMobile, nd.TransporterEmail, 
       p1.DefaultGPS, (@destinationId:=p1.UUID) AS DestinationPropertyId, p1.PIC AS DestinationPIC,
       ps.NLISUsername, ps.NLISPassword, n.VehicleRego, sd.SpeciesName
       FROM nvd n
       LEFT JOIN nvd_detail nd ON n.Id = nd.NVDId
       LEFT JOIN property ps ON nd.ConsignerPropertyId = ps.Id
       LEFT JOIN property p1 ON IFNULL(nd.DestinationPropertyId, nd.ConsigneePropertyId) = p1.Id
       LEFT JOIN suburb salesub ON salesub.Id = nd.SaleAgentSuburbId
       LEFT JOIN state salest ON salest.Id = salesub.StateId
       LEFT JOIN statedata salestd ON salest.Id = salestd.StateId AND salestd.Language = '${language}'
       LEFT JOIN suburb presub ON presub.Id = nd.ConsignerPropertySuburbId
       LEFT JOIN state prest ON prest.Id = presub.StateId
       LEFT JOIN statedata prestd ON prest.Id = prestd.StateId AND prestd.Language = '${language}'
       LEFT JOIN suburb consigneesub ON consigneesub.Id = nd.ConsigneePropertySuburbId
       LEFT JOIN state consigneest ON consigneest.Id = consigneesub.StateId
       LEFT JOIN statedata consigneestd ON consigneest.Id = consigneestd.StateId AND consigneestd.Language = '${language}'
       LEFT JOIN suburb destsub ON destsub.Id = nd.DestinationPropertySuburbId
       LEFT JOIN state destst ON destst.Id = destsub.StateId
       LEFT JOIN statedata deststd ON destst.Id = deststd.StateId AND deststd.Language ='${language}'
       LEFT JOIN species s ON n.SpeciesId = s.Id
       LEFT JOIN speciesdata sd ON s.Id = sd.SpeciesId AND sd.Language = '${language}'
       WHERE n.UUID = '${nvdId}';
       
       SELECT UUID AS Id, Name, DefaultGPS 
       FROM enclosure 
       WHERE IsDeleted = 0 AND PropertyId = fn_UuidToBin(@destinationId);
       
       SELECT con.UUID FROM contact con
       JOIN company com ON con.CompanyId = com.Id
       JOIN companyservicetype cst ON com.Id = cst.CompanyId OR com.CompanyId = cst.CompanyId OR com.RegionId = cst.CompanyId 
       LEFT JOIN servicetype st ON cst.ServiceTypeId = st.Id
       WHERE (st.SystemCode = '${serviceTypes.SaleAgent}' AND con.UUID = '${contactId}');
       
       SELECT c.UUID FROM contact c
       JOIN company com ON c.CompanyId = com.Id
       LEFT JOIN property p ON p.CompanyId = com.Id OR p.CompanyId = com.CompanyId OR p.CompanyId = com.RegionId
       WHERE p.UUID = @destinationId AND c.UUID = '${contactId}';
       
       SELECT * FROM nvd_livestock WHERE NVDId = fn_UuidToBin('${nvdId}');

       SELECT * FROM nvd_livestocksummary WHERE NVDId = fn_UuidToBin('${nvdId}');`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get nvd details by id
let getById = (nvdId, language) => {
    let query = `CALL sp_getnvd('${nvdId}', '${language}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result));
        let nvdData = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });
        let livestockSummaryData = Object.keys(resultData[1]).map(function (k) { return resultData[1][k] });
        let lpaQuestionnaireData = Object.keys(resultData[2]).map(function (k) { return resultData[2][k] });
        let accreditationQuestionnireData = Object.keys(resultData[3]).map(function (k) { return resultData[3][k] });
        let documentData = Object.keys(resultData[4]).map(function (k) { return resultData[4][k] });
        return {
            nvdData: nvdData, livestockSummaryData: livestockSummaryData, lpaQuestionnaireData: lpaQuestionnaireData,
            accreditationQuestionnireData: accreditationQuestionnireData, documentData: documentData
        };
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all envd livestock record for grid
let getLivestockDataSet = (pageSize, skipRec, sortOrder, sortColumn, filterObj, language) => {

    let searchQuery = '';
    if (filterObj) {
        searchQuery = ` WHERE nl.NVDId = fn_UuidToBin('${filterObj}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS 
            l.Mob, l.NumberOfHead, l.EID, l.NLISID, l.VisualTag,
            GROUP_CONCAT(b.BreedName SEPARATOR ", ") as BreedName, m.MaturityName, g.GenderName
            FROM nvd_livestock nl
            LEFT JOIN livestock l ON l.Id = nl.LivestockId
            LEFT JOIN breedcomposition bc ON bc.LivestockId = l.Id
            LEFT JOIN view_breed b ON b.Id = fn_BinToUuid(bc.BreedId) AND b.Language = '${language}'
            LEFT JOIN maturitydata m ON m.MaturityId = l.MaturityStatusId AND m.Language = '${language}'
            LEFT JOIN genderdata g ON g.GenderId = l.GenderId AND g.Language = '${language}'
            ${searchQuery} GROUP BY l.Id ORDER BY  ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};

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

// get all eNVD status record for dropdown
let geteNVDStatus = (language) => {
    let query = `select ns.UUID as Id, nsd.StatusName, nsd.StatusCode from nvdstatus ns
        left join nvdstatusdata nsd on ns.Id = nsd.NVDStatusId
        where nsd.Language = '${language}';`;
    return models.sequelize.query(query).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create e-NVD record to DB
let create = (obj, trans = null) => {
    return models.nvd.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update nvd related model record to DB
let update = (obj, modelName, condition, trans = null) => {
    return models[modelName].update(obj, { where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete nvd related model record to DB
let remove = (modelName, condition, trans = null) => {
    return models[modelName].destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create e-NVD status history record to DB
let createStatusHistory = (obj, trans = null) => {
    return models.nvd_status_history.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create e-NVD Detail record to DB
let createDetail = (obj, trans = null) => {
    return models.nvd_detail.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple NVD livestock summary record to DB
let bulkCreateLivestockSummary = (obj, trans = null) => {
    return models.nvd_livestocksummary.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple NVD livestocks record to DB
let bulkCreateLivestock = (obj, trans = null) => {
    return models.nvd_livestock.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get livestocks record by condition
let getLivestockByCondition = (attr, condition, trans = null) => {
    return models.nvd_livestock.findAll({
        where: condition,
        raw: true,
        attributes: attr,
        transaction: trans
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple LPA Questionnaire records to DB
let bulkCreateLPAQuestionnaire = (obj, trans = null) => {
    return models.nvd_lpa_questionnaire.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple Accreditaion Questionnaire records to DB
let bulkCreateAccreditaionQuestionnaire = (obj, trans = null) => {
    return models.nvd_accreditation_questionnaire.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create multiple NVD document records to DB
let bulkCreateDocument = (obj, trans = null) => {
    return models.nvd_document.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// create NVDAccreditation from propertyaccreditationprogram
let bulkCreateNVDAccreditation = (consignerPropertyId, NVDId, SupportedAccreditationIds, trans = null) => {
    let supportedAccreditationIds = SupportedAccreditationIds.map((accrId) => {
        return `'${accrId.Id}'`;
    });
    let baseQuery = `INSERT INTO nvd_accreditationprogram (UUID, NVDId, AccreditationProgramId, LicenseNumber, Notes, Id)
                     SELECT @uid:=UUID(), fn_UuidToBin('${NVDId}'), AccreditationProgramId, 
                     LicenseNumber, Notes, fn_UuidToBin(@uid)
                     FROM propertyaccreditationprogram
                     WHERE PropertyId = fn_UuidToBin('${consignerPropertyId}') AND
                     fn_BinToUuid(AccreditationProgramId) IN (${supportedAccreditationIds.join()});`;
    return models.sequelize.query(baseQuery, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// retrived data for print waybill
let printWaybill = (language, id) => {

    let baseQuery = `select n.ReferenceNumber, nd.ConsignerPIC, n.NVDType,
        concat(nd.DeclarerFirstName, ' ', nd.DeclarerLastName) as DeclarerName,                                   
        concat(nd.DeclarerAddress, ' ', s.SuburbName, ' ', s.StateCode, ' ', s.PostCode) as DeclarerAddress,                                                     
        f.FilePath as DeclarerSignature, nd.DeclarerAcknowledgedDate as DeclarerSignatureDate,                    
        if(nd.DeclarerTelephone is null, nd.DeclarerMobile, nd.DeclarerTelephone) as DeclarerTelephone            
        from nvd n                                                                                                
        left join nvd_detail nd on nd.NVDId = n.Id                                                                
        left join view_suburb_detail s on fn_UuidToBin(s.Id) = nd.DeclarerSuburbId and s.StateLanguage = '${language}'
        left join filestorage f on f.Id = nd.DeclarerSignatureId
        where n.UUID = '${id}';

        select * from nvd_lpa_questionnaire n
        where n.NVDId = fn_UuidToBin('${id}') and n.Loop is not null;
        
        select nl.NumberOfHead, 
        concat(IF(l.EID is null, '', concat(l.EID, ', ')), nls.Description) as Description, 
        nl.PICEarTag, nl.BrandText, nl.EarmarkText,
        IF(nl.HasLT is null, '',IF(nl.HasLT = 1, 'Yes', 'No')) as HasLT, 
        IF(nl.HasEU is null, '',IF(nl.HasEU = 1, 'Yes', 'No')) as HasEU, 
        IF(nl.HasERP is null, '',IF(nl.HasERP = 1, 'Yes', 'No')) as HasERP
        from nvd_livestock nl
        left join nvd_livestocksummary nls on nl.NVDLivestockSummaryId = nls.Id
        left join livestock l on l.Id = nl.LivestockId
        where nl.NVDId = fn_UuidToBin('${id}');`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            eNVD: resultData[0][0],
            questionnaire: resultData[1],
            stockDescription: resultData[2]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// retrived data for print eNVD
let printeNVD = (language, id) => {

    let baseQuery = `select n.MLASchemaVersion, n.MLAReferenceNumber, DATE_FORMAT(n.MLASubmittedDate,'%m-%d-%Y %h:%i %p') as MLASubmittedDate, n.SerialNumber, n.ReferenceNumber, nd.ConsignerPIC, nd.ConsignerPICOwner, nd.ConsignerPropertyName,
        concat(nd.ConsignerPropertyAddress, ', ', s.SuburbName, ', ', s.StateCode, ', ', s.PostCode) as ConsignerAddress,
        ifnull(nd.DestinationPIC, nd.ConsigneePIC) as ConsigneePIC,
        ifnull(nd.DestinationPropertyName, nd.ConsigneePropertyName) as ConsigneePropertyName,     
        
        nd.ConsigneePropertyAddress, s1.SuburbName as ConsigneeSuburbName, s1.StateCode as ConsigneeStateCode,
        concat(nd.DestinationPropertyAddress, ', ', s3.SuburbName, ', ', s3.StateCode, ', ', s3.PostCode) as DestinationPropertyAddress,

        n.NumberOfEarTags,
        concat(nd.DeclarerFirstName, ' ', nd.DeclarerLastName) as DeclarerName,                                     
        concat(nd.DeclarerAddress, ', ', s2.SuburbName, ', ', s2.StateCode, ', ', s2.PostCode) as DeclarerAddress,
        f.FilePath as DeclarerSignature, nd.DeclarerAcknowledgedDate as DeclarerSignatureDate,
        if(nd.DeclarerTelephone is null, nd.DeclarerMobile, nd.DeclarerTelephone) as DeclarerTelephone, nd.DeclarerFax,
        n.MovementCommenceDate,n.MovementCommenceDate as MovementCommenceTime, n.VehicleRego, 
        concat(nd.TransporterDriverName, ' (', nd.TransporterCompanyName, ')') as DriverName,
        f1.FilePath as TransporterSignature, nd.TransporterAcknowledgedDate,
        if(nd.TransporterTelephone is null, nd.TransporterMobile, nd.TransporterTelephone) as TransporterTelephone,
        n.SaleAgentVendorCode, n.SaleAgentCode, 
        concat(nd.SaleAgentCompanyName, ', ', nd.SaleAgentFirstName, ' ', nd.SaleAgentLastName) as SaleAgentCompany,
        f2.FilePath as SaleAgentSignature, nd.SaleAgentAcknowledgedDate, n.SaleyardArrivalTime
        from nvd n
        left join nvd_detail nd on nd.NVDId = n.Id                                                                
        left join view_suburb_detail s on fn_UuidToBin(s.Id) = nd.ConsignerPropertySuburbId and s.StateLanguage = '${language}'
        left join view_suburb_detail s1 on fn_UuidToBin(s1.Id) = nd.ConsigneePropertySuburbId and s1.StateLanguage = '${language}'
        left join view_suburb_detail s2 on fn_UuidToBin(s2.Id) = nd.DeclarerSuburbId and s2.StateLanguage = '${language}'
        left join view_suburb_detail s3 on fn_UuidToBin(s3.Id) = nd.DestinationPropertySuburbId and s3.StateLanguage = '${language}'
        left join filestorage f on f.Id = nd.DeclarerSignatureId
        left join filestorage f1 on f1.Id = nd.TransporterSignatureId
        left join filestorage f2 on f2.Id = nd.SaleAgentSignatureId
        where n.UUID = '${id}';

        select * from nvd_lpa_questionnaire n where n.NVDId = fn_UuidToBin('${id}');
        
        select nl.NumberOfHead, nls.Description, nl.BrandText, nl.EarmarkText, la.Drop, la.LastMonthOfShearing
        from nvd_livestock nl
        left join livestockattribute la on la.LivestockId = nl.LivestockId
        left join nvd_livestocksummary nls on nl.NVDLivestockSummaryId = nls.Id
        where nl.NVDId = fn_UuidToBin('${id}');
                
        select nap.LicenseNumber, nap.Notes, apd.ProgramCode
        from nvd_accreditationprogram nap
        left join accreditationprogramdata apd on apd.ProgramId = nap.AccreditationProgramId and apd.Language = '${language}'
        where nap.NVDId = fn_UuidToBin('${id}');`;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            eNVD: resultData[0][0],
            questionnaire: resultData[1],
            stockDescription: resultData[2],
            accreditation: resultData[3]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });

}

// get data for use last answers
let useLastAnswers = (propertyId, eNVDType) => {

    let baseQuery = `
    set @nvdId = (select n.UUID 
        from nvd n 
        left join nvd_detail nd on n.Id = nd.NVDId 
        left join auditlog a on a.Id = n.AuditLogId 
        where n.IsDeleted = 0 and n.NVDType = ${eNVDType} and nd.ConsignerPropertyId = fn_UuidToBin('${propertyId}')
        order by a.CreatedStamp desc limit 1);

    select n.UUID, nlq.UUID AS LPAQuestionnaireId, nlq.QuestionNo, nlq.DataId, nlq.Loop, nlq.SortOrder,
        nlq.Value, nlq.AgliveFileId, fs.FilePath AS LPAFilePath, fs.FileName AS LPAFileName, fs.MimeType 
        from nvd n
        left join nvd_lpa_questionnaire nlq on nlq.NVDId = n.Id
        left join filestorage fs on nlq.AgliveFileId = fs.Id
        where nlq.Id is not null and n.UUID = @nvdId;
                
    select naq.UUID AS AccreditationQuestionnaireId, naq.AccreditationProgramId, naq.DataId, naq.Value,
        naq.AgliveFileId, fs.FilePath AS AccreditaionFilePath, fs.FileName AS AccreditaionFileName, fs.MimeType
        from nvd n
        left join nvd_accreditation_questionnaire naq on naq.NVDId = n.Id
        left join filestorage fs on naq.AgliveFileId = fs.Id
        where naq.Id is not null and n.UUID = @nvdId;`;

    return models.sequelize.query(baseQuery).then(function (result) {

        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            lpaQuestionnaireData: resultData[1],
            accreditationQuestionnireData: resultData[2]
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getLivestockSummaryData: getLivestockSummaryData,
    checkEUAccreditation: checkEUAccreditation,
    createNVD: create,
    createNVDStatusHistory: createStatusHistory,
    createNVDDetail: createDetail,
    bulkCreateNVDLivestockSummary: bulkCreateLivestockSummary,
    bulkCreateNVDLivestock: bulkCreateLivestock,
    bulkCreateNVDLPAQuestionnaire: bulkCreateLPAQuestionnaire,
    bulkCreateNVDAccreditaionQuestionnaire: bulkCreateAccreditaionQuestionnaire,
    bulkCreateNVDDocument: bulkCreateDocument,
    bulkCreateNVDAccreditation: bulkCreateNVDAccreditation,
    geteNVDDataSet: getDataSet,
    getDeliveryInitialData: getDeliveryInitialData,
    geteNVDLivestockDataSet: getLivestockDataSet,
    geteNVDStatusBinding: geteNVDStatus,
    geteNVDById: getById,
    updateModel: update,
    removeModel: remove,
    printWaybill: printWaybill,
    printeNVD: printeNVD,
    useLastAnswers: useLastAnswers,
    getLivestockByCondition: getLivestockByCondition
}