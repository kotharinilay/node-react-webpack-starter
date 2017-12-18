'use strict';

/*************************************
 * Header test cases
 * *************************************/

var {should, data} = require('../../lib/server');
var {changePassword, logout} = require('../../../business/private/header');
var {insertContact, removeContact} = require('../../lib/mockdata');
let contactObj = {};
let contactPassword = data.contactData.password;
let newPassword = data.contactData.newPassword;
let dummyPassword = data.contactData.dummyPassword;

describe('perform app logout and change password from header area', function () {

    before(function (done) {
        insertContact().then(function (res) {
            res.should.not.be.null;
            contactObj = res;
            done();
        });
    });

    after(function (done) {
        removeContact(contactObj.UUID).then(function (res) {
            res.should.not.be.null;
            done();
        });
    });

    it('should application logout', function (done) {
        logout(data.token).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('validates - password must be at least 8 characters', function (done) {
        changePassword(contactObj.UUID, contactPassword, dummyPassword).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - user details not found', function (done) {
        changePassword(data.contactData.dummyEmail, contactPassword, newPassword).then(function (res) {
            res.should.have.status(401);
            done();
        });
    });

    it('validates - existing password not match', function (done) {
        changePassword(contactObj.UUID, dummyPassword, newPassword).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - password must be different from email address', function (done) {
        changePassword(contactObj.UUID, contactPassword, contactObj.Email).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - new password should not be same as existing password', function (done) {
        changePassword(contactObj.UUID, contactPassword, contactPassword).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('should change app login password', function (done) {
        changePassword(contactObj.UUID, contactPassword, newPassword).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

});