'use strict';

/*************************************
 * database interaction methods related to 
 * 'fatcolour' table
 * *************************************/

import models from '../schema';

// get all fatcolour for drop down
let getBindings = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_fatcolour_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getFatColourBindings: getBindings
}