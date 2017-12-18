'use strict';

/*********************************************
 * server side error logging
 * will track all errors from api
 * **************************************** */

import { error as log } from '../../../config/logging';

module.exports = (err, req, res, next) => {
    log({
        headers: req.headers,
        body: req.body,
        userInfo: req.authInfo,
        error: err.stack
    });
    next(err);
}