'use strict';

/*************************************
 * Database interaction methods related to 
 * ContactNotificationReceiver entity
 * *************************************/

import models from '../schema';
import sequelize from 'sequelize';

// fetch notification with criteria
let getAll = (condition) => {
    return models.view_contactnotification.findAll({
        raw: true,
        where: condition
    }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

// remove notification by ids
let removeByIds = (condition) => {
    return models.contactnotificationreceiver.destroy({ where: condition }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

let markAsRead = (obj, condition) => {
    return models.contactnotificationreceiver.update(obj, { where: condition }).then(function (result) {
        return result;
    }).catch(function (err) {
        throw new Error(err);
    });
}

module.exports = {
    getAllNotifications: getAll,
    removeNotificationsById: removeByIds,
    markNotificationAsRead: markAsRead
}