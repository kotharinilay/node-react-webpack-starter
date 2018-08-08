'use strict';

/***************************************
 * handle requests for links in email
 * to download report PDF
 * ************************************/

import standardReport from '../../business/private/standardreport';
import { decrypt } from '../../../shared';

export default function (router) {

    router.get('/downloadreport', function (req, res, next) {
        let params = req.query;
        let drcParams = decrypt(params[0]).split('&');
        let args = {
            name: drcParams[0].split('=')[1],
            id: drcParams[1].split('=')[1],
            contactId: drcParams[2].split('=')[1] || '',
            language: 'en',
        }

        if (args.name == null || args.name == undefined || args.name == '' || args.name == "null") {
            throw new Error("Must provide valid reportname");
        }
        if (args.id == null || args.id == undefined || args.id == '' || args.id == "null") {
            throw new Error("Must provide valid Id");
        }
        return standardReport(args, args.contactId, args.language).then(function (response) {
            response.response.type = drcParams[4].split('=')[1];
            return res.status(response.status).send(response.response);
        }).catch(function (err) {
            next(err);
        });
    });
}