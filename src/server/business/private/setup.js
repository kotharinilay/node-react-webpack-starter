'use strict';

/***********************************
 * Logic related to setup menu
 * *********************************/

import Promise from 'bluebird';
import { map } from 'lodash';
import { getResponse, resMessages } from '../../lib/index';
import { getSetupByControlMenuId } from '../../repository/controlmenu';
var modules = require("../../json-data/modules.json");

// Return list of setup menu
function getSetupMenu(controlMenuId,language) {
    return getSetupByControlMenuId(controlMenuId,language).then(function (response) {        
        return getResponse(200, null, { setupMenu: response});
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getSetupMenu: Promise.method(getSetupMenu)
}