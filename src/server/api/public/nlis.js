'use strict';

/*************************************
 * aglive api to communication with
 * nlis government services
 * **********************************/

import { validateCredential, picErpStatus, submitConsignmentToNlis } from '../../lib/nlis/index';

export default function (router) {

    // validate nlis username and password
    router.post('/nlis/validatecredentials', function (req, res, next) {
        let { username, password } = req.body;
        return validateCredential(username, password).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve erp status of pic
    router.post('/nlis/picerpstatus', function (req, res, next) {
        let { username, password, pic } = req.body;
        return picErpStatus(username, password, pic).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // call api to submit consignment to NLIS
    router.post('/nlis/submitconsignmenttonlis', function (req, res, next) {
        let { nvdId, propertyId, contactId, language } = req.body;
        return submitConsignmentToNlis(nvdId, propertyId, contactId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}