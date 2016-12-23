'use strict';

/**********************************
 * To generate new Guid/UUID, 
 * Buffer to UUID, UUID to Buffer and 
 * Compare two buffer values
 * ******************************* */

var uid = require('./v1');

// Generate new id
function newUUID() {
    return uid();
}

// Convert buffer to UUID
function bufferToUUID(buff) {
    var _hex = Buffer.prototype.toString.call(buff, 'hex');
    return _hex.slice(8, 16) + '-' + _hex.slice(4, 8) + '-' + _hex.slice(0, 4) + '-' + _hex.slice(16, 20) + '-' + _hex.slice(20);
}

// Convert UUID to buffer
function uuidToBuffer(uuid) {
    return new Buffer(uuid.substr(14, 4) + uuid.substr(9, 4) + uuid.substr(0, 8) + uuid.substr(19, 4) + uuid.substr(24), 'hex');
}

/* Compare two buffer values
console.log(Buffer.compare(buf1,buf2));
console.log(buf1.compare(buf2)); */
function areBuffersEqual(bufA, bufB) {
    var len = bufA.length;
    if (len !== bufB.length) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        if (bufA.readUInt8(i) !== bufB.readUInt8(i)) {
            return false;
        }
    }
    return true;
}

module.exports = { newUUID, bufferToUUID, uuidToBuffer }