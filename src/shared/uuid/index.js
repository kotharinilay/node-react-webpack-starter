'use strict';

/**********************************
 * To generate new Guid/UUID, 
 * Buffer to UUID, UUID to Buffer and 
 * Compare two buffer values
 * ******************************* */

var uid = require('./v1');
import { isUUID } from '../format/string';

// Generate new id
function newUUID() {
    return uid();
}

// Convert buffer to UUID
function bufferToUUID(buff) {
    if (!buff)
        return null;
    buff = new Buffer(buff);
    var _hex = Buffer.prototype.toString.call(buff, 'hex');
    return _hex.slice(8, 16) + '-' + _hex.slice(4, 8) + '-' + _hex.slice(0, 4) + '-' + _hex.slice(16, 20) + '-' + _hex.slice(20);
    //return _hex.slice(5, 4) + '-' + _hex.slice(3, 2) + '-' + _hex.slice(1, 2) + '-' + _hex.slice(9, 2) + '-' + _hex.slice(11);
}

// Convert UUID to buffer
function uuidToBuffer(uuid) {
    if (!uuid)
        return null;
    if (typeof uuid != 'string')
        return new Buffer(uuid);
    return new Buffer(uuid.substr(14, 4) + uuid.substr(9, 4) + uuid.substr(0, 8) + uuid.substr(19, 4) + uuid.substr(24), 'hex');
    //return new Buffer(uuid.substr(15, 4) + uuid.substr(10, 4) + uuid.substr(1, 8) + uuid.substr(20, 4) + uuid.substr(25), 'hex');
}

// Check input string is buffer or UUID
function idToBuffer(id) {
    if (isUUID(id))
        return uuidToBuffer(id)
    else
        return new Buffer(id);
}

/* Compare two buffer values 
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
}*/

module.exports = { newUUID, bufferToUUID, uuidToBuffer, idToBuffer }