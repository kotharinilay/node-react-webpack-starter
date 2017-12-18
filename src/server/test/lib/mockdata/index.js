'use strict';

/*************************************
 * initial temporary data generator  
 * *************************************/

import Promise from 'bluebird';
import models from '../../../schema';

var crypto = require('crypto');
var data = require('./data.json');
var contact = require('../../../repository/contact');
var token = require('../../../repository/token');
var {newUUID, uuidToBuffer} = require('../../../../shared/uuid');
var {encryptPassword} = require('../../../auth/password-auth');


function insertContact() {
    try {
        let obj = data.contactData;
        var contactid = newUUID();
        var salt = crypto.randomBytes(32).toString('hex');
        var contactObj = {
            Id: uuidToBuffer(contactid),
            FirstName: obj.firstname,
            LastName: obj.lastname,
            Email: obj.email,
            UserName: obj.username,
            PasswordSalt: salt,
            PasswordHash: encryptPassword(salt, obj.password),
            UUID: contactid
        }

        return contact.create(contactObj).then(function (res, err) {
            if (err) {
                //console.log("Error occured while creating contact : " + err);
                return null;
            }
            else {                
                //console.log("Contact created with email : " + contactObj.Email + " and password : " + obj.password);
                return contactObj;
            }
        });
    }
    catch (err) {
        //console.log(err);
        return null;
    }
}

function removeContact(contactId) {
    try {

        let tokenCondition = {
            ContactId: contactId
        }
        let contactCondition = {
            UUID: contactId
        }

        return models.sequelize.transaction(function (t) {
            return Promise.all([
                token.removeToken(tokenCondition, t),
                contact.removeContact(contactCondition, t)
            ]);
        }).then(function (res) {
            return true;
        }).catch(function (err) {
            return false;
        });

    }
    catch (err) {
        return false;
    }
}

module.exports = {
    insertContact: Promise.method(insertContact),
    removeContact: Promise.method(removeContact)
}