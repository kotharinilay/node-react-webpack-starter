'use strict';

/***********************************
 * all common api comes here
 * *********************************/

import { getCompanyHierarchy, getCompanyHierarchyIds, checkPIC } from '../../business/private/common';
import {
    validateTags, importTags, validateProperty, importProperty,
    importDeceased, validateDeceased, importCarcass, validateCarcass
} from '../../business/private/import-desk';
import { getSignedRequest } from '../../business/private/file-middleware';

export default function (router) {

    router.post('/multiplepost', function (req, res, next) {
        return findCompany(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/validateTags', function (req, res, next) {
        let { mapping, firebaseKey, uploadedFileData } = req.body;
        let { language, contactId, isSiteAdministrator } = req.authInfo;
        return validateTags(mapping, firebaseKey, uploadedFileData, language, contactId, isSiteAdministrator).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/importTags', function (req, res, next) {
        let { uploadedFileData, firebaseKey } = req.body;
        let { contactId } = req.authInfo;
        return importTags(uploadedFileData, firebaseKey, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });


    router.post('/validateproperty', function (req, res, next) {
        let { mapping, firebaseKey, uploadedFileData } = req.body;
        let { language, isAgliveSupportAdmin, companyId } = req.authInfo;
        return validateProperty(mapping, firebaseKey, uploadedFileData, language, isAgliveSupportAdmin, companyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/importproperty', function (req, res, next) {
        let { uploadedFileData, firebaseKey } = req.body;
        let { contactId } = req.authInfo;
        return importProperty(uploadedFileData, firebaseKey, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/validatedeceased', function (req, res, next) {
        let { mapping, firebaseKey, uploadedFileData, identifier, topPIC } = req.body;
        let { language, contactId } = req.authInfo;
        return validateDeceased(mapping, firebaseKey, uploadedFileData, language, contactId, identifier, topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/importdeceased', function (req, res, next) {
        let { uploadedFileData, firebaseKey, identifier, topPIC } = req.body;
        let { contactId, language } = req.authInfo;
        return importDeceased(uploadedFileData, firebaseKey, contactId, identifier, topPIC, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/validatecarcass', function (req, res, next) {
        let { mapping, firebaseKey, uploadedFileData, identifier, topPIC } = req.body;
        let { language, contactId } = req.authInfo;
        return validateCarcass(mapping, firebaseKey, uploadedFileData, language, contactId, identifier, topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/importcarcass', function (req, res, next) {
        let { uploadedFileData, firebaseKey, identifier, topPIC } = req.body;
        let { contactId, language } = req.authInfo;
        return importCarcass(uploadedFileData, firebaseKey, contactId, identifier, topPIC, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}