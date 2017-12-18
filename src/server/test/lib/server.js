require('../../../../load.env')();
var config = require('./config.json');
var data = require('./mockdata/data.json');

// var express = require('express');
// var app = express();
// //var publicApi = require('../../src/server/api/public');
// //app.use('/api/public', publicApi);
// app.listen(config.PORT);

// // Initialize passport strategies for routes
// require('../../auth/passport-auth');

var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = {
    chai: chai,
    chaiHttp: chaiHttp,
    assert: chai.assert,
    expect: chai.expect,
    should: chai.should(),
    data: data,
    config: config
};