'use strict';

/**************************
 * Perform the actions of header.
 * Return the state based on previous and current actions
 * **************************** */

import { SEARCHKEY, SET_MODULE, SET_CONTROL_MENU, SET_TOP_PIC } from './actiontypes';

function headerReducer(state = {}, action) {
    switch (action.type) {
        case SEARCHKEY:
            let newState1 = Object.assign({}, state, {
                topSearch: action.payload
            })
            return newState1;
        case SET_MODULE:
            let newState = Object.assign({}, state, {
                moduleId: action.moduleId,
                controlMenuId: action.controlMenuId,
                setupMenuKey: action.setupMenuKey
            })
            return newState;
        case SET_TOP_PIC:
            return Object.assign({}, state, {
                topPIC: action.payload
            });
        default:
            return state;
    }
}

export default headerReducer