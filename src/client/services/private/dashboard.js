'use strict';

/*************************************
 * consists API calls for Dashboard
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// get list of widgets per user preference
function getPreferredWidgets(getAllwidgets = false) {
    return get('/getpreferredwidgets?getAllwidgets=' + getAllwidgets).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// update dashboard preference per user
function updatePreferredWidgets(widgets) {
    return post('/updatepreferredwidgets', { widgets: widgets }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getPreferredWidgets: getPreferredWidgets,
    updatePreferredWidgets: updatePreferredWidgets
}