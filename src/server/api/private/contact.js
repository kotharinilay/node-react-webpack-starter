'use strict';

/**************************************
 * APIs for user profile setup
 ************************************/

import {
    getUserDetail, updateUserDetail, getContactDataSet, createContact,
    deleteContacts, getAllContact
} from '../../business/private/contact';

export default function (router) {

    // get user details by Id
    router.get('/user/detail', function (req, res, next) {
        let id = req.query.id || req.authInfo.contactId;
        let { language } = req.authInfo;
        return getUserDetail(id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // add/update contact/user data
    router.post('/contact/save', function (req, res, next) {
        let { userObj } = req.body;
        if (userObj.isNew) {
            return createContact(userObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateUserDetail(userObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // retrieve contacts by server filtering/sorting/paging
    router.get('/contact/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getContactDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // delete selected contacts
    router.post('/contact/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteContacts(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve all contacts
    router.get('/contact/getall', function (req, res, next) {
        return getAllContact(req.query.companyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}