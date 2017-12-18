'use strict';

/**********************************
 * methods for password encryption
 * ******************************* */

import crypto from 'crypto';

// normal text to encrypted string
function encryptPassword(salt, password) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

// verify normal string is valid compare to encrypted string
function checkPassword(password, salt, hashedPassword) {
    return encryptPassword(salt, password) === hashedPassword;
}

module.exports = {
    encryptPassword: encryptPassword,
    checkPassword: checkPassword
}