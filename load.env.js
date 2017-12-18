'use strict';

/************************************
 * load process environment variables based on
 * pm2 ecosystem config
 ************************************/

var file = require('./ecosystem/server');

const DEV_ENV = { name: "development", index: 0 };
const PROD_ENV = { name: "production", index: 1 };

module.exports = () => {

    const ENVIRONMENT = DEV_ENV;

    var env = file.apps[ENVIRONMENT.index].env;
    
    Object.keys(env).forEach(function (key) {        
        if (!process.env.hasOwnProperty(key)) {            
            process.env[key] = env[key]
        }
    });
}





