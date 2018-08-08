'use strict';

/**************************************
 * APIs for property page
 ************************************/

import {
    getPropertyFilterData, getPropertyDataSet, getEnclosureDataSetById, findProperty,
    getPropertyMngrAsstMngr, getDataByHierarchy, getDataOnAccreditation, createProperty, updateProperty,
    getPropertyDetail, propertySearch, getPropertyAccessList, deleteProperty, getMapDetail, getPICManagerHierarchy,
    getInductionInitialDetail, getPropertyByCustomCondition, getAllPropertyData
} from '../../business/private/property';

export default function (router) {

    // get filter data
    router.get('/property/getfilterdata', function (req, res, next) {
        return getPropertyFilterData(req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retreive property data with server side paging/filtering/sortin
    router.get('/property/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        let { language, contactId, isSiteAdministrator } = req.authInfo;
        return getPropertyDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language, contactId, isSiteAdministrator).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve enclosure data with server side paging/filtering/sorting By PropertyId
    router.get('/enclosure/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText = null, filterObj } = JSON.parse(req.query.params);
        let { language } = req.authInfo;
        return getEnclosureDataSetById(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/property/find', function (req, res, next) {
        return findProperty(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get list of Manager and AsstManager for property
    router.get('/property/getmngrasstmngr', function (req, res, next) {
        let { companyId = null, regionId = null, businessId = null } = req.query;
        return getPropertyMngrAsstMngr(companyId, regionId, businessId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get all data on change of company hierarchy
    router.get('/property/getdatabyhierarchy', function (req, res, next) {
        let { companyId = null, regionId = null, businessId = null } = req.query;
        return getDataByHierarchy(companyId, regionId, businessId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // Get all data on load of accreditation tab
    router.get('/property/getdataonaccreditation', function (req, res, next) {
        let { language } = req.authInfo;
        return getDataOnAccreditation(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // top pic search api
    router.get('/property/search', function (req, res, next) {
        let { language, contactId, companyId, isSiteAdministrator, isSuperUser } = req.authInfo;
        let value = req.query.value;

        return propertySearch(value, contactId, companyId, isSiteAdministrator, isSuperUser).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // create or update property details
    router.post('/property/save', function (req, res, next) {
        let { property, accreditation, accredDeletedData, enclosure, updateAccreditationDB, updateEnclosureDB, enclosureMap, updateMapDB,
            access, accessDeletedData, defaultAccessData, companyHierarchy = null, deletedEnclosureMap, retrieveStatus } = req.body;
        if (!property.PropertyId) {
            return createProperty(property, accreditation, enclosure, access, defaultAccessData, companyHierarchy, enclosureMap, retrieveStatus, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateProperty(property, accreditation, accredDeletedData, enclosure, updateAccreditationDB, updateEnclosureDB, access, accessDeletedData, defaultAccessData, companyHierarchy, enclosureMap, updateMapDB, deletedEnclosureMap, retrieveStatus, req.authInfo.contactId, req.authInfo.language).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // retrieve property by id
    router.get('/property/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getPropertyDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get property access list for permission
    router.get('/property/getaccess', function (req, res, next) {
        let { companyId = null, regionId = null, businessId = null, propertyId = null } = req.query;
        return getPropertyAccessList(companyId, regionId, businessId, propertyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // delete selected contacts
    router.post('/property/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        return deleteProperty(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve property map detail by id
    router.get('/property/mapdetail', function (req, res, next) {
        let { language } = req.authInfo;
        return getMapDetail(req.query.uuid, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve property induction initial details by id
    router.get('/property/inductioninitialdetails', function (req, res, next) {
        let { language } = req.authInfo;
        return getInductionInitialDetail(req.query.propertyId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve property map detail by id
    router.get('/property/pichierarchy', function (req, res, next) {
        let { companyId = null, regionId = null, businessId = null, propertyId = null } = req.query;
        return getPICManagerHierarchy(propertyId, companyId, regionId, businessId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get property data by condition
    router.get('/property/getbycondition', function (req, res, next) {
        return getPropertyByCustomCondition(req.query.columns, req.query.join, req.query.condition).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get all property data on button click of select all
    router.post('/property/getalldataset', function (req, res, next) {
        let { language, contactId, isSiteAdministrator } = req.authInfo;
        return getAllPropertyData(req.body.filterObj, language, contactId, isSiteAdministrator).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}