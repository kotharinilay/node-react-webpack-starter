'use strict';

/*************************************
 * Forgot password related 
 * public api logic comes here...
 * *************************************/

import Promise from 'bluebird';
import { isEmpty } from 'lodash';
var crypto = require('crypto');
import { encrypt, decrypt } from '../../../shared';
import { currentDateTime } from '../../../shared/format/date';
import { isEmail } from '../../../shared/format/string';
import { sendEmail } from '../../lib/mailer';
import CompileTemplate from '../../lib/compile-template';

import { encryptPassword } from '../../auth/password-auth';
import { getContactByEmail, getContactById, getContactByUserName } from '../../repository/contact';
import { updateContact } from '../../business/private/common';

import { getResponse, resMessages } from '../../lib/index';

// Send forgot password email to user
function sendForgotPasswordEmail(email) {

    if (!isEmail(email)) {
        return getResponse(400, resMessages.invalidInput);
    }

    return getContactByUserName(email).then(function (response) {
        if (!response) {
            return getResponse(400, 'EMAIL_NOT_REG_MESSAGE');
        }
        else {
            let encryptKey = encrypt(response.UUID + "|" + currentDateTime().DateTimeMoment.add(1, 'hours').utc().valueOf());
            let data = {
                link: process.env.SITE_URL + "/resetpassword/" + encryptKey,
                name: response.FirstName + " " + response.LastName
            };
            let body = CompileTemplate("email/setnewpassword.html", data);
            return sendEmail(process.env.NO_REPLY_EMAIL, email, 'Aglive - Password Reset', body).then(function (res) {
                return res;
            });
        }
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// Check contact email exist
function contactUsernameExist(email) {

    if (!isEmail(email)) {
        return getResponse(400, resMessages.invalidInput);
    }

    return getContactByUserName(email).then(function (res) {
        if (!res) {
            return getResponse(400, 'EMAIL_NOT_REG_MESSAGE');
        }
        else {
            return getResponse();
        }
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// Check reset key for reset password
function resetKeyisValid(key) {
    try {
        let decryptedKey = decrypt(key);
        if (!decryptedKey) {
            return getResponse(400, 'INVALID_URL');
        }

        let keyDt = decryptedKey.split('|')[1];
        let currentDt = currentDateTime().ValueOf;
        let isExpired = currentDt > keyDt;
        let userId = decryptedKey.split('|')[0];
        return getResponse(200, null, { expired: isExpired, id: userId });
    }
    catch (err) {
        return getResponse(500, err.toString());
    }
}

// Reset password
function resetPassword(userId, password) {
    if (password.length < 8) {
        return getResponse(400, 'CONTROLS.MUST_CHAR_REQ_MESSAGE');
    }

    return getContactById(userId).then(function (user) {
        if (!user) {
            return getResponse(401, resMessages.unauthorized);
        }

        if (user.Email == password) {
            return getResponse(400, 'ERROR_PASS_IS_EMAIL');
        }

        let updateContactObj;
        if (!isEmpty(user.PasswordSalt)) {
            let passHash = encryptPassword(user.PasswordSalt, password);
            if (user.PasswordHash == passHash) {
                return getResponse(400, 'NEW_OLD_PASSWORDS_SAME');
            }

            updateContactObj = {
                PasswordHash: passHash
            }
        }
        else {
            let salt = crypto.randomBytes(32).toString('hex');
            updateContactObj = {
                PasswordSalt: salt,
                PasswordHash: encryptPassword(salt, password)
            }
        }

        let condition = {
            UUID: userId
        }
        return updateContact(updateContactObj, condition).then(function (rr) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    contactUsernameExist: Promise.method(contactUsernameExist),
    sendForgotPasswordEmail: Promise.method(sendForgotPasswordEmail),
    resetKeyisValid: Promise.method(resetKeyisValid),
    resetPassword: Promise.method(resetPassword)
}