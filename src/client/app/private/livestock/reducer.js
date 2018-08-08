'use strict';

/**************************
 * Perform the actions of header.
 * Return the state based on previous and current actions
 * **************************** */

import { SET_SELECTED_TAGS } from './actiontypes';

function livestockReducer(state = {}, action) {
    switch (action.type) {
        case SET_SELECTED_TAGS:
            return Object.assign({}, state, {
                selectedTags: action.selectedTags
            });
        default:
            return state;
    }
}

export default livestockReducer