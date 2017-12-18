'use strict';

/*************************************
 * token related functions
 * *************************************/

import { isEmpty } from 'lodash';
import { createCookie, deleteCookie, getCookie, COOKIE } from '../../../shared/cookie';

module.exports = {
    loggedIn: loggedIn,
    logout: logout,
    setToken: setToken,
    getRememberMe: getRememberMe,
    getToken: getToken
}

function logout() {
    // Clear user token and profile data from localStorage
    deleteCookie(COOKIE.ID_TOKEN, '/');
    deleteCookie(COOKIE.REMEMBER_ME, '/');
}

function loggedIn() {
    // Checks if there is a saved token and it's still valid    
    const token = getToken();
    return !isEmpty(token);
}

function setToken(idToken, rememberMe) {
    // Saves user token and rememberMe to cookie
    createCookie(COOKIE.ID_TOKEN, idToken, null, '/');
    createCookie(COOKIE.REMEMBER_ME, rememberMe, null, '/');
}

function getToken() {
    // Retrieves the user token from localStorage
    return getCookie(COOKIE.ID_TOKEN);
}

function getRememberMe() {
    return getCookie(COOKIE.REMEMBER_ME);
}