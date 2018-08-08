'use strict';

/***********************************
 * logic related to update delivery of e-NVD
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { HttpStatus, getResponse, resMessages } from '../../../lib/index';

import { createAudit, updateAudit } from '../common';
import { sendNVDNotificationEmail } from './mail-notification';
import { recordDeceased } from '../livestock/record-deceased';
import { createLivestock } from '../livestock/new-livestock';
import { getAllNVDActivityStatus } from '../../../repository/nvdstatus';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { updateModel, createNVDStatusHistory, bulkCreateNVDLivestock } from '../../../repository/envd';
import { bulkCreateEnclosure } from '../../../repository/enclosure';
import {
    getLatestLivestockPropertyHistory, updateLivestock as updateLivestockData, bulkCreateLivestockEvent,
    bulkCreateLivestockStatusHistory, bulkCreateMobCountHistory, bulkCreateLivestockEnclosureHistory,
    bulkCreateLivestockPropertyHistory, getLatestLivestockEnclosureHistory
} from '../../../repository/livestock';

import {
    LivestockEventMapper, LivestockStatusHistoryMapper, LivestockPropertyHistoryMapper,
    LivestockEnclosureHistoryMapper, MobCountHistoryMapper
} from '../../../schema/mapper';
import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import {
    nvdStatusCodes, livestockActivityStatusCodes, eventTypes, nvdImportTypes,
    varianceTypes
} from '../../../../shared/constants';

let updateDelivery = (obj, nvdDetails, language, contactId) => {
    let createAuditIds = [], updateAuditIds = [], newEnclosureId = newUUID(), bulkEnclosure = [],
        updatetatus, statusHistoryObj, availableStatus, updateObj, updateLivestockObj, livestockConditionArr = [],
        livestockIds = [], bulkLivestockEvents = [], bulkStatusHistory = [], bulkPropertyHistory = [],
        bulkMobCountHistory = [], bulkEnclosureHistory = [], currPropertyHistory, currEnclosureHistory,
        updatePropertyHistory = [], updatePropertyHistoryCondition = [], updateNVDLivestock = [],
        updateEnclosureHistory = [], updateEnclosureHistoryCondition = [], updateNVDLivestockCondition = [],
        updateLivestock = [], updateLivestockCondition = [], deceaseObj, inductionObjs = [],
        deceaseLivestockIds = [], bulkNVDLivestockData = [], updateNVDSummary, summarydata;

    updateAuditIds.push(nvdDetails.AuditLogId);

    return getAllNVDActivityStatus({ Language: language }).then(function (res) {
        updatetatus = res.filter((status) => {
            return nvdStatusCodes.Delivered == status.SystemCode;
        })[0];
        return getAllActivityStatus({ Language: language });
    }).then(function (res) {
        availableStatus = res.filter((status) => {
            return status.SystemCode == livestockActivityStatusCodes.Available;
        })[0].Id;

        // update nvd table
        updateObj = {
            DateOfDelivery: obj.deliverydate,
            DeliveredLivestockQty: obj.deliveryLivestockNumber,
            SuspectQty: obj.suspectQuantity || 0,
            CondemnedQty: obj.condemnedQuantity || 0,
            WelfareActivityNote: obj.welfareactivity,
            WelfareActivityTime: obj.welfareactivitytime,
            DeliveredEnclosureId: obj.isNewEnclosure ? uuidToBuffer(newEnclosureId) : uuidToBuffer(obj.enclosure),
            DeliveredEnclosureName: obj.enclosurename,
            DeliveredAtGPS: obj.gps,
            LastNVDStatusId: uuidToBuffer(updatetatus.Id)
        };

        // nvd status history
        let statusId = newUUID();
        let statusAuditId = newUUID();
        createAuditIds.push(statusAuditId);
        statusHistoryObj = {
            Id: uuidToBuffer(statusId),
            UUID: statusId,
            NVDId: uuidToBuffer(nvdDetails.Id),
            NVDStatusId: uuidToBuffer(updatetatus.Id),
            EventDate: new Date(),
            AuditLogId: uuidToBuffer(statusAuditId)
        }

        // create new enclosure
        if (obj.isNewEnclosure) {
            let enclosureAuditId = newUUID();
            createAuditIds.push(enclosureAuditId);
            let enclosureObj = {
                Id: uuidToBuffer(newEnclosureId),
                UUID: newEnclosureId,
                EnclosureTypeId: obj.enclosuretype ? uuidToBuffer(obj.enclosuretype) : null,
                PropertyId: uuidToBuffer(nvdDetails.DestinationPropertyId),
                Name: obj.enclosurename,
                DefaultGPS: obj.gps,
                AuditLogId: uuidToBuffer(enclosureAuditId)
            }
            bulkEnclosure.push(enclosureObj);
        }

        // update livestock table data
        updateLivestockObj = {
            CurrentPropertyId: uuidToBuffer(nvdDetails.DestinationPropertyId),
            CurrentEnclosureId: obj.isNewEnclosure ? uuidToBuffer(newEnclosureId) : uuidToBuffer(obj.enclosure),
            DefaultGPS: obj.gps,
            ActivityStatusId: uuidToBuffer(availableStatus)
        }

        nvdDetails.NVDLivestocks.forEach(function (element) {
            livestockConditionArr.push(`fn_UuidToBin('${bufferToUUID(element.LivestockId)}')`);
            livestockIds.push(bufferToUUID(element.LivestockId));
        }, this);
        return getLatestLivestockPropertyHistory(`p.LivestockId IN (${livestockConditionArr.join()})`);
    }).then(function (res) {
        currPropertyHistory = res;
        return getLatestLivestockEnclosureHistory(`en.LivestockId IN (${livestockConditionArr.join()})`);
    }).then(function (res) {
        currEnclosureHistory = res;

        let reference = `eNVD Number: ${nvdDetails.ReferenceNumber}, Delivered to PIC: ${nvdDetails.DestinationPIC}`;
        nvdDetails.NVDLivestocks.forEach(function (element, index) {
            let livestockEventObj = LivestockEventMapper(new Buffer(element.LivestockId), uuidToBuffer(nvdDetails.DestinationPropertyId),
                updateObj.DeliveredEnclosureId, element.NumberOfHead, eventTypes.eNVDDelivery, obj.deliverydate,
                obj.gps, reference);
            createAuditIds.push(livestockEventObj.LivestockEvent_AuditLogId);
            bulkLivestockEvents.push(livestockEventObj.LivestockEvent);

            // status history
            let statusHistory = LivestockStatusHistoryMapper(new Buffer(element.LivestockId),
                uuidToBuffer(nvdDetails.DestinationPropertyId), uuidToBuffer(availableStatus),
                obj.gps, null, livestockEventObj.LivestockEvent.Id);
            bulkStatusHistory.push(statusHistory);

            // get current property history obj for livestock
            let currPropertyHistoryObj = currPropertyHistory.filter((ele, i) => {
                return bufferToUUID(ele.LivestockId) == bufferToUUID(element.LivestockId);
            })[0];

            // update current property history
            let updatePropHisoryObj = {
                ExitDate: obj.deliverydate,
                ExitWeight: currPropertyHistoryObj.EntryWeight,
                LivestockExitEventId: livestockEventObj.LivestockEvent.Id
            }
            updatePropertyHistory.push(updatePropHisoryObj);
            updatePropertyHistoryCondition.push({ UUID: currPropertyHistoryObj.UUID });
            updateAuditIds.push(currPropertyHistoryObj.AuditLogId);

            // property history
            let propertyHistory = LivestockPropertyHistoryMapper(new Buffer(element.LivestockId),
                uuidToBuffer(nvdDetails.DestinationPropertyId), currPropertyHistoryObj.EntryWeight,
                obj.deliverydate, currPropertyHistoryObj.CostOfFeed, livestockEventObj.LivestockEvent.Id);
            bulkPropertyHistory.push(propertyHistory);

            // get current enclosure history obj for livestock
            let currEnclosureHistoryObj = currEnclosureHistory.filter((ele, i) => {
                return bufferToUUID(ele.LivestockId) == bufferToUUID(element.LivestockId);
            });
            if (currEnclosureHistoryObj.length > 0) {
                currEnclosureHistoryObj = currEnclosureHistoryObj[0];
                // update current enclosure history
                let updateEnclHisoryObj = {
                    ExitDate: obj.deliverydate,
                    ExitWeight: currEnclosureHistoryObj.EntryWeight
                }
                updateEnclosureHistory.push(updateEnclHisoryObj);
                updateEnclosureHistoryCondition.push({ UUID: currEnclosureHistoryObj.UUID });
                updateAuditIds.push(currEnclosureHistoryObj.AuditLogId);
            }

            // enclosure history
            let enclosureHistory = LivestockEnclosureHistoryMapper(new Buffer(element.LivestockId),
                uuidToBuffer(nvdDetails.DestinationPropertyId), updateObj.DeliveredEnclosureId,
                currPropertyHistoryObj.EntryWeight, obj.deliverydate, livestockEventObj.LivestockEvent.Id);
            bulkEnclosureHistory.push(enclosureHistory);

            if (nvdDetails.IsMobNVD) {
                // mob count history for old property
                let mobCountHistory = MobCountHistoryMapper(new Buffer(element.LivestockId), new Buffer(currPropertyHistoryObj.PropertyId),
                    parseInt(element.NumberOfHead) * -1, null, null, livestockEventObj.LivestockEvent.Id);
                bulkMobCountHistory.push(mobCountHistory);

                // mob count history for new property (condition if there is variance in delivered qty)
                if (obj.isVarianceQty && index == 0) {
                    let mobNewCountHistory = MobCountHistoryMapper(new Buffer(element.LivestockId),
                        uuidToBuffer(nvdDetails.DestinationPropertyId), parseInt(element.NumberOfHead) + parseInt(obj.varianceQty),
                        null, null, livestockEventObj.LivestockEvent.Id);
                    bulkMobCountHistory.push(mobNewCountHistory);
                    updateNVDLivestock.push({ DeliveredCount: mobNewCountHistory.LivestockCount, IsDelivered: 1 });
                    updateNVDLivestockCondition.push({ UUID: element.UUID });

                    updateLivestock.push({ NumberOfHead: parseInt(element.NumberOfHead) + parseInt(obj.varianceQty) });
                    updateLivestockCondition.push({ Id: new Buffer(element.LivestockId) });
                }
                else {
                    let mobNewCountHistory = MobCountHistoryMapper(new Buffer(element.LivestockId),
                        uuidToBuffer(nvdDetails.DestinationPropertyId), parseInt(element.NumberOfHead),
                        null, null, livestockEventObj.LivestockEvent.Id);
                    bulkMobCountHistory.push(mobNewCountHistory);
                    updateNVDLivestock.push({ DeliveredCount: mobNewCountHistory.LivestockCount, IsDelivered: 1 });
                    updateNVDLivestockCondition.push({ UUID: element.UUID });
                }
            }
            else {
                // for livestock NVD
                if (obj.popupData && obj.popupData.additionalData &&
                    obj.popupData.additionalData.varianceType == varianceTypes.Less) {
                    obj.popupData.additionalData.deceaseLivestock.forEach(function (element) {
                        deceaseLivestockIds.push(element.Id);
                    }, this);
                    if (deceaseLivestockIds.indexOf(element.UUID) == -1) {
                        updateNVDLivestock.push({ IsDelivered: 1 });
                        updateNVDLivestockCondition.push({ UUID: element.UUID });
                    }
                }
                else {
                    updateNVDLivestock.push({ IsDelivered: 1 });
                    updateNVDLivestockCondition.push({ UUID: element.UUID });
                }
            }
        }, this);

        if (obj.popupData) {
            if (obj.popupData.additionalData) {
                if (obj.popupData.additionalData.varianceType == varianceTypes.Less) {
                    deceaseObj = {
                        isMob: false,
                        eventGps: obj.gps,
                        propertyId: nvdDetails.DestinationPropertyId,
                        livestockIds: deceaseLivestockIds,
                        shouldPostNlis: false
                    }
                }
                else {
                    obj.popupData.additionalData.inductLivestock.forEach(function (element) {
                        let livestockId = newUUID();
                        let inductionObj = {
                            type: '1',
                            existLivestockId: livestockId,
                            species: bufferToUUID(nvdDetails.SpeciesId),
                            livestockidentifier: obj.popupData.identifier,
                            identifier: element,
                            inductionGPS: obj.gps,
                            inductiondate: obj.deliverydate,
                            enclosurename: bufferToUUID(updateObj.DeliveredEnclosureId), // uuid
                            topPIC: {
                                PropertyId: nvdDetails.DestinationPropertyId
                            }
                        }
                        inductionObjs.push(inductionObj);

                        let nvdLivestockId = newUUID();
                        let nvdLivestockObj = {
                            Id: uuidToBuffer(nvdLivestockId),
                            UUID: nvdLivestockId,
                            NVDId: uuidToBuffer(nvdDetails.Id),
                            NVDLivestockSummaryId: new Buffer(nvdDetails.NVDLivestockSummary[0].Id),
                            LivestockId: uuidToBuffer(livestockId),
                            NumberOfHead: 1,
                            IsDelivered: 1
                        }
                        bulkNVDLivestockData.push(nvdLivestockObj);
                    }, this);
                    updateNVDSummary = {
                        NumberOfHead: nvdDetails.NVDLivestockSummary[0].NumberOfHead +
                        obj.popupData.additionalData.inductLivestock.length
                    }
                    updateAuditIds.push(nvdDetails.NVDLivestockSummary[0].AuditLogId);
                    nvdDetails.NVDLivestockSummary[0].NumberOfHead = nvdDetails.NVDLivestockSummary[0].NumberOfHead +
                        obj.popupData.additionalData.inductLivestock.length
                }
            }
            else {
                throw new Error('Data not available for variance quantity.');
            }
        }

        nvdDetails.NVDLivestockSummary.forEach(function (element) {
            summarydata += `<tr style="border-bottom: 1px solid #000;">
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle; width: 40%;">
                    ${element.Description || ''}
			</td>
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle;">
                    ${element.NumberOfHead || 1}
			</td>
            </tr>`;
        }, this);

        var notificationObj1 = {
            ReferenceNumber: nvdDetails.ReferenceNumber,
            TotalLivestockQty: nvdDetails.TotalLivestockQty,
            VehicleRego: nvdDetails.VehicleRego
        }

        var notificationObj2 = {
            nvdId: nvdDetails.Id,
            NVDType: nvdDetails.NVDType,
            prepare_livestock: {
                selectedSpeices: {
                    SpeciesName: nvdDetails.SpeciesName
                },
                ownerOfLivestock: nvdDetails.ConsignerPropertyName,
                ConsignedFromPIC: nvdDetails.ConsignerPIC,
                journeyCommencedAddress: nvdDetails.ConsignerPropertyAddress,
                suburb: {
                    suburbName: nvdDetails.ConsignerSuburbName,
                    stateName: nvdDetails.ConsignerStateName,
                    suburbPostCode: nvdDetails.ConsignerPostCode
                },
                ConsignedFromPICId: bufferToUUID(nvdDetails.ConsignerPropertyId)
            },
            consignor_declaration: {
                acknowledgedate: nvdDetails.DeclarerAcknowledgedDate,
                declarerFirstName: nvdDetails.DeclarerFirstName,
                declarerLastName: nvdDetails.DeclarerLastName,
                declarerMobile: nvdDetails.DeclarerMobile,
                declarerEmail: nvdDetails.DeclarerEmail,

            },
            transporter: {
                transporterEmail: nvdDetails.TransporterEmail,
                transporterCompanyName: nvdDetails.TransporterCompanyName,
                transporterDriverName: nvdDetails.TransporterDriverName,
                transporterMobile: nvdDetails.TransporterMobile
            },
            sale_agent: {
                saleAgentCompanyName: nvdDetails.SaleAgentCompanyName,
                saleAgentMobile: nvdDetails.SaleAgentMobile,
                saleAgentEmail: nvdDetails.SaleAgentEmail
            },
            consigned_to_property: {
                ConsignedToPIC: nvdDetails.ConsigneePIC,
                consignedtoAddress: nvdDetails.ConsigneePropertyAddress,
                consignedtoSuburbData: {
                    suburbName: nvdDetails.ConsigneeSuburbName,
                    stateName: nvdDetails.ConsigneeStateName,
                    suburbPostCode: nvdDetails.ConsigneePostCode
                },
                DestinationPIC: nvdDetails.DestinationPIC,
                destinationAddress: nvdDetails.DestinationPropertyAddress,
                destinationSuburbData: {
                    suburbName: nvdDetails.DestinationSuburbName,
                    stateName: nvdDetails.DestinationStateName,
                    suburbPostCode: nvdDetails.DestinationPostCode
                },
                consignedtoEmail: nvdDetails.ConsigneeEmail,
                destinationEmail: nvdDetails.DestinationEmail,
                ConsignedToPICId: bufferToUUID(nvdDetails.ConsigneePropertyId)
            }
        }

        return models.sequelize.transaction(function (t) {
            return updateAudit(updateAuditIds, [], contactId, t).then(function () {
                return createAudit(createAuditIds, contactId, t);
            }).then(function () {
                if (bulkEnclosure.length > 0)
                    return bulkCreateEnclosure(bulkEnclosure, t);
                else return true;
            }).then(function () {
                return updateModel(updateObj, 'nvd', { UUID: nvdDetails.Id }, t);
            }).then(function () {
                return createNVDStatusHistory(statusHistoryObj, t);
            }).then(function () {
                return updateLivestockData(updateLivestockObj, { UUID: livestockIds }, t);
            }).then(function () {
                if (updateLivestock.length > 0) {
                    let livestockPromises = [];
                    updateLivestock.forEach(function (element, i) {
                        livestockPromises.push(updateLivestockData(element, updateLivestockCondition[i], t));
                    }, this);
                    return Promise.all(livestockPromises);
                }
                else return true;
            }).then(function () {
                return bulkCreateLivestockEvent(bulkLivestockEvents, t);
            }).then(function () {
                return bulkCreateLivestockStatusHistory(bulkStatusHistory, t);
            }).then(function () {
                if (updatePropertyHistory.length > 0) {
                    let propertyHistoryPromises = [];
                    updatePropertyHistory.forEach(function (element, i) {
                        propertyHistoryPromises.push(updateModel(element, 'livestockpropertyhistory',
                            updatePropertyHistoryCondition[i], t));
                    }, this);
                    return Promise.all(propertyHistoryPromises);
                }
                else return true;
            }).then(function () {
                if (updateEnclosureHistory.length > 0) {
                    let propertyEnclosurePromises = [];
                    updateEnclosureHistory.forEach(function (element, i) {
                        propertyEnclosurePromises.push(updateModel(element, 'livestockenclosurehistory',
                            updateEnclosureHistoryCondition[i], t));
                    }, this);
                    return Promise.all(propertyEnclosurePromises);
                }
                else return true;
            }).then(function () {
                return bulkCreateLivestockPropertyHistory(bulkPropertyHistory, t);
            }).then(function () {
                return bulkCreateLivestockEnclosureHistory(bulkEnclosureHistory, t);
            }).then(function () {
                if (bulkMobCountHistory.length > 0)
                    return bulkCreateMobCountHistory(bulkMobCountHistory, t);
                else return true;
            }).then(function () {
                if (updateNVDLivestock.length > 0) {
                    let updateNVDLivestockPromises = [];
                    updateNVDLivestock.forEach(function (element, i) {
                        updateNVDLivestockPromises.push(updateModel(element, 'nvd_livestock',
                            updateNVDLivestockCondition[i], t));
                    }, this);
                    return Promise.all(updateNVDLivestockPromises);
                }
                else return true;
            }).then(function () {
                if (deceaseObj) {
                    return recordDeceased(contactId, language, deceaseObj, t, false);
                }
                else return true;
            }).then(function () {
                if (inductionObjs.length > 0) {
                    let inductionPromises = [];
                    inductionObjs.forEach(function (element) {
                        inductionPromises.push(createLivestock(element, language, contactId, t));
                    }, this);
                    return Promise.all(inductionPromises);
                }
                else return true;
            }).then(function () {
                if (bulkNVDLivestockData.length > 0) {
                    return bulkCreateNVDLivestock(bulkNVDLivestockData, t);
                }
                else return true;
            }).then(function () {
                if (updateNVDSummary) {
                    return updateModel(updateNVDSummary, 'nvd_livestocksummary',
                        { Id: new Buffer(nvdDetails.NVDLivestockSummary[0].Id) }, t);
                }
                else return true;
            }).then(function () {
                return sendNVDNotificationEmail(notificationObj1, notificationObj2, updatetatus, summarydata, contactId, language);
            });
        });
    }).then(function () {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    updateDelivery: Promise.method(updateDelivery)
}