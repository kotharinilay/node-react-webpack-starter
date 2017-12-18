'use strict';

/*************************************
 * database interaction methods related to 
 * 'Contact' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';
import { map } from 'lodash';
import { isUUID } from '../../shared/format/string';
import { userRole } from '../../shared/index';
import cache from '../lib/cache-manager';

// create contact record to DB
let create = (obj, trans = null) => {
    return models.contact.create(obj, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let getContactDataSet = (pageSize, skipRec, sortOrder = 'asc', sortColumn = 'Name', searchText, filterObj, language) => {
    let searchQuery = '';
    if (searchText) {
        searchQuery = ` AND (c.FirstName LIKE '${searchText}' OR c.LastName LIKE '${searchText}' OR
                             c.Email like '${searchText}' OR c.Mobile like '${searchText}')`;
    }

    let baseQuery =
        `SELECT SQL_CALC_FOUND_ROWS c.Id, CONCAT(c.FirstName, ' ', c.LastName) AS Name, c.Email,
        c.Mobile, c.Address
        FROM contact c
        WHERE c.IsDeleted = 0 ${searchQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ${skipRec},${pageSize};
        SELECT FOUND_ROWS() AS Total; `;

    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
            total: resultData[1][0].Total
        }
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get user details
let getUserDetails = (id, language) => {
    let baseQuery = `
    SELECT con.Id, con.FirstName, con.LastName, con.Mobile, con.Email, con.Address, con.AvatarField
    FROM contact con
    WHERE con.IsDeleted = 0  AND con.Id = '${id}'`;
    return models.sequelize.query(baseQuery).then(function (result) {
        let resultData = JSON.parse(JSON.stringify(result[0]));
        let response = {
            data: resultData[0],
        }
        return resultData;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get contact record by specific condition
let getByCondition = (condition) => {
    return models.contact.find({ raw: true, where: condition }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// update contact record to DB
let update = (obj, condition, trans = null) => {
    let updateRes = null;
    let contactRes = null;
    console.log(obj);
    return models.contact.update(obj, { where: condition, transaction: trans }).then(function (result) {
        updateRes = result;
        console.log('XXX');
        return models.contact.find({ raw: true, attributes: ['Id'], where: condition });
    }).then(function (result) {
        contactRes = result;
        console.log('YYY');
        return models.token.findAll({ raw: true, attributes: ['Token'], where: { ContactId: contactRes.Id } });
    }).then(function (result) {
        let cachePromise = [];
        console.log('ZZZ');
        map(result, r => {
            let token = r.Token;
            cachePromise.push(cache.getAsync(token).then(function (cacheRes) {
                if (cacheRes) {
                    cache.setString(token, JSON.stringify({
                        ContactId: contactRes.Id
                    }));
                }
            }));
        });
        return Promise.all(cachePromise);
    }).then(function (result) {
        return updateRes;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// delete contact record to DB
let remove = (condition, trans = null) => {
    return models.contact.destroy({ raw: true, where: condition, transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getContactByCondition: getByCondition,
    getUserDetails: getUserDetails,
    getContactDataSet: getContactDataSet,
    createContact: create,
    updateContact: update,
    removeContact: remove
}