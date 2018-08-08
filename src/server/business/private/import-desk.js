'use strict';

/***********************************
 * Logic related to import csv
 * *********************************/

import Promise from 'bluebird';
import { invokeLambda } from '../../../../aws/lambda';
import { getResponse, resMessages, HttpStatus } from '../../lib/index';

let getEnvForLambda = () => {
    return {
        DB_NAME: process.env.DB_NAME,
        DB_HOST_USERNAME: process.env.DB_HOST_USERNAME,
        DB_HOST_PASSWORD: process.env.DB_HOST_PASSWORD,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_DIALECT: process.env.DB_DIALECT,
        AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION
    }
}

// validate data from uploaded livestock tag csv 
let validateTags = (mapping, firebaseKey, uploadedFileData, language, contactId, isSiteAdministrator) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                firebaseKey: firebaseKey,
                contactId: contactId,
                language: language,
                isSiteAdministrator: isSiteAdministrator,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-tag/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + filename.substring(filename.lastIndexOf("."))}`,
                offset: chunk.offset,
                bucket: process.env.BUCKET_NAME,
                mapping: mapping,
                env: env
            }
        })
        return invokeLambda('validate-import-tags', payload);
    }).then(function (res) {
        console.log(res);
        if (res[0].Payload == '1') {
            let payload = JSON.stringify({
                body: {
                    firebaseKey: firebaseKey,
                    contactId: contactId,
                    fileToProcess: `${process.env.NODE_ENV}/import-csv/import-tag/${firebaseKey}/${filename}`,
                    chunkCount: uploadedFileData.chunkOffset.length,
                    bucket: process.env.BUCKET_NAME,
                    env: env
                }
            })
            return invokeLambda('remove-duplicate-tags', payload);
        }
        else {
            let resJSON = JSON.parse(res[0].Payload);
            if (resJSON.status == HttpStatus.SERVER_ERROR)
                throw new Error(resJSON.message);
            else
                return resJSON;
        }
    }).then(function (res) {
        console.log(res);
        if (res.Payload == '1') {
            return getResponse();
        }
        else {
            return getResponse(res.status, res.message);
        }
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// insert/update valid uploaded tag data to database
let importTag = (uploadedFileData, firebaseKey, contactId) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                contactId: contactId,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-tag/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + "_Valid" + filename.substring(filename.lastIndexOf("."))}`,
                bucket: process.env.BUCKET_NAME,
                env: env
            }
        })
        return invokeLambda('import-tags', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            return getResponse();
        }
        throw new Error(res[0].Payload);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// validate data from uploaded property csv 
let validateProperty = (mapping, firebaseKey, uploadedFileData, language, isAgliveSupportAdmin, companyId) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                firebaseKey: firebaseKey,
                isAgliveSupportAdmin: isAgliveSupportAdmin,
                companyId: companyId,
                language: language,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-property/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + filename.substring(filename.lastIndexOf("."))}`,
                offset: chunk.offset,
                bucket: process.env.BUCKET_NAME,
                mapping: mapping,
                env: env
            }
        })
        return invokeLambda('validate-import-property', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            let payload = JSON.stringify({
                body: {
                    firebaseKey: firebaseKey,
                    fileToProcess: `${process.env.NODE_ENV}/import-csv/import-property/${firebaseKey}/${filename}`,
                    chunkCount: uploadedFileData.chunkOffset.length,
                    bucket: process.env.BUCKET_NAME,
                    env: env
                }
            })
            return invokeLambda('remove-duplicate-property', payload);
        }
        else {
            let resJSON = JSON.parse(res[0].Payload);
            if (resJSON.status == HttpStatus.SERVER_ERROR)
                throw new Error(resJSON.message);
            else
                return resJSON;
        }
    }).then(function (res) {
        if (res.Payload == '1') {
            return getResponse();
        }
        else {
            return getResponse(res.status, res.message);
        }
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// insert/update valid uploaded property data to database
let importProperty = (uploadedFileData, firebaseKey, contactId) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                contactId: contactId,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-property/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + "_Valid" + filename.substring(filename.lastIndexOf("."))}`,
                bucket: process.env.BUCKET_NAME,
                env: env
            }
        })
        return invokeLambda('import-property', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            return getResponse();
        }
        throw new Error(res[0].Payload);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// validate data from uploaded livestock deceased csv 
let validateDeceased = (mapping, firebaseKey, uploadedFileData, language, contactId, identifier, topPIC) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                firebaseKey: firebaseKey,
                contactId: contactId,
                language: language,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-deceased/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + filename.substring(filename.lastIndexOf("."))}`,
                offset: chunk.offset,
                bucket: process.env.BUCKET_NAME,
                identifier: identifier,
                topPIC: topPIC,
                mapping: mapping,
                env: env
            }
        })
        return invokeLambda('validate-import-deceased', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            let payload = JSON.stringify({
                body: {
                    firebaseKey: firebaseKey,
                    contactId: contactId,
                    fileToProcess: `${process.env.NODE_ENV}/import-csv/import-deceased/${firebaseKey}/${filename}`,
                    chunkCount: uploadedFileData.chunkOffset.length,
                    bucket: process.env.BUCKET_NAME,
                    identifier: identifier,
                    env: env
                }
            })
            return invokeLambda('remove-duplicate-deceased', payload);
        }
        else {
            let resJSON = JSON.parse(res[0].Payload);
            if (resJSON.status == HttpStatus.SERVER_ERROR)
                throw new Error(resJSON.message);
            else
                return resJSON;
        }
    }).then(function (res) {
        if (res.Payload == '1') {
            return getResponse();
        }
        else {
            return getResponse(res.status, res.message);
        }
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// insert/update valid uploaded deceased data to database
let importDeceased = (uploadedFileData, firebaseKey, contactId, identifier, topPIC, language) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                contactId: contactId,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-deceased/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + "_Valid" + filename.substring(filename.lastIndexOf("."))}`,
                bucket: process.env.BUCKET_NAME,
                identifier: identifier,
                topPIC: topPIC,
                language: language,
                env: env
            }
        })
        return invokeLambda('import-deceased', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            return getResponse();
        }
        throw new Error(res[0].Payload);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// validate data from uploaded livestock carcass csv 
let validateCarcass = (mapping, firebaseKey, uploadedFileData, language, contactId, identifier, topPIC) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                firebaseKey: firebaseKey,
                contactId: contactId,
                language: language,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-carcass/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + filename.substring(filename.lastIndexOf("."))}`,
                offset: chunk.offset,
                bucket: process.env.BUCKET_NAME,
                identifier: identifier,
                topPIC: topPIC,
                mapping: mapping,
                env: env
            }
        })
        return invokeLambda('validate-import-carcass', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            let payload = JSON.stringify({
                body: {
                    firebaseKey: firebaseKey,
                    contactId: contactId,
                    fileToProcess: `${process.env.NODE_ENV}/import-csv/import-carcass/${firebaseKey}/${filename}`,
                    chunkCount: uploadedFileData.chunkOffset.length,
                    bucket: process.env.BUCKET_NAME,
                    identifier: identifier,
                    env: env
                }
            })
            return invokeLambda('remove-duplicate-carcass', payload);
        }
        else {
            let resJSON = JSON.parse(res[0].Payload);
            if (resJSON.status == HttpStatus.SERVER_ERROR)
                throw new Error(resJSON.message);
            else
                return resJSON;
        }
    }).then(function (res) {
        if (res.Payload == '1') {
            return getResponse();
        }
        else {
            return getResponse(res.status, res.message);
        }
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// insert/update valid uploaded carcass data to database
let importCarcass = (uploadedFileData, firebaseKey, contactId, identifier, topPIC, language) => {
    let env = getEnvForLambda();
    let bucket = process.env.BUCKET_NAME;
    let filename = uploadedFileData.file.filename;

    return Promise.map(uploadedFileData.chunkOffset, function (chunk, index) {
        let payload = JSON.stringify({
            body: {
                contactId: contactId,
                fileToProcess: `${process.env.NODE_ENV}/import-csv/import-carcass/${firebaseKey}/${filename.substring(0, filename.lastIndexOf(".")) + "_" + chunk.chunk + "_Valid" + filename.substring(filename.lastIndexOf("."))}`,
                bucket: process.env.BUCKET_NAME,
                identifier: identifier,
                topPIC: topPIC,
                language: language,
                env: env
            }
        })
        return invokeLambda('import-carcass', payload);
    }).then(function (res) {
        if (res[0].Payload == '1') {
            return getResponse();
        }
        throw new Error(res[0].Payload);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    validateTags: Promise.method(validateTags),
    importTags: Promise.method(importTag),
    validateProperty: Promise.method(validateProperty),
    importProperty: Promise.method(importProperty),
    validateDeceased: Promise.method(validateDeceased),
    importDeceased: Promise.method(importDeceased),
    validateCarcass: Promise.method(validateCarcass),
    importCarcass: Promise.method(importCarcass)
}