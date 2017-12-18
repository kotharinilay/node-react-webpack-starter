'use strict';

/*************************************
 * footer services
 * *************************************/

import { get, post } from '../../lib/http/http-service';
import { isEmpty } from 'lodash';

// send feedback to admin from contact us popup (footer area)
function sendFeedbackEmail(email, feedback) {
    return post('/sendfeedbackemail', { email: email, feedback: feedback }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get contact details for contact us popup (footer area)
function footerContact() {
    return get('/footercontact').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get notifications per logged in user
function getContactNotifications(obj) {

    let url = '/notifications/getbyreceiver';
    let data = {};
    if (obj != null) {
        data.searchValue = obj.SearchValue;
        data.fromDate = obj.ReceivedFromDate;
        data.toDate = obj.ReceivedToDate;
    }

    return get(url, data).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function removeNotifications(obj) {
    let url = '/notifications/remove';
    return post(url, obj).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function markNotificationAsRead(id) {
    let url = '/notifications/markasread';
    return post(url, { id: id }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    sendFeedbackEmail: sendFeedbackEmail,
    footerContact: footerContact,
    getContactNotifications: getContactNotifications,
    removeNotifications: removeNotifications,
    markNotificationAsRead: markNotificationAsRead
}