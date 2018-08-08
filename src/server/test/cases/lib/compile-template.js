'use strict';

/*************************************
 * compile-template test cases
 * *************************************/

var { data } = require('../../lib/server');
var CompileTemplate = require('../../../lib/compile-template');

describe('generate email template from html', function () {

    it('compiles template using handlebar', function (done) {
        let templateData = {
            body: data.emailData.message,
            footer: data.emailData.message,
            SiteUrl: process.env.SITE_URL
        };

        CompileTemplate("email/layout.html", templateData);
        done();
    });
});