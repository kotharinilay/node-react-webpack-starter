'use strict';

/***********************************
 * apis related to footer services
 * like sendfeedback
 * *********************************/

import { sendFeedback } from '../../business/private/footer';

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
}
