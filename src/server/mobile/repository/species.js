'use strict';

/*************************************
 * database interaction methods related to 
 * 'Speices' table
 * *************************************/

import models from '../../schema';
import { forEach as _forEach } from 'lodash'



// get all species record for drop down
let getSpecies = (language, companyId, regionId, businessId, propertyId) => {
    companyId = companyId || '';
    regionId = regionId || '';
    businessId = businessId || '';
    propertyId = propertyId || '';
    let query = `CALL sp_species_ddl('${propertyId}','${companyId}','${regionId}','${businessId}','${language}');`;
    return models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT }).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = Object.keys(resultData).map(function (k) { return resultData[k] });
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}


module.exports = {
    getSpeciesBinding: getSpecies
}