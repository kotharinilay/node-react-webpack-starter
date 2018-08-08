'use strict';

/*************************************
 * database interaction methods related to 
 * 'propertyaccess' table
 * *************************************/

import models from '../schema';
import { getRoleName } from '../../shared/index';

// create multiple propertyaccess record to DB
let bulkCreate = (obj, trans = null) => {
    return models.propertyaccess.bulkCreate(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete propertyaccess record from DB
let remove = (condition, trans = null) => {
    return models.propertyaccess.destroy({ where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get property access list for permission
let getAccessList = (companyId, regionId, businessId, propertyId) => {

    companyId = companyId ? "'" + companyId + "'" : null;
    regionId = regionId ? "'" + regionId + "'" : null;
    businessId = businessId ? "'" + businessId + "'" : null;
    propertyId = propertyId ? "'" + propertyId + "'" : null;

    let query = 'CALL sp_propertyaccess(' + companyId + ', ' + regionId + ', ' + businessId + ', ' + propertyId + ');';
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result));
        let response = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });
        return getRoleName(response);
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get default property access list for permission
let getDefaultAccessList = (companyId, regionId, businessId, propertyId) => {

    companyId = companyId ? "'" + companyId + "'" : null;
    regionId = regionId ? "'" + regionId + "'" : null;
    businessId = businessId ? "'" + businessId + "'" : null;
    propertyId = propertyId ? "'" + propertyId + "'" : null;

    let query = 'CALL sp_propertyaccess(' + companyId + ', ' + regionId + ', ' + businessId + ', ' + propertyId + ');';
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result));
        let response = Object.keys(resultData[0]).map(function (k) { return resultData[0][k] });

        let listIds = [];
        response.map(r => {
            let role = "";
            if ((r.IsSuperUser != 0 || r.RManager != 0 || r.RAsstManager != 0 || r.BManager != 0 || r.BAsstManager != 0) && r.IsExternal != 1) {
                listIds.push(r.Id);
            }
        });

        return listIds;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    bulkCreatePropAccess: bulkCreate,
    removePropAccess: remove,
    getPropertyAccess: getAccessList,
    getDefaultAccessList: getDefaultAccessList
}