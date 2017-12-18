'use strict';

/*************************************
 * Footer test cases
 * *************************************/

var {should, data, config} = require('../../lib/server');
var {getFooterContact, generateBody, sendFeedback} = require('../../../business/private/footer');
var {insertContact, removeContact} = require('../../lib/mockdata');
let contactObj = {};
let feedback = data.emailData.message;

describe('get contact details and send feedback email from footer area', function () {

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

    it('should get the contact details', function (done) {
        getFooterContact(contactObj.UUID).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('validates - the contact details not found', function (done) {
        getFooterContact(contactObj.UUID + '123').then(function (res) {
            res.should.have.status(401);
            done();
        });
    });

    it('should simply send the feedback email to admin', function (done) {
        if (config.SEND_EMAIL) {
            sendFeedback(contactObj.Email, feedback).then(function (res) {
                res.should.have.status(200);
                done();
            });
        }
        else {
            done();
        }
    });

    it('validates - the contact details not found to send feedback email', function (done) {
        if (config.SEND_EMAIL) {
            sendFeedback(data.contactData.dummyEmail, feedback).then(function (res) {
                res.should.have.status(401);
                done();
            });
        }
        else {
            done();
        }
    });

    it('validates - email & feedback paramters are required', function (done) {
        sendFeedback().then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - email address is invalid', function (done) {
        sendFeedback(data.contactData.invalidEmail, feedback).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - feedback is required', function (done) {
        sendFeedback(contactObj.Email, '').then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

});