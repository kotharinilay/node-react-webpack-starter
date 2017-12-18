'use strict';

/*************************************
 * header services
 * *************************************/

import { get, post } from '../../lib/http/http-service';
import { getCookie } from '../../../shared/cookie';

// logout from app
function logout() {
    return post('/logout').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// change user password
function changePassword(existingPassword, newPassword) {
    return post('/changepassword', { existingPassword: existingPassword, newPassword: newPassword }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    logout: logout,
    changePassword: changePassword
}