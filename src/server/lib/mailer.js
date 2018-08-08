'use strict';

/**************************************
 * send email to the recipient using
 * nodemailer : https://github.com/nodemailer/nodemailer
 ************************************/

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import { getResponse, resMessages } from './index';
import CompileTemplate from './compile-template';

// SMTP configuration
function getSMTP() {
    let env = process.env;
    let smtpConfig = {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE == 'true',
        auth: {
            user: env.SMTP_AUTH_USER,
            pass: env.SMTP_AUTH_PASS
        }
    };
    return smtpConfig;
}

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(getSMTP());

// Send the email
function sendEmail(emailFrom, emailTo, subject, message, emailCc = null, emailBCc = null, attachments = null, hasFooter = true, priority = 'normal') {

    if (!emailFrom)
        return getResponse(400, resMessages.emailFromReq);
    if (!emailTo)
        return getResponse(400, resMessages.emailToReq);
    if (!subject)
        return getResponse(400, resMessages.emailSubjectReq);
    if (!message)
        return getResponse(400, resMessages.emailMessageReq);

    let finalBody = wrapLayout(message);

    // Setup mail options
    let mailOptions = {
        from: emailFrom, // sender address
        to: emailTo, // list of receivers (bar@blurdybloop.com, baz@blurdybloop.com)
        subject: subject, // Subject line
        priority: priority, // Sets message importance headers
        html: finalBody // html body
    }
    if (emailCc)
        mailOptions.cc = emailCc;
    if (emailBCc)
        mailOptions.bcc = emailBCc;
    if (attachments)
        mailOptions.attachments = attachments;

    return transporter.sendMail(mailOptions).then(function (res) {
        return getResponse(200, null, { message: res });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// Gets the header
function wrapLayout(message) {
    let templatePath = path.join(__dirname, "../templates/email/footer.html");
    let footer = fs.readFileSync(templatePath, 'utf-8');
    let data = { body: message, footer: footer, SiteUrl: process.env.SITE_URL };
    return CompileTemplate("email/layout.html", data);
}

module.exports = {
    sendEmail: Promise.method(sendEmail)
}