'use strict';

/*******************************************
 * reducer to assign store value
 * ****************************************** */

import {
    SHOW_CONFIRM_POPUP, HIDE_CONFIRM_POPUP,
    NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING, NOTIFY_INFO
} from './actiontypes';
import _ from 'lodash';

function commonReducer(state = {}, action) {
    switch (action.type) {

        case SHOW_CONFIRM_POPUP:
        case HIDE_CONFIRM_POPUP:
            return Object.assign({}, state, {
                confirmPopup: action.payload
            });

        case NOTIFY_SUCCESS:
        case NOTIFY_ERROR:
        case NOTIFY_WARNING:
        case NOTIFY_INFO:
            return Object.assign({}, state, {
                notificationSystem: action.payload
            });

        default:
            return state;
    }
}

export default commonReducer;