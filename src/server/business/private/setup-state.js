'use strict';

/***********************************
 * State
 * *********************************/

import Promise from 'bluebird';
import { getState } from '../../repository/state';
import { getResponse } from '../../lib/index';

// get all states
let getAll = (language) => {
    return getState(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllState: Promise.method(getAll)
}