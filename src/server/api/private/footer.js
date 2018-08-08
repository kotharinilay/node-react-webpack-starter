'use strict';

/***********************************
 * apis related to footer services
 * like sendfeedback
 * *********************************/

import {
    sendFeedback, getFooterContact, getContactNotifications, removeNotifications,
    markNotificationAsRead
} from '../../business/private/footer';

export default function (router) {

    // send feedback email to admin
    router.post('/sendfeedbackemail', function (req, res, next) {
        let { email, feedback } = req.body;
        return sendFeedback(email, feedback).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get contact details by email
    router.get('/footercontact', function (req, res, next) {
        return getFooterContact(req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get notification per logged in user
    router.get('/notifications/getbyreceiver', function (req, res, next) {
        let { searchValue, fromDate, toDate } = req.query;
        return getContactNotifications(req.authInfo.contactId, searchValue, fromDate, toDate).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // remove notification by ids
    router.post('/notifications/remove', function (req, res, next) {
        return removeNotifications(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // remove notification by ids
    router.post('/notifications/markasread', function (req, res, next) {
        return markNotificationAsRead(req.body.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}
