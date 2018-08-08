'use strict';

/***********************************
 * Logic related to setup species api
 * *********************************/

import Promise from 'bluebird';
import {
    getSpeciesBinding
} from '../repository/species';
import { getResponse, resMessages } from '../../lib/index';

// get all species
let getAll = (language) => {
    return getSpeciesBinding(language).then(function (response) {
        return getResponse(200, null, { data: response });
    });
}

module.exports = {
    getAllSpecies: Promise.method(getAll)
}