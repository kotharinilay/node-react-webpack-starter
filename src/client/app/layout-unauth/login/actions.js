'use strict';

import { SAVEDETAILS, LOGIN_FORM_SET_VALUE } from './actiontypes';

export function saveDetails() {
    return {
        type: SAVEDETAILS
    }
}

export function loginFormSetValue(key, value, isValid, isDirty) {
    return {
        type: LOGIN_FORM_SET_VALUE,
        key,
        value,
        isValid,
        isDirty
    }
}
