'use strict';

/*************************************
 * database interaction methods related to 
 * 'PropertyAccreditationProgram' table
 * *************************************/

import models from '../schema';

// create multiple PropertyAccreditationProgram record to DB
let bulkCreate = (obj, trans = null) => {
    return models.propertyaccreditationprogram.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all Property Accreditation Program record by PropertyId
let getById = (propertyId, language) => {
    let baseQuery = `
        SELECT ap.Id, pap.UUID as PapId, ap.AccreditationProgramCode as Name, ap.AccreditationProgramName as Code, ap.SystemCode,
        pap.IsActive as IsActive,
        IF(pap.LicenseNumber IS NULL, '', pap.LicenseNumber) as LicenseNumber,
        pap.StateId,
        IF(pap.ExpiryDate IS NULL, '', pap.ExpiryDate) as ExpiryDate,
        IF(pap.Notes IS NULL, '', pap.Notes) as Notes
        FROM view_accreditationprogram ap  
        LEFT JOIN propertyaccreditationprogram pap on pap.AccreditationProgramId = ap.ProgramId AND pap.PropertyId = fn_UuidToBin('${propertyId}')
        WHERE ap.Language='${language}' AND ap.IsActive=1 AND ap.IsDeleted=0;`;
    return models.sequelize.query(baseQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let response = JSON.parse(JSON.stringify(result));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get inactive Property Accreditation Program count by PropertyId
let getInActiveById = (propertyId) => {
    let baseQuery = `SELECT p.Id FROM view_accreditationprogram a
    LEFT JOIN propertyaccreditationprogram p on p.AccreditationProgramId = a.ProgramId AND p.PropertyId = fn_UuidToBin('${propertyId}')
    WHERE a.IsDeleted = 0 AND p.UUID IS NOT NULL AND a.IsActive = 0;`;

    return models.sequelize.query(baseQuery, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let response = JSON.parse(JSON.stringify(result));
        let responseData = [];
        response.map(r => {
            responseData.push(r.Id);
        });
        return responseData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete Property Accreditation Program record from DB
let remove = (condition, trans = null) => {
    return models.propertyaccreditationprogram.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    removePropAccreditation: remove,
    bulkCreatePropAccreditation: bulkCreate,
    getPropAccredByPropId: getById,
    getInActivePropAccredById: getInActiveById
}