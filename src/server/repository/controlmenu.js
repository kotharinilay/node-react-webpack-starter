'use strict';

/*************************************
 * database interaction methods related to 
 * 'ControlMenu' table
 * *************************************/

import models from '../schema';

// get all control menu by moduleId
let getByModuleId = (moduleId, language) => {
    return models.view_controlmenu.findAll({ where: { Language: language, ModuleId: moduleId }, raw: true }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get all setup menu by controlMenuId
let getSetupByControlMenuId = (controlMenuId, language) => {
    return models.view_setupmenu.findAll({ where: { Language: language, ControlMenuId: controlMenuId }, raw: true }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}


module.exports = {
    getControlMenuByModuleId: getByModuleId,
    getSetupByControlMenuId: getSetupByControlMenuId
}