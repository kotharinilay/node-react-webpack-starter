'use strict';

/*************************************
 * user setup services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// get all company species records
function getCompanySpecies() {
    return get('/companyspecies/getall').then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save all company species records
function saveCompanySpecies(obj) {
    return post('/companyspecies/save', { obj: obj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getCompanySpecies: getCompanySpecies,
    saveCompanySpecies: saveCompanySpecies
}