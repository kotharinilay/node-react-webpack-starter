'use strict';

/*************************************
 * database interaction methods related to 
 * 'Module' table
 * *************************************/

import models from '../schema';

// get module and control menu records
let getModuleControlMenus = (language) => {
    let baseQuery = `
    SELECT * FROM view_module WHERE Language = '${language}';
    SELECT * FROM view_controlmenu WHERE Language = '${language}';
    `;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        return resultData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getModuleControlMenus: getModuleControlMenus
}