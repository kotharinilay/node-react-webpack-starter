'use strict';

/******************************************
 * decide who is responsible to log server error
 * based on environment [development|production]
 * *****************************************/

module.exports = require('./' + process.env.NODE_ENV);
