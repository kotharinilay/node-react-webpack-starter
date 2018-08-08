'use strict';

/*************************************
 * database interaction methods related to 
 * 'country' table
 * *************************************/

import models from '../schema';

// get all suburb record for specific country [default AUS] for drop down
let getSuburb = (condition, countryId) => {
    return models.suburb.findAll({
        limit: 10,
        raw: true, where: condition,
        order: [
            ['Name', 'ASC']
        ],
        include: [{
            required: true,
            model: models.state,
            as: 'state',
            attributes: [],
            where: { IsDeleted: 0 },
            include: [{
                required: true,
                model: models.country,
                as: 'country',
                attributes: [],
                where: { IsDeleted: 0, UUID: countryId }
            }],
        }],
        attributes: [['UUID', 'Id'], ['Name', 'SuburbName']]
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getDetail = (id, language) => {
    return models.view_suburb_detail.find({
        raw: true, where: { Id: id, StateLanguage: language, CountryLanguage: language }
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// Get list of all suburb with state, postcode, country
let getAll = (condition) => {
    return models.view_suburb_detail.findAll({
        raw: true, where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getSuburb: getSuburb,
    getSuburbDetail: getDetail,
    getAllSuburb: getAll
}