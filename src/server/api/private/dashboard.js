'use strict';

/*****************************************
 * APIs related to dashboard functionality such as
 * Retrieving widgets, Configuring settings
 * ***************************************** */

import { getPreferredWidgets, updatePreferredWidgets } from '../../business/private/dashboard';
import cache from '../../lib/cache-manager';

export default function (router) {

    // get list of widgets as per user preference
    router.get('/getpreferredwidgets', function (req, res, next) {
        let getAllwidgets = req.query.getAllwidgets == 'true';
        let contactId = req.authInfo.contactId;
  
        return getPreferredWidgets(getAllwidgets, contactId).then(function (result) {                        
            return res.status(result.status).send(result.response);
            callback(null, result);
        }).catch(function (err) {
            next(err);
        });
    });

    // update dashboard widget preference per user
    router.post('/updatepreferredwidgets', function (req, res, next) {

        let { widgets } = req.body;
        let contactId = req.authInfo.contactId;

        updatePreferredWidgets(widgets, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}