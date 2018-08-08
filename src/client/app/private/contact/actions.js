'use strict';

/**************************
 * action list of authUser 
 * **************************** */

import { UPDATE_CONTACT } from './actiontypes';

function updateContact(payload) {
    return {
        type: UPDATE_CONTACT,
        payload
    }
}

module.exports = {
    updateContact: updateContact
}