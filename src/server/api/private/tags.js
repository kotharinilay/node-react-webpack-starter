'use strict';

/**************************************
 * APIs for tags
 ************************************/

import { getTagDataSet, getTagByEID, getTagStatusMaster } from '../../business/private/tags';

export default function (router) {
    router.get('/tags/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText } = JSON.parse(req.query.params);
        let { language } = req.authInfo;

        return getTagDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.get('/tags/getbyeid', function (req, res, next) {
        let { identifier, eid } = req.query;
        return getTagByEID(identifier, eid).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.get('/tags/gettagstatus', function (req, res, next) {
        let { language } = req.authInfo;
        return getTagStatusMaster(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}