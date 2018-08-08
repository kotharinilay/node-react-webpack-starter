'use strict';

/***********************************
 * all common api comes here
 * *********************************/

import { getCompanyHierarchy, getCompanyHierarchyIds, checkPIC, downloadFile, base64ToImage } from '../../business/private/common';
import { getSignedRequest } from '../../business/private/file-middleware';

export default function (router) {

    // fetch company hierarchy
    router.get('/getcompanyhierarchy', function (req, res, next) {
        let { companyId = null, regionId = null, businessId = null, regionDisabled = 0 } = req.query;
        let { isSiteAdministrator = 0, isSuperUser = 0, contactId = null } = req.authInfo;
        return getCompanyHierarchy(companyId, regionId, businessId, isSiteAdministrator, isSuperUser, contactId, regionDisabled).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch ids of company hierarchy
    router.get('/getcompanyhierarchyids', function (req, res, next) {
        return getCompanyHierarchyIds(req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // check PIC duplication
    router.get('/pic/checkduplication', function (req, res, next) {
        let { pic, propertyId = null } = req.query;
        return checkPIC(pic, propertyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get s3 signed request
    router.get('/s3_signed', function (req, res, next) {
        let { files, uploadFolder } = req.query;
        return getSignedRequest(files, uploadFolder).then(function (result) {
            return res.status(200).send(result);
        }).catch(function (err) {
            next(err);
        });
    });

    // download file from s3 path
    router.get('/downloadfile', function (req, res, next) {
        let { path, name, type } = req.query;
        return downloadFile(path, name, type).then(function (result) {
            return res.status(200).send(result);
        }).catch(function (err) {
            next(err);
        });
    });

    // download file from s3 path
    router.post('/base64toimage', function (req, res, next) {
        let { data, name } = req.body;
        return base64ToImage(data, name).then(function (result) {
            return res.status(200).send(result);
        }).catch(function (err) {
            next(err);
        });
    });

}
