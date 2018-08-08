'use strict';

/***********************************
 * e-NVD api comes here
 * *********************************/


import {
    getPrepareLivestockData, isEUAccrediated, getQuestionnaireData, geteNVDDataSet, geteNVDLivestockDataSet,
    validateCSV, getNVDDeliveryInitialData, geteNVDFilterData, geteNVDDetail, useLastAnswers, deleteeNVD
} from '../../business/private/envd';
import { createNVD } from '../../business/private/envd/new-envd';
import { modifyNVD } from '../../business/private/envd/modify-envd';
import { updateDelivery } from '../../business/private/envd/update-delivery';
import { pickupNVD } from '../../business/private/envd/pickup-envd';

export default function (router) {

    // fetch initial reqiure data for prepare livestock step
    router.get('/envd/preparelivestockdata', function (req, res, next) {
        let { language } = req.authInfo;
        let { propertyId, topPIC, livestockIds } = req.query;
        return getPrepareLivestockData(topPIC, propertyId, language, livestockIds).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch initial reqiure data for prepare livestock step
    router.get('/envd/questionnairedata', function (req, res, next) {
        let { language } = req.authInfo;
        return getQuestionnaireData(language, req.query.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch initial reqiure data for prepare livestock step
    router.get('/envd/iseuaccrediated', function (req, res, next) {
        let { consignedToPropertyId, destinationPropertyId } = req.query;
        return isEUAccrediated(consignedToPropertyId, destinationPropertyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve envd record with server side paging/filtering/sorting
    router.get('/envd/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, filterObj = null, searchText } = JSON.parse(req.query.params);
        let { isSiteAdministrator, contactId, companyId, language } = req.authInfo;
        filterObj.isSiteAdministrator = isSiteAdministrator;
        filterObj.contactId = contactId;
        filterObj.companyId = companyId;
        filterObj.language = language;
        return geteNVDDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve envd livestock record with server side paging/filtering/sorting
    router.get('/envdlivestock/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, filterObj = null } = JSON.parse(req.query.params);
        return geteNVDLivestockDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve envd livestock record with server side paging/filtering/sorting
    router.get('/envd/getbyid', function (req, res, next) {
        let { nvdId } = req.query;
        let { language } = req.authInfo;
        return geteNVDDetail(nvdId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch initial reqiure data for prepare livestock step
    router.get('/envd/getfilterdata', function (req, res, next) {
        let { language } = req.authInfo;
        return geteNVDFilterData(language, req.query.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/envd/save', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        if (req.body.nvdObj.addMode) {
            return createNVD(req.body.nvdObj, language, contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return modifyNVD(req.body.nvdObj, language, contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
    });

    // fetch initial reqiure data for nvd delivery
    router.get('/envd/deliverydata', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return getNVDDeliveryInitialData(req.query.nvdId, contactId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    router.post('/envd/updatedelivery', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return updateDelivery(req.body.deliveryObj, req.body.nvdDetails, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // fetch initial reqiure data for prepare livestock step
    router.get('/envd/uselastanswers', function (req, res, next) {
        let { propertyId, eNVDType } = req.query;
        return useLastAnswers(propertyId, eNVDType).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // validate livestock identifiers in csv while import from NVD delivery
    router.post('/envd/validateCSV', function (req, res, next) {
        let { mapping, uploadedFileData, identifier, nvdDetails, importType } = req.body;
        let { language, contactId } = req.authInfo;
        return validateCSV(mapping, uploadedFileData, identifier, language, contactId, nvdDetails, importType).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // logical delete eNVD
    router.post('/envd/delete', function (req, res, next) {
        let { uuids, auditLogIds, deleteComment } = req.body;
        let { language, contactId } = req.authInfo;
        return deleteeNVD(uuids, auditLogIds, deleteComment, contactId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // add transporter details for pickup eNVD
    router.post('/envd/pickup', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return pickupNVD(req.body.nvdObj, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
}