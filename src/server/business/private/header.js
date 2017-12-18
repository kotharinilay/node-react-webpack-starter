'use strict';

/***********************************
 * Logic related to header api
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';
import { removeToken, getTokenByContactId } from '../../repository/token';
import { encryptPassword, checkPassword } from '../../auth/password-auth';
import { updateContact, getContactByCondition } from '../../repository/contact';
import { getResponse, resMessages } from '../../lib/index';
import { removeArray } from '../../lib/cache-manager';
import { map as _map, filter as _filter } from 'lodash';

// remove token from database table
let logout = (token) => {
    let condition = {
        Token: token
    }
    return removeToken(condition).then(function (response) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// perform change password
let changePassword = (contactId, token, existingPassword, newPassword) => {

    if (newPassword.length < 8) {
        return getResponse(400, 'MUST_CHAR_REQ_MESSAGE');
    }
    if (existingPassword == newPassword) {
        return getResponse(400, 'NEW_OLD_PASSWORDS_SAME');
    }

    return getContactByCondition({ Id: contactId }).then(function (contact) {
        if (!contact) {
            return getResponse(401, resMessages.unauthorized);
        }
        if (contact.Email == newPassword) {
            return getResponse(400, 'ERROR_PASS_IS_EMAIL');
        }
        if (!checkPassword(existingPassword, contact.PasswordSalt, contact.PasswordHash)) {
            return getResponse(400, 'EXISTING_PASSWORD_NOT_MATCH');
        }

        let contactObj = {
            PasswordHash: encryptPassword(contact.PasswordSalt, newPassword)
        }
        let condition = {
            Id: contactId
        }

        return models.sequelize.transaction(function (t) {
            return updateContact(contactObj, condition, t).then(function (rr) {

                // remove all the token except current one 
                // for respective contact
                condition = {
                    ContactId: contactId,
                    Token: {
                        $ne: token
                    }
                };

                return getTokenByContactId(contactId).then(function (data) {
                    let filtered = _filter(data, function (f) {
                        return f.Token != token;
                    });
                    if (filtered.length > 0) {
                        let tokens = _map(filtered, 'Token');
                        removeArray(tokens);
                    }
                    return removeToken(condition, t);
                });
            }).then(function () {
                return getResponse(200);
            }).catch(function (err) {
                return getResponse(500, err.toString());
            });
        });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    logout: Promise.method(logout),
    changePassword: Promise.method(changePassword)
}