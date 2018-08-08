'use strict';

/*************************************
 * database interaction methods related to 
 * 'country' table
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';

// get all state record for drop down
let getState = (language) => {
    return models.view_state.findAll({
        raw: true,
        where: { Language: language },
        attributes: ['Id', ['StateName', 'State'],
            [sequelize.fn('concat', sequelize.col('StateName'), ' (', sequelize.col('StateCode'), ')'), 'StateName']]
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getState: getState
}