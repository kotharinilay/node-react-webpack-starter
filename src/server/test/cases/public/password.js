'use strict';

/*************************************
 * Forgot password test cases
 * *************************************/

var { should, expect, config, data } = require('../../lib/server');
var { sendForgotPasswordEmail, contactUsernameExist, resetKeyisValid, resetPassword } = require('../../../business/public/password');
var { insertContact, removeContact } = require('../../lib/mockdata');
let contactObj = {};
let newPassword = data.contactData.newPassword;
let dummyEmail = data.contactData.dummyEmail;
let invalidEmail = data.contactData.invalidEmail;

describe('reset forgot password', function () {

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


    it('should send email to user along with reset password key', function (done) {
        if (config.SEND_EMAIL) {
            sendForgotPasswordEmail(contactObj.Email).then(function (res) {
                res.should.have.status(200);
                done();
            });
        }
        else {
            done();
        }
    });

    it('validates - email address is invalid', function (done) {
        sendForgotPasswordEmail(invalidEmail).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - contact details not found to send email', function (done) {
        sendForgotPasswordEmail(dummyEmail).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });


    it('should have existing contact email', function (done) {
        contactUsernameExist(contactObj.Email).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('validates - email address is invalid', function (done) {
        contactUsernameExist(invalidEmail).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - email address is not exist', function (done) {
        contactUsernameExist(dummyEmail).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });


    it('should have valid reset password key', function (done) {
        resetKeyisValid(data.resetPasswordKey).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('should have expired reset password key', function (done) {
        resetKeyisValid(data.resetPassExpiredKey).then(function (res) {
            res.should.have.status(200);
            expect(res.response.expired).to.be.true;
            done();
        });
    });

    it('validates - reset password key is invalid', function (done) {
        resetKeyisValid(data.resetPasswordKey + "123").then(function (res) {
            res.should.have.status(400);
            done();
        });
    });


    it('should reset forgot password', function (done) {
        resetPassword(contactObj.UUID, newPassword).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('validates - password must be at least 8 characters', function (done) {
        resetPassword(contactObj.UUID, data.contactData.dummyPassword).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - user details not found', function (done) {
        resetPassword(contactObj.UUID + '123', newPassword).then(function (res) {
            res.should.have.status(401);
            done();
        });
    });

    it('validates - password must be different from email address', function (done) {
        resetPassword(contactObj.UUID, contactObj.Email).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - new password should not be same as existing password', function (done) {
        resetPassword(contactObj.UUID, newPassword).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

});