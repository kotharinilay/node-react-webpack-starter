'use strict';

/**************************************
 * APIs for user setup menu
 ************************************/

import { getCompanySpecies, saveCompanySpecies } from '../../business/private/usersetup-species';

export default function (router) {

    // retrieve all company species
    router.get('/companyspecies/getall', function (req, res, next) {
        let { language, companyId, isSuperUser } = req.authInfo;
        return getCompanySpecies(language, companyId, isSuperUser).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // create or update company species
    router.post('/companyspecies/save', function (req, res, next) {
        let { obj } = req.body;
        let { contactId, companyId, isSuperUser } = req.authInfo;
        return saveCompanySpecies(obj, contactId, companyId, isSuperUser).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}
