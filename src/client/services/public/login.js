'use strict';

/*************************************
 * authentication related functions
 * public services comes here...
 * *************************************/

import { loggedIn } from '../../lib/http/token-management';
import { post } from '../../lib/http/http-service';
import { deleteCookie, COOKIE } from '../../../shared/cookie';
import { clearStorage } from '../../../shared/localstorage';

// logs out user
function logout() {
    // Clear user token and profile data from localStorage
    deleteCookie(COOKIE.ID_TOKEN, '/');
    deleteCookie(COOKIE.REMEMBER_ME, '/');
    clearStorage();

}

// check user token before enter any authenticated route
function checkAuth(nextState, replace) {
    if (typeof window !== "undefined") {
        if (!loggedIn()) {            
            if (typeof (replace)!="object" && typeof (replace)!=undefined) {
                replace({
                    pathname: '/login',
                    state: { nextPathname: nextState.location.pathname }
                });
            }
        }
    }
}

// skip login page if user already logged in 
// and try to access login
function skipLogin(nextState, replace) {
    if (typeof window !== "undefined") {
        if (loggedIn()) {
            replace({
                pathname: '/'
            })
        }
    }
}

module.exports = {
    clientLogout: logout,
    checkAuth: checkAuth,
    skipLogin: skipLogin
}