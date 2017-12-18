'use strict';

/******************************************
 * log server exception to aws cloud watch service
 * using winston logging library [production]
 * *****************************************/

import winston from 'winston';
import awsCloudWatch from 'winston-aws-cloudwatch';

let env = process.env;
let options = {
    logGroupName: 'web',
    logStreamName: 'name',
    createLogGroup: true,
    createLogStream: true,
    awsConfig: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION
    }
};

winston.add(awsCloudWatch, options);

let error = function (msg) {
    winston.error(msg);
}

let info = function (msg) {    
    winston.info(msg);  
};

let warn = function (msg) {    
    winston.warn(msg);  
};

module.exports = { error, info, warn };