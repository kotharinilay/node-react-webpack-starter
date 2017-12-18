'use strict';

/*******************************************
 * action creators
 * ****************************************** */

import { SET_USER_INFO } from './actiontypes';

export function setUserInfo(userInfo) {
    return {
        type: SET_USER_INFO,
        userInfo
    }
}
