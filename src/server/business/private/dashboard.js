'use strict';

/*****************************************
 * Logic related to dashboard api
 * ***************************************** */

import Promise from 'bluebird';

import { map, filter, cloneDeep } from 'lodash';
import { getWidgetsById, updateWidgetsById } from '../../repository/contact';
import { getResponse, resMessages } from '../../lib/index';

var widgetList = require("../../json-data/widgets.json");

// Get list of all widgets with preferredwidgets
let getPreferredWidgets = (getAllwidgets, contactId) => {
    return getWidgetsById(contactId).then(function (response) {
        let preferredWidgets = response ? JSON.parse(response) : [];
        let widgets = getUserWidgets(preferredWidgets, getAllwidgets);
        let maxVal = getWidgetsMaxOrder(preferredWidgets);

        return getResponse(200, null, { widgets: widgets, maxOrder: maxVal });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// fetch list of all widgets with sort order and 
// user selected widgets value
let getUserWidgets = (preferredWidgets, getAllwidgets) => {
    try {
        let widgets = cloneDeep(widgetList);

        map(widgets, (d, index) => {
            if (preferredWidgets[d['Key']]) {
                d['Value'] = true;
                d['Order'] = preferredWidgets[d['Key']];
            } else {
                d['Value'] = false;
                d['Order'] = 0;
            }
        });

        if (!getAllwidgets)
            widgets = filter(widgets, (d, index) => { return d['Value']; });

        return widgets;
    }
    catch (err) { throw new Error(err); }
}

// fetch maximum sort order from user widgets
let getWidgetsMaxOrder = (preferredWidgets) => {
    try {
        let widgets = Object.keys(preferredWidgets).map(function (key) { return preferredWidgets[key]; });
        let maxVal = widgets.length > 0 ? Math.max.apply(null, widgets) : 0;
        return maxVal;
    }
    catch (err) {
        throw new Error(err);
    }
}

// update selected preference of widgets
let updatePreferredWidgets = (widgets, contactId) =>{
    return updateWidgetsById(widgets, contactId).then(function (response) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getPreferredWidgets: Promise.method(getPreferredWidgets),
    updatePreferredWidgets: Promise.method(updatePreferredWidgets)
}
