'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

// lambda invoke function
exports.handler = function (event, context) {
    require('./src/load.env')(event.body.env);

    var path = require('path'),
        promise = require('bluebird'),
        aws = require('aws-sdk'),
        firebase = require('firebase-admin'),

        fileToProcess = event.body.fileToProcess, identifierIndex = 3, mobNameIndex = 4,
        isMobIndex = 5, rowIndex = 0;

    aws.config.setPromisesDependency(promise);

    // not need to update config while execute on AWS
    // only for local testing
    if (event.body.localTesting) {
        aws.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }
    var s3 = new aws.S3();

    // firebaes initialization
    if (firebase.apps.length === 0) {
        firebase.initializeApp({
            credential: firebase.credential.cert(require(path.join(__dirname, './serviceAccountKey.json'))),
            databaseURL: "https://aglive-v3.firebaseio.com"
        });
    }
    var firebaseRef = firebase.database().ref('/import-deceased/' + event.body.firebaseKey + '/');

    console.log('Push S3 object to array for execution');
    var s3GetPromises = [];
    var s3PutPromises = [];
    for (var index = 1; index <= event.body.chunkCount; index++) {
        s3GetPromises.push(s3.getObject({
            Bucket: event.body.bucket,
            Key: fileToProcess.substring(0, fileToProcess.lastIndexOf(".")) + "_" + index + "_Valid" + fileToProcess.substring(fileToProcess.lastIndexOf(".")),
        }).promise());
    }
    var finalCSV = [];
    var invalidGridData = [];

    console.log('Start fetching data from s3 array object and remove duplicate records');
    var deleteObj = [];
    promise.map(s3GetPromises, function (c, index) {
        c.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach(function (row) {
            var element = row.split(',');
            var spliceIndex;
            let match = finalCSV.every((el, i) => {
                if (!el[isMobIndex] && el[identifierIndex] == element[identifierIndex]) {
                    invalidGridData.push({ line: element[rowIndex], issues: `${element[identifierIndex]} is duplicate.` });
                    invalidGridData.push({ line: el[rowIndex], issues: `${element[identifierIndex]} is duplicate.` });
                    spliceIndex = i;
                    return false;
                }
                else if (el[isMobIndex] && el[mobNameIndex] == element[mobNameIndex]) {
                    invalidGridData.push({ line: element[rowIndex], issues: `${element[mobNameIndex]} is duplicate.` });
                    invalidGridData.push({ line: el[rowIndex], issues: `${element[mobNameIndex]} is duplicate.` });
                    spliceIndex = i;
                    return false;
                }
                else
                    return true;
            });
            if (match) {
                finalCSV.push(element);
            }
            else {
                finalCSV.splice(spliceIndex, 1);
            }
        }, this);
    }).then(function () {
        console.log('Creating chunk from CSV file');
        let totalCount = finalCSV.length;
        let chunkLength = parseInt(totalCount / s3GetPromises.length);
        for (var k = 0; k < s3GetPromises.length; k++) {
            let validChunkData = [];
            if ((k + 1) == s3GetPromises.length)
                validChunkData = finalCSV.splice(0, totalCount);
            else
                validChunkData = finalCSV.splice(0, chunkLength);
            s3PutPromises.push(s3.putObject({
                Bucket: event.body.bucket,
                Key: fileToProcess.substring(0, fileToProcess.lastIndexOf(".")) + "_" + (k + 1) + "_Valid" + fileToProcess.substring(fileToProcess.lastIndexOf(".")),
                Body: validChunkData.join('\n')
            }).promise());
        }
        console.log('Push invalid data in firebase');
        return firebaseRef.push(invalidGridData);
    }).then(function () {
        console.log('Creating valid CSV file');
        return promise.all(s3PutPromises);
    }).then(function (params) {
        console.log('Process completed.');
        context.done(null, 1);
    }).catch(function (err) {
        console.log('Error : ' + err);
        context.done(err);
    });
}