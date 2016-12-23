'use strict';

/******************************************
 * load webpack configs based on environment 
 * 
 * *****************************************/

require('dotenv').config();
const env = process.env.NODE_ENV;
const config = require('./config/webpack/' + env);
module.exports = config;