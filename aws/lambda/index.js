'use strict';

/************************************
 * method to invoke lambda function
 * ***********************************/

function invokeLambda(functionName, payload) {
    var AWS = require('../utility').getAwsInstance();
    var lambda = new AWS.Lambda();

    return lambda.invoke({
        FunctionName: functionName,
        Payload: payload,
        InvocationType: 'RequestResponse'
    }).promise();
}

module.exports = {
    invokeLambda: invokeLambda
}