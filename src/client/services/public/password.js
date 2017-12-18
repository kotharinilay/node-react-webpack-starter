'use strict';

/*************************************
 * forgot password related 
 * public services comes here...
 * *************************************/

import { post } from '../../lib/http/http-service';

// check contact email exist
function contactUsernameExist(email) {
    return post('/contactusernameexist', { email: email }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// api to send email for reset password 
function forgotPassword(email) {
    return post('/forgotpassword', { email: email }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// api to check reset password key
function resetKeyIsValid(key) {
    return post('/resetkeyisvalid', { key: key }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// reset password from forgot password page
function resetPassword(userId, password) {
    return post('/resetpassword', { userId: userId, password: password }, null, true).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    contactUsernameExist: contactUsernameExist,
    forgotPassword: forgotPassword,
    resetKeyIsValid: resetKeyIsValid,
    resetPassword: resetPassword
}