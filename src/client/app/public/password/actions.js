'use strict';

/*********************************************
 * define action creator over here
 * **************************************** */

import { FORGOTPASSWORD_FORM_SET_VALUE } from './actiontypes';

export function loginFormSetValue(key, value, isValid, isDirty) {
    return
    {
        type: FORGOTPASSWORD_FORM_SET_VALUE,
            key,
            value,
            isValid,
            isDirty
    }
}
