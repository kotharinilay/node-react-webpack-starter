'use strict';

// example: arn:aws:lambda:us-west-2:027433987909:function:livestock-processor
var getLambdaArn = function (functionName) {
    return 'arn:aws:lambda:' + process.env.AWS_REGION + ':' + process.env.AWS_ACCOUNT + ':function:' + functionName;
}

// example: https://sqs.ap-southeast-2.amazonaws.com/027433987909/livestock-queue
var getSqsUrl = function (queueName) {
    return 'https://sqs.' + process.env.AWS_REGION + '.amazonaws.com/' + process.env.AWS_ACCOUNT + '/' + queueName;
}

var getAwsInstance = function () {
    var AWS = require('aws-sdk'),
        Promise = require('bluebird');

    // load aws credentials    
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });
    AWS.config.setPromisesDependency(Promise) // ensures promises are bluebird
    return AWS;
};

module.exports = {
    getLambdaArn,
    getSqsUrl,
    getAwsInstance
};