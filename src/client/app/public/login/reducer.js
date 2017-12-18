'use strict';

/*******************************************
 * reducer to assign store value
 * ****************************************** */

import { SET_USER_INFO } from './actiontypes';
import _ from 'lodash';

function loginReducer(state = {}, action) {
    switch (action.type) {
        case SET_USER_INFO:
            return Object.assign({}, state, state = action.userInfo);
        default:
            return state;
    }
}

export default loginReducer