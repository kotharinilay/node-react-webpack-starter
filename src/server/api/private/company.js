'use strict';

/***********************************
 * company api comes here
 * *********************************/

import {
    getCompanyById, findCompany, getCompanyDataSet, createCompany,
    updateCompanyDetail, getCompanyDetails, checkDupEmail, getBusinessDataSet, getRegionDataSet,
    getSubCompanyDetail, createRegion, updateRegionDetail, createBusinessUnit, updateBusinessUnitDetail,
    checkDupName, getAllRegion, deleteBusinessUnit, deleteRegion, deleteCompany, getAllCompanyData
} from '../../business/private/company';

export default function (router) {

    router.post('/company/find', function (req, res, next) {
        return findCompany(req.body).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch company detail by id
    router.get('/company/getbyid', function (req, res, next) {
        return getCompanyById(req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve companies by server filtering/sorting/paging
    router.get('/company/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        return getCompanyDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // add/update company data
    router.post('/company/save', function (req, res, next) {
        let { companyObj } = req.body;
        if (!companyObj.Id) {
            return createCompany(companyObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateCompanyDetail(companyObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // get company detail data by Id
    router.get('/company/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getCompanyDetails(req.query.id, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // check if email already exists
    router.get('/company/checkduplicate', function (req, res, next) {
        return checkDupEmail(req.query.email).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve regions of company by server filtering/sorting/paging
    router.get('/region/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        return getRegionDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve business units of company by server filtering/sorting/paging
    router.get('/business/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj } = JSON.parse(req.query.params);
        return getBusinessDataSet(pageSize, skipRec, sortColumn, sortOrder, searchText, filterObj, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get region/business unit detail data by Id
    router.get('/subcompany/detail', function (req, res, next) {
        let { language } = req.authInfo;
        return getSubCompanyDetail(req.query.id, req.query.type, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // add/update region data
    router.post('/region/save', function (req, res, next) {
        let { regionObj } = req.body;
        if (!regionObj.Id) {
            return createRegion(regionObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateRegionDetail(regionObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // add/update business unit data
    router.post('/businessunit/save', function (req, res, next) {
        let { businessObj } = req.body;
        if (!businessObj.Id) {
            return createBusinessUnit(businessObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return updateBusinessUnitDetail(businessObj, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // check if duplicate company/region/business unit exist within company
    router.get('/company/checkduplicatename', function (req, res, next) {
        return checkDupName(req.query.name, req.query.companyId, req.query.type,
            req.query.id).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
    });

    // retrieve all region for drop down
    router.get('/region/getall', function (req, res, next) {
        return getAllRegion(req.query.companyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    //  delete selected company
    router.post('/company/delete', function (req, res, next) {
        let { uuids, auditLogIds, type } = req.body;
        if (type == 'C') {
            return deleteCompany(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else if (type == 'B') {
            return deleteBusinessUnit(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else if (type == 'R') {
            return deleteRegion(uuids, auditLogIds, req.authInfo.contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // get company data on button click of select all
    router.post('/company/getall', function (req, res, next) {
        let { language } = req.authInfo;
        return getAllCompanyData(req.body.filterObj, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}
