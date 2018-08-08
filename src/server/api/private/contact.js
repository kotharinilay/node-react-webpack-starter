'use strict';

/**************************************
 * APIs for user profile setup
 ************************************/

import {
    getUserDetail, updateUserDetail, getAccessiblePICs, getUserRegionRoles, findContact,
    getUserBusinessRoles, getContactDataSet, setPassword, createContact, deleteContacts,
    checkDupEmail, getAllContact, setDefaultPIC, getSuperuserCount, getContactListSearch,
    getPropertyAccessContactList, getContactByCustomCondition, getTransporterCompanySearch,
    getSaleAgentCompanySearch, getAllContactData
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

    // get data for accessible PICs to user
    router.get('/user/accessiblepics', function (req, res, next) {
        let filterObj = JSON.parse(req.query.params).filterObj;
        let id = filterObj || req.authInfo.contactId;
        let { language, isSiteAdministrator } = req.authInfo;
        return getAccessiblePICs(id, language, isSiteAdministrator).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get data for roles assigned to user for region
    router.get('/user/regionroles', function (req, res, next) {
        let obj = JSON.parse(req.query.params);
        if (obj.companyId) {
            let id = obj.contactId || req.authInfo.contactId;
            return getUserRegionRoles(id, obj.companyId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return res.status(200).send({ success: true, data: [] });
        }
    });

    // get data for roles assigned to user for business unit
    router.get('/user/businessroles', function (req, res, next) {
        let obj = JSON.parse(req.query.params);
        if (obj.companyId) {
            let id = obj.contactId || req.authInfo.contactId;
            return getUserBusinessRoles(id, obj.companyId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return res.status(200).send({ success: true, data: [] });
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

    // set password for selected contact
    router.post('/contact/setpassword', function (req, res, next) {
        let { loggedinPassword, newPassword, selectedId } = req.body;
        return setPassword(req.authInfo.contactId, loggedinPassword, newPassword, selectedId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/contact/find', function (req, res, next) {
        return findContact(req.body).then(function (result) {
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

    // check if email already exists
    router.get('/contact/checkduplicate', function (req, res, next) {
        return checkDupEmail(req.query.email).then(function (result) {
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

    // update property preference
    router.post('/contact/setdefaultpic', function (req, res, next) {
        return setDefaultPIC(req.authInfo.contactId, req.body.propertyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get super user count for company
    router.get('/contact/supersuercount', function (req, res, next) {
        return getSuperuserCount(req.query.companyId, req.query.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // search contact list for autocomplete
    router.get('/contact/getlist', function (req, res, next) {
        let { search, companyid = null } = req.query;
        return getContactListSearch(search, companyid).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get list of contact to whoom property is accessible
    router.get('/contact/accesstoproperty', function (req, res, next) {
        return getPropertyAccessContactList(req.query.propertyId, req.query.includePICAccess).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get contact data by condition
    router.get('/contact/getbycondition', function (req, res, next) {
        return getContactByCustomCondition(req.query.columns, req.query.join, req.query.condition).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get list of transporter company
    router.get('/contact/gettransporter', function (req, res, next) {
        let { search } = req.query;
        return getTransporterCompanySearch(search).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get list of Sale Agent company
    router.get('/contact/getsaleagent', function (req, res, next) {
        let { search } = req.query;
        return getSaleAgentCompanySearch(search).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get all contact data on button click of select all
    router.post('/contact/getalldataset', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllContactData(req.body.filterObj, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}