'use strict';

/*******************************************
 * reducer to assign store value
 * ****************************************** */

import {
    SHOW_CONFIRM_POPUP, HIDE_CONFIRM_POPUP,
    NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING, NOTIFY_INFO,
    SHOW_FIND_COMPANY, HIDE_FIND_COMPANY,
    SHOW_FIND_CONTACT, HIDE_FIND_CONTACT,
    SHOW_FIND_PIC, HIDE_FIND_PIC
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

        case SHOW_FIND_COMPANY:
        case HIDE_FIND_COMPANY:
            return Object.assign({}, state, {
                findCompany: action.payload
            });

        case SHOW_FIND_CONTACT:
        case HIDE_FIND_CONTACT:
            return Object.assign({}, state, {
                findContact: action.payload
            });

        case SHOW_FIND_PIC:
        case HIDE_FIND_PIC:
            return Object.assign({}, state, {
                findPIC: action.payload
            });

        default:
            return state;
    }
}

export default commonReducer;