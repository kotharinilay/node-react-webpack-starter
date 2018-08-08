'use strict';

/***************************************
 * handle requests for report and serve
 * the data for requested report based on 
 * parameters
 * ************************************/

import standardReport from '../../business/private/standardreport';

export default function (router) {

    router.get('/getreportdata', function (req, res, next) {
        let params = req.query;
        if (params.name == null || params.name == undefined || params.name == '' || params.name == "null") {
            throw new Error("Must provide valid reportname");
        }

        let { contactId, language } = req.authInfo;
        return standardReport(params, contactId, language).then(function (response) {
            return res.status(response.status).send(response.response);
        }).catch(function (err) {
            next(err);
        });
    });
}