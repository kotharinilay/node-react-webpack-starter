'use strict';

/**************************************
 * APIs for livestock
 ************************************/

import { forEach as _forEach } from 'lodash';
import {
    getLivestockFilterData, getLivestockFilterBySpecies, getLivestockDataSet,
    getLivestockPrimaryDDLData, getLivestockSecondaryDDLData, getAllLivestockData, getSireOrDam,
    getEnclosureNames, exportLivestockData, deleteLivestock, getLivestockById,
    getSplitMobDetail, getDisposalMethods, getLivestockByCustomCondition, getMergeMobDetail, getConceptionMethods,
    getRecordScanData, getCompanyLookup, getTreatmentSessionProductData, getTreatmentSessionDataSet,
    getLivestockTracebilityHistory, getLivestockFeedHistory
} from '../../business/private/livestock';
import {
    createLivestock, modifyLivestock, multipleModifyLivestock,
    checkDuplicateEID
} from '../../business/private/livestock/new-livestock';
import { activateTags } from '../../business/private/livestock/activate-tags';
import { recordDeceased } from '../../business/private/livestock/record-deceased';
import { recordLostTags } from '../../business/private/livestock/record-lost-tags';
import { recordtagReplacement } from '../../business/private/livestock/record-tag-replacement';
import { recordCarcass } from '../../business/private/livestock/record-carcass';
import { recordScan } from '../../business/private/livestock/record-scan';
import { splitMob } from '../../business/private/livestock/split-mob';
import { mergeMob } from '../../business/private/livestock/merge-mob';
import { getCarcassDDLData } from '../../business/private/livestock/record-carcass';
import { moveToEnclosure } from '../../business/private/livestock/move-to-enclosure';
import { createTreatmentSession, saveApplyTreatmentSession } from '../../business/private/livestock/record-treatment';
import { p2pTransfer } from '../../lib/nlis';

export default function (router) {

    // get filter data
    router.post('/livestock/getfilterdata', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return getLivestockFilterData(language, req.body.topPIC, req.body.filterObj, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get filter data by species
    router.post('/livestock/getfilterbyspecies', function (req, res, next) {
        return getLivestockFilterBySpecies(req.authInfo.language, req.body.speciesId, req.body.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve livestock data with server side paging/filtering/sorting
    router.get('/livestock/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText } = JSON.parse(req.query.params);
        let { language, contactId } = req.authInfo;

        return getLivestockDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj, language, searchText, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve livestock data with server side paging/filtering/sorting
    router.get('/livestock/getenclosurebytype', function (req, res, next) {
        let { propertyId, enclosureTypeId } = req.query;
        return getEnclosureNames(propertyId, enclosureTypeId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get livestock primary tab dropdown data
    router.post('/livestock/getprimaryddldata', function (req, res, next) {
        return getLivestockPrimaryDDLData(req.authInfo.language, req.body.speciesId, req.body.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get livestock secondary tab dropdown data
    router.post('/livestock/getsecondaryddldata', function (req, res, next) {
        return getLivestockSecondaryDDLData(req.authInfo.language, req.body.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get livestock secondary tab dropdown data
    router.post('/livestock/activatetag', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return activateTags(req.body.inductionObj, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get filter data
    // get livestock data on button click of select all
    router.post('/livestock/getall', function (req, res, next) {
        let { language } = req.authInfo;
        let { filterObj, searchText } = req.body;
        return getAllLivestockData(filterObj, language, searchText).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get sire or dam for autocomplete
    router.post('/livestock/getsireordam', function (req, res, next) {
        let { language } = req.authInfo;
        return getSireOrDam(language, req.body.filterObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // export livestock details
    router.post('/livestock/export', function (req, res, next) {
        let { language } = req.authInfo;
        return exportLivestockData(req.body.filterObj, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform enclosure movement of livestocks
    router.post('/livestock/movetoenclosure', function (req, res, next) {
        let { livestocks, propertyId, enclosureId, eventDate, eventGps } = req.body;
        return moveToEnclosure(livestocks, propertyId, enclosureId, eventDate, eventGps, req.authInfo.contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // logical delete livestock
    router.post('/livestock/delete', function (req, res, next) {
        let { uuids, auditLogIds } = req.body;
        let { language, contactId } = req.authInfo;
        return deleteLivestock(uuids, auditLogIds, contactId, language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve livestock data with server side paging/filtering/sorting
    router.get('/livestock/getbyid', function (req, res, next) {
        let { ids } = req.query;
        return getLivestockById(ids).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get data of livestock by id for split mob
    router.get('/livestock/getsplitmobdata', function (req, res, next) {
        return getSplitMobDetail(req.query.uuid, req.query.topPIC, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform split mob into multiple
    router.post('/livestock/splitmob', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return splitMob(req.body.obj, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // check for duplicate livestock for EID
    router.get('/livestock/checkdupeid', function (req, res, next) {
        return checkDuplicateEID(req.query.type, req.query.eid, req.query.livestockId, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get disposal methods
    router.get('/livestock/getdisposalmethod', function (req, res, next) {
        return getDisposalMethods(req.authInfo.language, JSON.parse(req.query.topPIC)).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get conception methods
    router.get('/livestock/getconceptionmethod', function (req, res, next) {
        return getConceptionMethods(req.authInfo.language, JSON.parse(req.query.topPIC)).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // transfer livestock from PIC to PIC
    router.post('/livestock/p2ptransfer', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        let inductionObj = req.body.obj;
        let livestockIds = [inductionObj.livestockId];
        return modifyLivestock(inductionObj, language, contactId).then(function (result) {
            if (result.status == 200) {
                p2pTransfer(inductionObj.NLISUsername, inductionObj.NLISPassword, new Date(),
                    inductionObj.oldPIC, inductionObj.topPIC.PIC, inductionObj.nvdnumber, livestockIds).then(function (res) {
                    }).catch(function (err) {
                    });
            }
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // save livestock record
    router.post('/livestock/save', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        if (!req.body.inductionObj.livestockId) {
            return createLivestock(req.body.inductionObj, language, contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }
        else {
            return modifyLivestock(req.body.inductionObj, language, contactId).then(function (result) {
                return res.status(result.status).send(result.response);
            }).catch(function (err) {
                next(err);
            });
        }

    });

    // modify multiple livestock data
    router.post('/livestock/multiplemodify', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return multipleModifyLivestock(req.body.inductionObj, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform record deceased
    router.post('/livestock/deceased/record', function (req, res, next) {
        let { contactId, language } = req.authInfo;
        let { data } = req.body;

        return recordDeceased(contactId, language, data).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // record deceased - post nlis - check eligibility
    router.post('/livestock/deceased/killeligible', function (req, res, next) {
        let { contactId, language } = req.authInfo;
        let { data, topPIC } = req.body;
        let select = ` l.Id,l.UUID,l.EID,l.VisualTag,l.NLISID,l.SocietyId `;
        let str = null;

        _forEach(data, function (i) {
            if (str) { str = str + `,fn_UuidToBin('${i}')`; }
            else { str = `fn_UuidToBin('${i}')`; }
        });
        let where = ` l.CurrentPropertyId=fn_UuidToBin('${topPIC.PropertyId}') AND l.Id IN (${str})`;

        return getLivestockByCustomCondition(select, '', where).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get data of livestock by ids for merge mob
    router.get('/livestock/getmergemobdata', function (req, res, next) {
        return getMergeMobDetail(req.query.uuid, req.query.topPIC, req.authInfo.language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get dropdown data for record scan
    router.get('/livestock/getrecordscandata', function (req, res, next) {
        return getRecordScanData(req.authInfo.language, req.query.speciesId, JSON.parse(req.query.topPIC)).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform record deceased
    router.post('/livestock/recordlosttags', function (req, res, next) {
        let { contactId, language } = req.authInfo;
        let { recordLostValues } = req.body;

        return recordLostTags(contactId, language, recordLostValues).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform record deceased
    router.post('/livestock/recordreplacetag', function (req, res, next) {
        let { contactId, language } = req.authInfo;
        let { recordReplaceValues } = req.body;
        return recordtagReplacement(contactId, language, recordReplaceValues).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // record scan result and create history
    router.post('/livestock/recordscan', function (req, res, next) {
        let { contactId } = req.authInfo;
        return recordScan(req.body.topPIC, contactId, req.body.eventGps, req.body.dataObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // merge mob records
    router.post('/livestock/mergemob', function (req, res, next) {
        let { language, contactId } = req.authInfo;
        return mergeMob(req.body.obj, language, contactId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get dropdown data for record scan
    router.get('/livestock/companylookup', function (req, res, next) {
        return getCompanyLookup(req.authInfo.language, req.query.pageSize, JSON.parse(req.query.filterObj)).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get livestock carcass tab dropdown data
    router.post('/livestock/getcarcassddldata', function (req, res, next) {
        return getCarcassDDLData(req.authInfo.language, req.body.topPIC).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get livestock data by condition
    router.get('/livestock/getbycondition', function (req, res, next) {
        return getLivestockByCustomCondition(req.query.columns, req.query.join, req.query.condition).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // perform record deceased
    router.post('/livestock/recordcarcass', function (req, res, next) {
        let { contactId, language } = req.authInfo;
        let { recordCarcassValues } = req.body;
        return recordCarcass(contactId, language, recordCarcassValues).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve feed history for particular livestock
    router.get('/livestock/feedhistory', function (req, res, next) {
        return getLivestockFeedHistory(req.authInfo.language, req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // get treatment session product data for record treatment
    router.get('/livestock/gettreatsessionproddata', function (req, res, next) {
        let { propertyId, livestockIds, sessionIds } = req.query;
        return getTreatmentSessionProductData(req.authInfo.language, propertyId, livestockIds, sessionIds).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // retrieve treatment session data with server side paging/filtering/sorting
    router.get('/treatmentsession/getdataset', function (req, res, next) {
        let { pageSize, skipRec, sortColumn, sortOrder, filterObj } = JSON.parse(req.query.params);
        return getTreatmentSessionDataSet(pageSize, skipRec, sortColumn, sortOrder, filterObj).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });
    // get full tracebility details of particular livestock
    router.get('/livestock/gettracebilityhistory', function (req, res, next) {
        return getLivestockTracebilityHistory(req.authInfo.language, req.query.id).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

    // save treatmentsession record
    router.post('/treatmentsession/save', function (req, res, next) {
        let { language, contactId, companyId } = req.authInfo;
        //if (!req.body.inductionObj.livestockId) {
        return createTreatmentSession(req.body.sessionObj, language, contactId, companyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
        // }
        // else {
        //     return modifyLivestock(req.body.inductionObj, language, contactId).then(function (result) {
        //         return res.status(result.status).send(result.response);
        //     }).catch(function (err) {
        //         next(err);
        //     });
        // }
    });

    // save treatmentsession record
    router.post('/treatmentsession/saveapply', function (req, res, next) {
        let { language, contactId, companyId } = req.authInfo;
        return saveApplyTreatmentSession(req.body.treatmentObj, language, contactId, companyId).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
    });

}