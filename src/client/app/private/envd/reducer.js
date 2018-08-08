'use strict';

/**************************
 * Perform the actions of e-NVD.
 * Return the state based on previous and current actions
 * **************************** */

import { SET_COMMON_DETAILS } from './actiontypes';

function envdReducer(state = {}, action) {
    switch (action.type) {
        case SET_COMMON_DETAILS:
            let prevObj = state.commonDetails;
            return Object.assign({}, state,
                { commonDetails: { ...prevObj, ...action.payload } });
        default:
            return state;
    }
}

export default envdReducer;