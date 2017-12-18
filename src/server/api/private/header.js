'use strict';

/***********************************
 * apis related to login, forgot password
 * change password, logout
 * *********************************/

import { logout, changePassword } from '../../business/private/header';

export default function (router) {

    // Perform application logout
    router.post('/logout', function (req, res, next) {
        return logout(req.cookies.id_token).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // Change password from header area
    router.post('/changepassword', function (req, res, next) {
        let { existingPassword, newPassword } = req.body;
        let { contactId, token } = req.authInfo;        
        return changePassword(contactId, token, existingPassword, newPassword).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}