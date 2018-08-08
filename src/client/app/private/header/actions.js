'use strict';

/**************************
 * action list of header 
 * **************************** */

import { SEARCHKEY, SET_MODULE, SET_CONTROL_MENU, SET_TOP_PIC } from './actiontypes';
import { bufferToUUID } from '../../../../shared/uuid';

function search(searchText) {
    return {
        type: SEARCHKEY,
        payload: {
            counter: Math.random(),
            searchText: searchText
        }
    }
}

function setModule(moduleId, controlMenuId = null, setupMenuKey = null) {
    return {
        type: SET_MODULE,
        moduleId,
        controlMenuId,
        setupMenuKey
    }
}

function setTopPIC(payload) {
    if (payload.CompanyId) payload.CompanyId = bufferToUUID(payload.CompanyId);
    if (payload.RegionId) payload.RegionId = bufferToUUID(payload.RegionId);
    if (payload.BusinessId) payload.BusinessId = bufferToUUID(payload.BusinessId);
    return {
        type: SET_TOP_PIC,
        payload: payload
    }
}

module.exports = {
    search: search,
    setModule: setModule,
    setTopPIC: setTopPIC
}