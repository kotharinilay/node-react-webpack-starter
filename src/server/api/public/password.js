'use strict';

/***********************************
 * apis related to forgot password
 * *********************************/

import Promise from 'bluebird';

import {
    contactUsernameExist,
    sendForgotPasswordEmail,
    resetKeyisValid,
    resetPassword
} from '../../business/public/password';

export default function (router) {

    // Check contact email exist
    router.post('/contactusernameexist', function (req, res, next) {
        return contactUsernameExist(req.body.email).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // Send email for forgot password request
    router.post('/forgotpassword', function (req, res, next) {
        return sendForgotPasswordEmail(req.body.email).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // Check reset key for reset password
    router.post('/resetkeyisvalid', function (req, res, next) {
        return resetKeyisValid(req.body.key).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // Reset password
    router.post('/resetpassword', function (req, res, next) {
        let { userId, password } = req.body;
        return resetPassword(userId, password).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}
