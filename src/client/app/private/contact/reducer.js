'use strict';

/**************************
 * Perform the actions of authUser.
 * Return the state based on previous and current actions
 * **************************** */

import { UPDATE_CONTACT } from './actiontypes';

function authUserReducer(state = {}, action) {
    switch (action.type) {
        case UPDATE_CONTACT:
            let newState = Object.assign({}, state, {
                FirstName: action.payload.FirstName,
                LastName: action.payload.LastName
            });
            return newState;
        default:
            return state;
    }
}

export default authUserReducer