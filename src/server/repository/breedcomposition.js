'use strict';

/*************************************
 * database interaction methods related to 
 * 'breedcomposition' table
 * *************************************/

import models from '../schema';
import { uuidToBuffer } from '../../shared/uuid';

// create multiple breed composition record to DB
let bulkCreateBreedComposition = (queryStr, trans = null) => {
    return models.sequelize.query(queryStr, { transaction: trans }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// get breed composition record by query
let getByLivestockId = (livestockId) => {
    return models.sequelize.query(`select * from breedcomposition where LivestockId = fn_UuidToBin('${livestockId}')`).then(function (result) {
        let response = JSON.parse(JSON.stringify(result[0]));
        return response;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    bulkCreateBreedComposition: bulkCreateBreedComposition,
    getBreedComposition: getByLivestockId
}