'use strict';

import { findCompany } from '../../business/private/company';
import { findProperty } from '../../business/private/property';

export default function (router) {
    router.post('/company/find', function (req, res, next) {
        return findCompany(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/property/find', function (req, res, next) {
        return findProperty(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}