'use strict';

/*************************************
 * consists API calls for Dashboard
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// get grid data for specific page
function getGridData() {
    return get('/multipleget').then(function (res) {
        return res;
    }).catch(function (err) {
        return err;
    });
}


function deleteFile(filename, deleteThumb) {
    return post('/multiplepost', { test1: 'test1', test2: 'test2' }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function validateTags(mapping, firebaseKey, uploadedFileData) {
    return post('/validateTags', { mapping: mapping, firebaseKey: firebaseKey, uploadedFileData: uploadedFileData }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function importTags(uploadedFileData, firebaseKey) {
    return post('/importTags', { uploadedFileData: uploadedFileData, firebaseKey: firebaseKey }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function validateProperty(mapping, firebaseKey, uploadedFileData) {
    return post('/validateproperty', { mapping: mapping, firebaseKey: firebaseKey, uploadedFileData: uploadedFileData }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function importProperty(uploadedFileData, firebaseKey) {
    return post('/importproperty', { uploadedFileData: uploadedFileData, firebaseKey: firebaseKey }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function validateDeceased(mapping, firebaseKey, uploadedFileData, identifier, topPIC) {
    return post('/validatedeceased', {
        mapping: mapping, firebaseKey: firebaseKey,
        uploadedFileData: uploadedFileData, identifier: identifier, topPIC: topPIC
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function importDeceased(uploadedFileData, firebaseKey, identifier, topPIC) {
    return post('/importdeceased', {
        uploadedFileData: uploadedFileData, firebaseKey: firebaseKey,
        identifier: identifier, topPIC: topPIC
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function validateCarcass(mapping, firebaseKey, uploadedFileData, identifier, topPIC) {
    return post('/validatecarcass', {
        mapping: mapping, firebaseKey: firebaseKey,
        uploadedFileData: uploadedFileData, identifier: identifier, topPIC: topPIC
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function importCarcass(uploadedFileData, firebaseKey, identifier, topPIC) {
    return post('/importcarcass', {
        uploadedFileData: uploadedFileData, firebaseKey: firebaseKey,
        identifier: identifier, topPIC: topPIC
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getGridData: getGridData,
    deleteFile: deleteFile,
    validateTags: validateTags,
    importTags: importTags,
    validateProperty: validateProperty,
    importProperty: importProperty,
    validateDeceased: validateDeceased,
    importDeceased: importDeceased,
    validateCarcass: validateCarcass,
    importCarcass: importCarcass
}