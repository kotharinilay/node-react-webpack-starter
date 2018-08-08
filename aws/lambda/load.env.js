'use strict';

/************************************
 * load process environment variables based on
 * pm2 ecosystem config
 ************************************/

module.exports = (env) => {

    Object.keys(env).forEach(function (key) {
        if (!process.env.hasOwnProperty(key)) {
            process.env[key] = env[key]
        }
    });
}





