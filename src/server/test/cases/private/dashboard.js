'use strict';

/*************************************
 * Dashboard test cases
 * *************************************/

var {should, data} = require('../../lib/server');
var {getPreferredWidgets, updatePreferredWidgets} = require('../../../business/private/dashboard');
var {insertContact, removeContact} = require('../../lib/mockdata');
let contactObj = {};

describe('get preferred widgets and update it based on user selection', function () {

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

    it('should update acitve widgets', function (done) {
        updatePreferredWidgets(data.preferredWidgets, contactObj.UUID).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('should have list of all widgets', function (done) {
        getPreferredWidgets(true, contactObj.UUID).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('should have list of active widgets (preferred widgets)', function (done) {        
        getPreferredWidgets(false, contactObj.UUID).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('should have all widgets if given contactId not match', function (done) {
        getPreferredWidgets(true, contactObj.UUID + '123').then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

    it('should inactive all widgets', function (done) {
        updatePreferredWidgets([], contactObj.UUID).then(function (res) {
            res.should.have.status(200);
            done();
        });
    });

});