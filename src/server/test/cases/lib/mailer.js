'use strict';

/*************************************
 * Mailer test cases
 * *************************************/

var {should, data, config} = require('../../lib/server');
var {sendEmail} = require('../../../lib/mailer');
var emailData = data.emailData;
var path = require("path");

describe('send email notification', function () {

    it('should simply send the email to receiver', function (done) {
        if (config.SEND_EMAIL) {
            sendEmail(emailData.from, emailData.to, emailData.subject, emailData.message).then(function (res) {
                res.should.have.status(200);
                done();
            });
        }
        else { done(); }
    });

    it('should send the email along with cc, bcc & attachment', function (done) {
        if (config.SEND_EMAIL) {
            let attachments = [{
                filename: "pdf_attachement.pdf",
                path: path.join(__dirname, '../../lib/mockdata/test.pdf'),
                contentType: "application/pdf"
            }, {
                filename: "pdf_attachement2.pdf",
                path: path.join(__dirname, '../../lib/mockdata/test.pdf'),
                contentType: "application/pdf"
            }];
            sendEmail(emailData.from, emailData.to, emailData.subject, emailData.message, emailData.to, emailData.to, attachments).then(function (res) {
                res.should.have.status(200);
                done();
            });
        }
        else {
            done();
        }
    });

    it('validates - sender email address is required', function (done) {
        sendEmail(null, emailData.to, emailData.subject, emailData.message).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - receiver email address is required', function (done) {
        sendEmail(emailData.from, null, emailData.subject, emailData.message).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - subject is required', function (done) {
        sendEmail(emailData.from, emailData.to, null, emailData.message).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });

    it('validates - email message text is required', function (done) {
        sendEmail(emailData.from, emailData.to, emailData.subject, null).then(function (res) {
            res.should.have.status(400);
            done();
        });
    });
});