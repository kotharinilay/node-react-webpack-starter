'use strict';

/***********************************
 * Logic related to footer api
 * *********************************/

import Promise from 'bluebird';
import { getContactByEmail, getContactById } from '../../repository/contact';
import { sendEmail } from '../../lib/mailer';
import { isEmail } from '../../../shared/format/string';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import CompileTemplate from '../../lib/compile-template';
var moment = require('moment');

// send user feedback to site administrator
let sendFeedback = (email, feedback) => {
    if (!isEmail(email) || !feedback) {
        return getResponse(400, resMessages.invalidInput);
    }
    return getContactByEmail(email).then(function (response) {
        if (!response) {
            return getResponse(401, resMessages.unauthorized);
        }
        else {
            let data = { firstName: response.FirstName, lastName: response.LastName, feedback };
            let body = CompileTemplate("assets/templates/feedback.html", data);
            let subject = response.FirstName + " " + response.LastName + "'s Feedback";

            return sendEmail(response.Email, process.env.ADMIN_EMAIL, subject, body).then(function (res) {
                return res;
            });
        }
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch contact details
let getFooterContact = (contactId) => {
    return getContactById(contactId).then(function (response) {
        if (!response) {
            return getResponse(401, resMessages.unauthorized);
        }
        else {
            let obj = {
                UserName: response.UserName,
                Email: response.Email
            }
            return getResponse(200, null, { contact: obj });
        }
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    sendFeedback: Promise.method(sendFeedback),
    getFooterContact: Promise.method(getFooterContact)
}