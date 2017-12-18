'use strict';

/*************************************
 * test cases related to index file
 * *************************************/

var {data, should, expect} = require('../../lib/server');
var {newUUID, uuidToBuffer, bufferToUUID} = require('../../../../shared/uuid');
var {isUUID} = require('../../../../shared/format/string');

let uuid = "";
let bufferVal = "";

describe('generate new Guid/UUID and convert Buffer to UUID, UUID to Buffer', function () {

    it('should generate uuid', function (done) {
        uuid = newUUID();
        let res = isUUID(uuid);
        expect(res).to.be.true;
        done();
    });

    it('should convert uuid to buffer', function (done) {
        bufferVal = uuidToBuffer(uuid);
        done();
    });

    it('should convert buffer to uuid', function (done) {
        uuid = bufferToUUID(bufferVal, false);
        let res = isUUID(uuid);
        expect(res).to.be.true;
        done();
    });

});