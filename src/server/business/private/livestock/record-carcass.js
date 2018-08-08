'use strict';

/***********************************
 * record carcass related logic
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { HttpStatus, getResponse, resMessages } from '../../../lib/index';
import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';

import { LivestockEventMapper, LivestockStatusHistoryMapper, MobCountHistoryMapper } from '../../../schema/mapper';
import { livestockActivityStatusCodes, tagStatusCodes, eventTypes } from '../../../../shared/constants';
import { isBefore } from '../../../../shared/format/date';

import { getDentitionBindings } from '../../../repository/dentition';
import { getCarcassCategoryBindings } from '../../../repository/carcasscategory';
import { getButtShapeBindings } from '../../../repository/buttshape';
import { getBoningGroupBindings } from '../../../repository/boninggroup';
import { getMSAGraderBindings } from '../../../repository/msagrader';
import { getHangMethodBindings } from '../../../repository/hangmethod';
import { getMeatColourBindings } from '../../../repository/meatcolour';
import { getFatColourBindings } from '../../../repository/fatcolour';
import { getGradeCodeBindings } from '../../../repository/gradecode';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { createAudit, updateAudit } from '../common';
import { getTagStatus, updateTag } from '../../../repository/tag';
import { createLivestockCarcass } from '../../../repository/livestockcarcass';
import {
    getLivestockByCondition, getLatestLivestockPropertyHistory, updateLivestock, bulkCreateLivestockEvent,
    bulkCreateLivestockStatusHistory, bulkCreateMobCountHistory
} from '../../../repository/livestock';

let getDDLData = (language, topPIC) => {
    let responseData = null;
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getDentitionBindings(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (result) {
        responseData = { dentition: result };
        return getCarcassCategoryBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.carcasscategory = result;
        return getButtShapeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.buttshape = result;
        return getBoningGroupBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.boninggroup = result;
        return getMSAGraderBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.msagrader = result;
        return getHangMethodBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.hangmethod = result;
        return getMeatColourBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.meatcolour = result;
        return getFatColourBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.fatcolour = result;
        return getGradeCodeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.gradecode = result;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getCarcassObj = (obj) => {
    return {
        LivestockId: uuidToBuffer(obj.livestock.Id),
        LivestockCount: obj.livestockcount || 1,
        FromBodyNumber: obj.frombodynumber,
        ToBodyNumber: obj.tobodynumber,
        ProcessedDate: obj.processeddate,
        ProcessedTime: obj.processedtime,
        LotNumber: obj.lotnumber,
        ChainNumber: obj.chainnumber,
        OperatorNumber: obj.operatornumber,
        ProcessedPropertyId: obj.ProcessedPICId ? uuidToBuffer(obj.ProcessedPICId) : null,
        ProcessedPIC: obj.ProcessedPIC,
        CarcassWeight: obj.carcassweight || 0,
        FatThickness: obj.fatthickness || 0,
        RibFatness: obj.ribfatness || 0,
        RumpFatThickness: obj.rumpfatthickness || 0,
        DentitionId: obj.dentition ? uuidToBuffer(obj.dentition) : null,
        LiveCarcassWeight: obj.livecarcassweight || 0,
        HotStandardCarcassWeight: obj.hotstandardcarcassweight || 0,
        BruiseScore: obj.bruisescore || 0,
        CarcassCategoryId: obj.carcasscategory ? uuidToBuffer(obj.carcasscategory) : null,
        ButtShapeId: obj.buttshape ? uuidToBuffer(obj.buttshape) : null,
        EQSReference: obj.eqsreference || 0,
        ProducerLicenseNumber: obj.producerlicensenumber,
        MSAStartCode: obj.msastartcode,
        BoningGroupId: obj.boninggroup ? uuidToBuffer(obj.boninggroup) : null,
        MSAGraderId: obj.msagrader ? uuidToBuffer(obj.msagrader) : null,
        GradeDate: obj.gradedate,
        LeftSideScanTime: obj.leftsidescantime,
        RightSideScanTime: obj.rightsidescantime,
        HangMethodId: obj.hangmethod ? uuidToBuffer(obj.hangmethod) : null,
        HGP: obj.hgp,
        LeftSideHSCW: obj.leftsidehscw || 0,
        RightSideHSCW: obj.rightsidehscw || 0,
        Brand: obj.brand,
        PriceKG: obj.brand || 0,
        Dest: obj.dest,
        VersionOfMSAModel: obj.versionofmsamodel,
        TropicalBreedContent: obj.tropicalbreedcontent,
        HumpCold: obj.humpcold,
        EyeMuscleArea: obj.eyemusclearea,
        Ossification: obj.ossification,
        AUSMarbling: obj.ausmarbling,
        MSAMarbling: obj.msamarbling,
        MeatColourId: obj.meatcolour ? uuidToBuffer(obj.meatcolour) : null,
        FatMuscle: obj.fatmuscle,
        FatColourId: obj.fatcolour ? uuidToBuffer(obj.fatcolour) : null,
        FatDepth: obj.fatdepth || 0,
        pH: obj.pH || 0,
        LoinTemperature: obj.lointemperature || 0,
        Cost: obj.cost || 0,
        IsMilkFedVealer: obj.ismilkfedvealer || 0,
        IsRinse: obj.isrinse || 0,
        HumpHeight: obj.humpheight || 0,
        IsMSASaleyard: obj.ismsasaleyard || 0,
        IsRIB: obj.isrib || 0,
        FeedType: obj.feedtype,
        DressingPercentage: obj.dressingpercentage || 0,
        RetailProductYield: obj.retailproductyield || 0,
        Disease: obj.disease,
        GradeCodeId: obj.gradecode ? uuidToBuffer(obj.gradecode) : null,
        IsGrassSeed: obj.isgrassseed || 0,
        IsArthritis: obj.isarthritis || 0,
        IsDeleted: false
    }
}

let recordCarcass = (contactId, language, recordCarcassValues) => {
    let carcassObj = getCarcassObj(recordCarcassValues);
    let createAuditIds = [], updateAuditIds = [], bulkLivestockEvents = [], bulkMobCountHistory = [],
        bulkStatusHistory = [], killedStatus = null, livestockCondition = null, updateTagObj = null,
        updateLivestockObj = null;
    let carcassId = newUUID();
    let carcassAuditId = newUUID();
    carcassObj.UUID = carcassId;
    carcassObj.Id = uuidToBuffer(carcassId);
    carcassObj.AuditLogId = uuidToBuffer(carcassAuditId);
    createAuditIds.push(carcassAuditId);

    return getAllActivityStatus({ Language: language }).then(function (res) {
        killedStatus = res.filter((status) => {
            return status.SystemCode == livestockActivityStatusCodes.Killed;
        })[0].Id;


        if (recordCarcassValues.livestock.IsMob == 1) {
            if (recordCarcassValues.livestock.NumberOfHead == carcassObj.LivestockCount) {
                updateLivestockObj = { ActivityStatusId: uuidToBuffer(killedStatus), NumberOfHead: 0 };
            }
            else {
                updateLivestockObj = {
                    NumberOfHead: recordCarcassValues.livestock.NumberOfHead - carcassObj.LivestockCount < 0 ? 0 :
                        recordCarcassValues.livestock.NumberOfHead - carcassObj.LivestockCount
                };
            }
        }
        if (recordCarcassValues.livestock.IsMob == 0) {
            updateLivestockObj = { ActivityStatusId: uuidToBuffer(killedStatus), NumberOfHead: 1 };
        }

        updateAuditIds.push(recordCarcassValues.livestock.AuditLogId);

        let select = `t.AuditLogId as TagAuditLogId, t.UUID AS TagId, la.ScanDate, l.InductionDate`;
        let join = ` left join tag t on t.Id = l.CurrentTagId
                     left join livestockattribute la on la.LivestockId = l.Id`;
        let where = ` l.UUID = '${recordCarcassValues.livestock.Id}' `;

        return getLivestockByCondition(where, join, select);
    }).then(function (livestockRes) {
        if (livestockRes.length < 1) {
            throw new Error('No Livestock found.');
        }

        livestockCondition = livestockRes[0];
        if (livestockCondition.ScanDate && isBefore(livestockCondition.ScanDate, carcassObj.ProcessedDate)) {
            return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1133');
        }
        if (livestockCondition.InductionDate && isBefore(livestockCondition.InductionDate, carcassObj.ProcessedDate)) {
            return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1133');
        }

        let condition = `p.LivestockId = fn_UuidToBin('${recordCarcassValues.livestock.Id}') 
                         AND p.PropertyId = fn_UuidToBin('${recordCarcassValues.topPIC.PropertyId}')`;
        return getLatestLivestockPropertyHistory(condition);
    }).then(function (res) {
        if (res.length > 0) {
            if (res[0].EntryDate && isBefore(res[0].EntryDate, carcassObj.ProcessedDate)) {
                return getResponse(HttpStatus.BAD_REQUEST, 'VALIDATION.1133');
            }
        }

        // Livestock Event
        let reference = '';
        recordCarcassValues.livestock.IsMob == 1 ?
            reference = `FromBody: ${carcassObj.FromBodyNumber}, ToBody: ${carcassObj.ToBodyNumber}` :
            reference = `BodyNo: ${carcassObj.FromBodyNumber}`;
        let livestockEventObj = LivestockEventMapper(carcassObj.LivestockId, uuidToBuffer(recordCarcassValues.topPIC.PropertyId),
            null, updateLivestockObj.NumberOfHead, eventTypes.RecordCarcass, carcassObj.ProcessedDate,
            recordCarcassValues.gps, reference);
        createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
        bulkLivestockEvents.push(livestockEventObj.LivestockEvent);

        // Mob count history
        if (recordCarcassValues.livestock.IsMob == 1) {
            let mobCountHistory = MobCountHistoryMapper(carcassObj.LivestockId, uuidToBuffer(recordCarcassValues.topPIC.PropertyId),
                parseInt(carcassObj.LivestockCount) * -1, null, null, livestockEventObj.LivestockEvent.Id);
            bulkMobCountHistory.push(mobCountHistory);
        }

        // status history
        if (recordCarcassValues.livestock.IsMob == 0 || recordCarcassValues.livestock.NumberOfHead == carcassObj.LivestockCount) {            // killed status history for livestock
            let statusHistory = LivestockStatusHistoryMapper(carcassObj.LivestockId,
                uuidToBuffer(recordCarcassValues.topPIC.PropertyId), uuidToBuffer(killedStatus),
                recordCarcassValues.gps, null, livestockEventObj.LivestockEvent.Id);
            bulkStatusHistory.push(statusHistory);
        }
        carcassObj.LivestockEventId = livestockEventObj.LivestockEvent.Id;

        if (livestockCondition.TagId && recordCarcassValues.livestock.IsMob == 0) {
            updateAuditIds.push(livestockCondition.TagAuditLogId);
            return getTagStatus(language);
        }
        else
            return false;
    }).then(function (tagRes) {
        if (tagRes && tagRes.length > 0) {

            let deceasedTagStatus = tagRes.filter((tagStatus) => {
                return tagStatus.SystemCode == tagStatusCodes.Deceased
            })[0].Id

            updateTagObj = {
                CurrentStatusId: deceasedTagStatus
            };
        }
        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(createAuditIds, contactId, t);
            }).then(function () {
                return bulkCreateLivestockEvent(bulkLivestockEvents, t);
            }).then(function () {
                return createLivestockCarcass(carcassObj, t);
            }).then(function () {
                if (bulkStatusHistory.length > 0)
                    return bulkCreateLivestockStatusHistory(bulkStatusHistory, t);
                else
                    return true;
            }).then(function () {
                return updateLivestock(updateLivestockObj, { UUID: recordCarcassValues.livestock.Id }, t);
            }).then(function () {
                if (bulkMobCountHistory.length > 0)
                    return bulkCreateMobCountHistory(bulkMobCountHistory, t);
                else
                    return true;
            }).then(function () {
                if (updateTagObj) {
                    return updateTag(updateTagObj, { UUID: livestockCondition.TagId }, t);
                }
                else return true;
            });
        });
    }).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    getCarcassDDLData: Promise.method(getDDLData),
    recordCarcass: Promise.method(recordCarcass)
}