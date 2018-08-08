'use strict';

/************************************
 * aws/s3/index.js
 * general methods to post/get physical files
 * from any s3 bucket
 * ***********************************/

// post function to upload file on s3
function upload(file, moduleName, category, internalPath, callback) {
    var AWS = require('../utility').getAwsInstance();
    var fs = require('fs');
    if (fs.existsSync(file.path)) {
        let fileData = fs.readFileSync(file.path);
        let destFileName = process.env.NODE_ENV + '/' + moduleName +
            (category ? '/' + category + '/' + internalPath + '/' + file.storeName : '/' + internalPath + '/' + file.storeName);
        let contentType = file.type;

        // create aws-s3 instance with target bucket 
        var s3 = new AWS.S3();

        // create param obj with file details
        var params = {
            Bucket: process.env.BUCKET_NAME,    // bucket name in s3 service
            ACL: process.env.ACL,               // default is private
            Body: fileData,                     // create stream from file
            Key: destFileName,                  // create file with name
            ContentType: contentType            // mime type
        }
        // force s3 to upload file on bucket and return promise
        return s3.upload(params).promise();
    }
    else {
        return null;
    }
}

function putObject(bucketName, key, data) {
    var AWS = require('./../utility.js').getAwsInstance();
    var s3 = new AWS.S3();

    return s3.putObject({
        Bucket: bucketName,
        Key: key,
        ACL: 'public-read',
        Body: JSON.stringify(data)
    }).promise();
}

function deleteObjects(files, callback) {
    var AWS = require('./../utility.js').getAwsInstance();
    var s3 = new AWS.S3();
    let fileObjects = []
    files.map((file) => {
        fileObjects.push({ Key: process.env.NODE_ENV + file.storeName })
    })
    let params = {
        Bucket: process.env.BUCKET_NAME,
        Delete: { Objects: fileObjects }
    }
    s3.deleteObjects(params).send(callback);
    s3.getObject()
}

function getSignedRequest(fileName, fileType, folderName) {
    let AWS = require('./../utility.js').getAwsInstance();
    let s3 = new AWS.S3();
    let path = process.env.NODE_ENV + '/' + folderName + '/' + fileName;

    let s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: path,
        ContentType: fileType,
        ACL: 'public-read'
    }

    return s3.getSignedUrl('putObject', s3Params);
}

module.exports = {
    deleteObjects: deleteObjects,
    putObject: putObject,
    upload: upload,
    getSignedUrl: getSignedRequest
}