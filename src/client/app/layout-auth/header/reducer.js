'use strict';

/**************************
 * Perform the actions of header.
 * Return the state based on previous and current actions
 * **************************** */

import { SEARCHKEY } from './actiontypes';

function headerReducer(state = {}, action) {
    var newState = Object.assign({}, state);
    switch (action.type) {
        case SEARCHKEY:
            return newState;
        default:
            return newState;
    }
}

export default headerReducer