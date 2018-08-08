'use strict';

/***********************************
 * Logic related to footer api
 * *********************************/

import Promise from 'bluebird';
import { isEmpty, map } from 'lodash';
import { getContactByEmail, getContactById } from '../../repository/contact';
import {
    getAllNotifications, removeNotificationsById,
    markNotificationAsRead
} from '../../repository/contactnotificationreceiver';
import { sendEmail } from '../../lib/mailer';
import { uuidToBuffer } from '../../../shared/uuid';
import { isEmail } from '../../../shared/format/string';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';
import CompileTemplate from '../../lib/compile-template';
import { localToUTC, formatDateTime } from '../../../shared/format/date';
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
            let body = CompileTemplate("email/feedback.html", data);
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

// get all notification per receiver
let getContactNotifications = (contactId, searchValue, fromDate, toDate) => {

    let condition = { ReceiverId: uuidToBuffer(contactId) };

    if (!isEmpty(searchValue)) {
        let value = '%' + searchValue + '%';
        condition.$or = [
            { Subject: { $like: value } },
            { TagLine: { $like: value } },
            { Body: { $like: value } }
        ];
    }

    if (!isEmpty(fromDate) && !isEmpty(toDate)) {

        toDate = new Date(toDate);
        toDate.setMinutes(toDate.getMinutes() + 1);
        condition.ReceivedDateTime = {
            $gte: fromDate,
            $lte: toDate
        };
    }
    else if (!isEmpty(fromDate)) {
        condition.ReceivedDateTime = { $gte: fromDate };
    }
    else if (!isEmpty(toDate)) {

        toDate = new Date(toDate);
        toDate.setMinutes(toDate.getMinutes() + 1);
        condition.ReceivedDateTime = { $lte: toDate };
    }

    return getAllNotifications(condition).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete notification by list of ids
let removeNotifications = (ids) => {
    let binIds = map(ids, function (f) {
        return uuidToBuffer(f);
    });
    return removeNotificationsById({
        Id: binIds
    }).then(function () {
        return getResponse(HttpStatus.SUCCESS);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let notificationMarkAsRead = (id) => {
    let condition = {
        Id: uuidToBuffer(id)
    }
    let updateObj = {
        MarkAsRead: 1
    }
    return markNotificationAsRead(updateObj, condition).then(function () {
        return getResponse(HttpStatus.SUCCESS);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    sendFeedback: Promise.method(sendFeedback),
    getFooterContact: Promise.method(getFooterContact),
    getContactNotifications: Promise.method(getContactNotifications),
    removeNotifications: Promise.method(removeNotifications),
    markNotificationAsRead: Promise.method(notificationMarkAsRead)
}