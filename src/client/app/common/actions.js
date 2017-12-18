'use strict';

/*******************************************
 * action creators
 * ****************************************** */

import {
    SHOW_CONFIRM_POPUP, HIDE_CONFIRM_POPUP,
    NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING, NOTIFY_INFO,
    SHOW_FIND_COMPANY, HIDE_FIND_COMPANY,
    SHOW_FIND_CONTACT, HIDE_FIND_CONTACT,
    SHOW_FIND_PIC, HIDE_FIND_PIC
} from './actiontypes';
import { get } from 'lodash';

// counter variable is only used to make updates to store 
// in case payload is same as previous
let counter = 0;

var notifyPayload = (payload, level, title) => {
    return {
        level: level,
        title: title,
        message: payload != undefined && payload.message != undefined ? payload.message : null,
        action: payload != undefined && payload.action != undefined ? payload.action : null,
        strings: payload != undefined && payload.strings != undefined ? payload.strings : null,
        counter: counter++
    };
}

// show modal popup 
var openConfirmPopup = (payload) => {
    return {
        type: SHOW_CONFIRM_POPUP, payload: {
            ...payload,
            counter: counter++,
            isOpen: true
        }
    }
}

// hide modal popup
var hideConfirmPopup = (payload = {}) => {
    return {
        type: HIDE_CONFIRM_POPUP,
        payload: {
            ...payload,
            counter: counter++,
            isOpen: false
        }
    }
}

var notifyToaster = (type, payload) => {
    let level = null;
    let title = null;

    switch (type) {
        case NOTIFY_SUCCESS:
            level = 'success';
            title = 'Success';
            break;
        case NOTIFY_WARNING:
            level = 'warning';
            title = 'Warning';
            break;
        case NOTIFY_ERROR:
            level = 'error';
            title = 'Error';
            break;
        case NOTIFY_INFO:
            level = 'info';
            title = 'Information';
            break;
    }

    return {
        type: type,
        payload: notifyPayload(payload, level, title)
    };
}

module.exports = {
    notifyToaster,
    openConfirmPopup,
    hideConfirmPopup
};
