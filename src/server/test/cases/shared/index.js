'use strict';

/*************************************
 * test cases related to index file
 * *************************************/

var {data, expect} = require('../../lib/server');
var {getAppVersion, checkPasswordStrength, encrypt, decrypt} = require('../../../../shared/index');

let passData = data.passwordStrength;
let encryptedData = "";
let decryptedData = data.emailData.message;

describe('perform test cases on common shared functions', function () {

    it('should get app version from package json', function (done) {
        getAppVersion();
        done();
    });


    it('expect -1 value for empty password', function (done) {
        var res = checkPasswordStrength('');
        expect(res).to.equal(-1);
        done();
    });

    it('expect weak password strength for ' + passData.Weak, function (done) {
        var res = checkPasswordStrength(passData.Weak);
        expect(res).to.equal(0);
        done();
    });

    it('expect good password strength for ' + passData.Good, function (done) {
        var res = checkPasswordStrength(passData.Good);
        expect(res).to.equal(1);
        done();
    });

    it('expect strong password strength for ' + passData.Strong, function (done) {
        var res = checkPasswordStrength(passData.Strong);
        expect(res).to.equal(2);
        done();
    });

    it('expect great password strength for ' + passData.Great, function (done) {
        var res = checkPasswordStrength(passData.Great);
        expect(res).to.equal(3);
        done();
    });


    it('expect valid encrypted data', function (done) {
        var res = encrypt(decryptedData);
        encryptedData = res;
        expect(res).to.not.be.false;
        done();
    });

    it('encrypted data is invalid', function (done) {
        var res = encrypt();
        expect(res).to.be.false;
        done();
    });


    it('expect valid decrypted data', function (done) {
        var res = decrypt(encryptedData);
        expect(res).to.not.be.false;
        done();
    });

    it('decrypted data is invalid', function (done) {
        var res = decrypt(decryptedData);
        expect(res).to.be.false;
        done();
    });

});