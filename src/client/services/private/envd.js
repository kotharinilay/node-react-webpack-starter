'use strict';

/*************************************
 * e-NVD services
 * *************************************/

import { get, post } from '../../lib/http/http-service';

// Get data to filter livestock grid from left filter area
function getPrepareLivestockData(propertyId, topPIC, livestockIds) {
    return get('/envd/preparelivestockdata', {
        topPIC: topPIC, propertyId: propertyId,
        livestockIds: livestockIds
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get data to filter livestock grid from left filter area
function getQuestionnaireData(topPIC) {
    return get('/envd/questionnairedata', { topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock secondary tab dropdown data
function activateTags(inductionObj) {
    return post('/livestock/activatetag', { inductionObj: inductionObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function checkEUAccreditation(consignedToPropertyId, destinationPropertyId) {
    return get('/envd/iseuaccrediated', {
        consignedToPropertyId: consignedToPropertyId, destinationPropertyId: destinationPropertyId
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function geteNVDFilterData(topPIC) {
    return get('/envd/getfilterdata', { topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getNVDDetail(nvdId) {
    return get('/envd/getbyid', { nvdId: nvdId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock secondary tab dropdown data
function saveENVD(nvdObj) {
    return post('/envd/save', { nvdObj: nvdObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// fetch initial reqiure data for nvd delivery
let getNVDDeliveryInitialData = (nvdId) => {
    return get('/envd/deliverydata', { nvdId: nvdId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// update delivery for selected e-NVD
function updateDelivery(deliveryObj, nvdDetails) {
    return post('/envd/updatedelivery', { deliveryObj: deliveryObj, nvdDetails: nvdDetails }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// retrived last answers for eNVD questionnaire
function useLastAnswers(propertyId, eNVDType) {
    return get('/envd/uselastanswers', { propertyId: propertyId, eNVDType: eNVDType }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// validate livestock identifiers in csv while import from NVD delivery
function validateCSV(mapping, uploadedFileData, identifier, nvdDetails, importType) {
    return post('/envd/validateCSV', {
        mapping: mapping, uploadedFileData: uploadedFileData,
        identifier: identifier, nvdDetails: nvdDetails, importType: importType
    }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// delete eNVD data
function deleteeNVDRecords(uuids, auditLogIds, deleteComment) {
    return post('/envd/delete', { uuids: uuids, auditLogIds: auditLogIds, deleteComment: deleteComment }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// add transporter details for pickup eNVD
function pickupENVD(nvdObj) {
    return post('/envd/pickup', { nvdObj: nvdObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getPrepareLivestockData: getPrepareLivestockData,
    checkEUAccreditation: checkEUAccreditation,
    getQuestionnaireData: getQuestionnaireData,
    geteNVDFilterData: geteNVDFilterData,
    saveENVD: saveENVD,
    getNVDDetail: getNVDDetail,
    getNVDDeliveryInitialData: getNVDDeliveryInitialData,
    updateDelivery: updateDelivery,
    useLastAnswers: useLastAnswers,
    validateCSV: validateCSV,
    deleteeNVDRecords: deleteeNVDRecords,
    pickupENVD: pickupENVD
}