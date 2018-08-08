'use strict';

/*************************************
 * livestock services
 * *************************************/

import { get, post, customGet } from '../../lib/http/http-service';

// Get data to filter livestock grid from left filter area
function getFilterData(topPIC = null, filterObj = null) {
    return post('/livestock/getfilterdata', { topPIC: topPIC, filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// Get filter data based on species
function getFilterBySpecies(speciesId = null, topPIC = null) {
    return post('/livestock/getfilterbyspecies', { speciesId: speciesId, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock primary tab dropdown data
function getPrimaryDDLData(speciesId, topPIC) {
    return post('/livestock/getprimaryddldata', { speciesId: speciesId, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock secondary tab dropdown data
function getSecondaryDDLData(topPIC) {
    return post('/livestock/getsecondaryddldata', { topPIC: topPIC }).then(function (res) {
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

// get all livestock details on selectAll button click
function getAllLivestock(filterObj = null, searchText = null) {
    return post('/livestock/getall', { filterObj: filterObj, searchText: searchText }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock details on from ids
function getLivestockById(ids) {
    return get('/livestock/getbyid', { ids: ids }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get sire or dam for autocomplete
function getSireOrDam(filterObj) {
    return post('/livestock/getsireordam', { filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// export livestock data
function exportLivestock(filterObj = null) {
    return post('/livestock/export', { filterObj: filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get enclosure type per company/region/business/property
function getEnclosureType(topPIC) {
    return post('/enclosuretype/getbinding', { topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get all data of enclosure type
function getEnclosureByType(propertyId, enclosureTypeId) {
    return get('/livestock/getenclosurebytype', { propertyId: propertyId, enclosureTypeId: enclosureTypeId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// perform enclosure movement
function moveToEnclosure(livestocks, propertyId, enclosureId, eventDate, eventGps) {
    return post('/livestock/movetoenclosure',
        {
            livestocks: livestocks, propertyId: propertyId, enclosureId: enclosureId,
            eventDate: eventDate, eventGps: eventGps
        }).then(function (res) {
            return res.data;
        }).catch(function (err) {
            return err.response.data;
        });
}

// delete species data
function deleteLivestock(uuids, auditLogIds) {
    return post('/livestock/delete', { uuids: uuids, auditLogIds: auditLogIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of livestock by id for split mob
function getSplitMobDetail(uuid, topPIC) {
    return get('/livestock/getsplitmobdata', { uuid: uuid, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// perform split mob into multiple
function splitMob(obj) {
    return post('/livestock/splitmob', { obj: obj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// check if livestock with same EID available
function checkDuplicateEID(type, eid, livestockId) {
    return get('/livestock/checkdupeid', { type: type, eid: eid, livestockId: livestockId }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get disposal methods
function getDisposalMethod(topPIC) {
    return get('/livestock/getdisposalmethod', { topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function p2ptransfer(obj) {
    return post('/livestock/p2ptransfer', { obj: obj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save livestock data
function saveLivestock(inductionObj) {
    return post('/livestock/save', { inductionObj: inductionObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// modify multiple livestock data
function multipleModifyLivestock(inductionObj) {
    return post('/livestock/multiplemodify', { inductionObj: inductionObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// record deceased for livestocks
function recordDeceased(data) {
    return post('/livestock/deceased/record', { data: data }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// check how many animals have
// EID to post for kill upload 
function recordDeceasedKillEligible(data, topPIC) {
    return post('/livestock/deceased/killeligible', { data: data, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get data of livestock by ids for merge mob
function getMergeMobDetail(uuid, topPIC) {
    return get('/livestock/getmergemobdata', { uuid: uuid, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get dropdown data for record scan page
function getRecordScanData(speciesId, topPIC) {
    return get('/livestock/getrecordscandata', { speciesId: speciesId, topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// record lost tags for selected livestocks
function recordLost(recordLostValues) {
    return post('/livestock/recordlosttags', { recordLostValues: recordLostValues }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// record tag replacement for selected livestock
function recordTagReplace(recordReplaceValues) {
    return post('/livestock/recordreplacetag', { recordReplaceValues: recordReplaceValues }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// create record scan history
function recordScanResult(topPIC, eventGps, dataObj) {
    return post('/livestock/recordscan', { topPIC: topPIC, eventGps: eventGps, dataObj: dataObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// merge mob records
function mergeMob(obj) {
    return post('/livestock/mergemob', { obj: obj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getCompanyLookup(pageSize, filterObj) {
    return get('/livestock/companylookup', { pageSize, filterObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get livestock carcass tab dropdown data
function getCarcassDDLData(topPIC) {
    return post('/livestock/getcarcassddldata', { topPIC: topPIC }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

function getLivestockByCondition(columns, join, condition) {
    return get('/livestock/getbycondition', { columns, join, condition }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// record carcass for selected livestock
function recordCarcass(recordCarcassValues) {
    return post('/livestock/recordcarcass', { recordCarcassValues: recordCarcassValues }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get feed history of livestock
function getFeedHistory(livestockId) {
    return get('/livestock/feedhistory?id=' + livestockId).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get treatment session product data for record treatment
function getTreatmentSessionProductData(propertyId, selectedIds, sessionIds) {
    return get('/livestock/gettreatsessionproddata', { propertyId: propertyId, livestockIds: selectedIds, sessionIds: sessionIds }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// get full tracebility details of particular livestock
function getTracebilityHistory(livestockId) {
    return get('/livestock/gettracebilityhistory?id=' + livestockId).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save treatment session data
function saveTreatmentSession(sessionObj) {
    return post('/treatmentsession/save', { sessionObj: sessionObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

// save treatment session data and apply record treatment process
function saveApplyTreatmentSession(treatmentObj) {
    return post('/treatmentsession/saveapply', { treatmentObj: treatmentObj }).then(function (res) {
        return res.data;
    }).catch(function (err) {
        return err.response.data;
    });
}

module.exports = {
    getLivestockFilterData: getFilterData,
    getLivestockFilterBySpecies: getFilterBySpecies,
    getLivestockPrimaryDDLData: getPrimaryDDLData,
    getLivestockSecondaryDDLData: getSecondaryDDLData,
    getAllLivestock: getAllLivestock,
    getLivestockById: getLivestockById,
    getSireOrDam: getSireOrDam,
    getEnclosureType: getEnclosureType,
    getEnclosureByType: getEnclosureByType,
    getSplitMobDetail: getSplitMobDetail,
    getDisposalMethod: getDisposalMethod,
    getMergeMobDetail: getMergeMobDetail,
    getRecordScanData: getRecordScanData,
    getCompanyLookup: getCompanyLookup,
    getFeedHistory: getFeedHistory,
    getCarcassDDLData: getCarcassDDLData,
    getLivestockByCondition: getLivestockByCondition,
    getTreatmentSessionProductData: getTreatmentSessionProductData,
    getTracebilityHistory: getTracebilityHistory,
    exportLivestock: exportLivestock,
    activateTags: activateTags,
    moveToEnclosure: moveToEnclosure,
    deleteLivestock: deleteLivestock,
    splitMob: splitMob,
    checkDuplicateEID: checkDuplicateEID,
    p2ptransfer: p2ptransfer,
    saveLivestock: saveLivestock,
    multipleModifyLivestock: multipleModifyLivestock,
    recordDeceased: recordDeceased,
    recordDeceasedKillEligible: recordDeceasedKillEligible,
    recordLost: recordLost,
    recordTagReplace: recordTagReplace,
    recordScanResult: recordScanResult,
    mergeMob: mergeMob,
    recordCarcass: recordCarcass,
    saveTreatmentSession: saveTreatmentSession,
    saveApplyTreatmentSession: saveApplyTreatmentSession
}