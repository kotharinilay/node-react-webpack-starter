'use strict';

/***********************************
 * logic related to new e-NVD
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { sumBy as _sumBy } from 'lodash';

import { createAudit, updateAudit, deleteFile, uploadFile, removeFileStorage } from '../common';
import { sendNVDNotificationEmail } from './mail-notification';
import { getAllNVDActivityStatus } from '../../../repository/nvdstatus';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { getLivestockByCondition, updateLivestock } from '../../../repository/livestock';
import { createLivestock } from '../livestock/new-livestock';
import { bulkCreateFileStorage } from '../../../repository/filestorage';
import {
    createNVD as createNewNVD, createNVDDetail, bulkCreateNVDLivestockSummary, bulkCreateNVDLivestock,
    bulkCreateNVDLPAQuestionnaire, bulkCreateNVDAccreditaionQuestionnaire, bulkCreateNVDDocument,
    createNVDStatusHistory, bulkCreateNVDAccreditation
} from '../../../repository/envd';
import { AccreditationQuestionObj } from '../../../schema/mapper';

import { deleteServerFile } from '../file-middleware';
import { HttpStatus, getResponse, resMessages } from '../../../lib/index';
import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import { currentDateTime } from '../../../../shared/format/date';
import { nvdStatusCodes, livestockActivityStatusCodes } from '../../../../shared/constants';

let createNVD = (nvdObj, language, contactId) => {
    let nvdId = newUUID(), nvdAuditId = newUUID();
    let createAuditIds = [], updateAuditIds = [], nvdStatusData, livestockStatusData, updatetatus, updateLivestockStatus,
        bulkNVDLivestockData = [], bulkNVDLivestockSummaryData = [], livestocks, inductionObj, nvdSaveObj, nvdDetailObj,
        fileUploads = [], fileDelete = [], bulkNVDLPAData = [], bulkNVDAccreditationData = [], bulkNVDDocumentData = [],
        bulkFilestorageData = [], statusHistoryObj, updateLivestockIds = [], summarydata = '';
    nvdObj.nvdId = nvdId;
    nvdObj.NVDType = nvdObj.storeData.nvdType;
    return getAllNVDActivityStatus({ Language: language }).then(function (res) {
        nvdStatusData = res;
        return getAllActivityStatus({ Language: language });
    }).then(function (res) {
        livestockStatusData = res;
        // decide update status
        if (nvdObj.transporter.acknowledged) {
            updatetatus = nvdStatusData.filter((status) => {
                return nvdStatusCodes.InTransit == status.SystemCode;
            })[0];
            updateLivestockStatus = livestockStatusData.filter((status) => {
                return livestockActivityStatusCodes.InTransit == status.SystemCode;
            })[0];
        }
        else if (nvdObj.transporter.transporterFirstName || nvdObj.transporter.transporterContact) {
            updatetatus = nvdStatusData.filter((status) => {
                return nvdStatusCodes.Pending == status.SystemCode;
            })[0];
            updateLivestockStatus = livestockStatusData.filter((status) => {
                return livestockActivityStatusCodes.PrepareForMove == status.SystemCode;
            })[0];
        }
        else {
            updatetatus = nvdStatusData.filter((status) => {
                return nvdStatusCodes.Draft == status.SystemCode;
            })[0];
            updateLivestockStatus = livestockStatusData.filter((status) => {
                return livestockActivityStatusCodes.Available == status.SystemCode;
            })[0];
        }

        nvdSaveObj = {
            Id: uuidToBuffer(nvdId),
            UUID: nvdId,
            ReferenceNumber: nvdObj.prepare_livestock.ConsignedFromPIC + currentDateTime().YYYYMMDDHHMM,
            IsPaperNVD: nvdObj.consignor_declaration.papernvdnumber ? 1 : 0,
            PaperNVDNumber: nvdObj.consignor_declaration.papernvdnumber,
            SpeciesId: uuidToBuffer(nvdObj.prepare_livestock.species),
            NVDType: nvdObj.storeData.nvdType,
            MLASchemaVersion: nvdObj.storeData.mlaSchemaVersion,
            MLAApiVersion: nvdObj.storeData.mlaAPIVersion,
            IsMobNVD: nvdObj.prepare_livestock.IsMobNVD,
            TotalLivestockQty: _sumBy(nvdObj.prepare_livestock.livestockSummaryData, function (f) {
                if (f.IsMob == 1 || f.IsMob == true) {
                    return f.NumberOfHead;
                }
                else {
                    return 1;
                }
            }),
            NumberOfRumenDevices: nvdObj.prepare_livestock.numberOfRumens || 0,
            NumberOfEarTags: nvdObj.prepare_livestock.numberOfEarTags || 0,
            NumberOfEID: nvdObj.prepare_livestock.numberOfEIDs || 0,
            VehicleRego: nvdObj.transporter.transporterVehicleRegoNumber,
            AdditionalVehicleRego: nvdObj.transporter.transporterAddVehicleRegoNumber,
            MovementCommenceDate: nvdObj.transporter.movementCommenceDate,
            SaleAgentCode: nvdObj.sale_agent.saleAgentCode,
            SaleAgentVendorCode: nvdObj.sale_agent.saleAgentVendorCode,
            LastNVDStatusId: uuidToBuffer(updatetatus.Id),
            SupportedAccreditations: nvdObj.questionnaire.SupportedAccreditations.length > 0 ?
                nvdObj.questionnaire.SupportedAccreditations.join() : nvdObj.questionnaire.SupportedAccreditations,
            AuditLogId: uuidToBuffer(nvdAuditId)
        }
        createAuditIds.push(nvdAuditId);

        let nvdDetailId = newUUID();
        let lpaAuditId = newUUID();
        createAuditIds.push(lpaAuditId);

        if (nvdObj.consignor_declaration.signatureObj && nvdObj.consignor_declaration.signatureObj.file) {
            nvdObj.consignor_declaration.signatureObj.fileId = newUUID();
            nvdObj.consignor_declaration.signatureObj.additionalPath = 'Signatures';
            nvdObj.consignor_declaration.signatureObj.category = 'declarer';
            fileUploads.push(nvdObj.consignor_declaration.signatureObj);
        }
        if (nvdObj.transporter.signatureObj && nvdObj.transporter.signatureObj.file) {
            nvdObj.transporter.signatureObj.fileId = newUUID();
            nvdObj.transporter.signatureObj.additionalPath = 'Signatures';
            nvdObj.transporter.signatureObj.category = 'transporter';
            fileUploads.push(nvdObj.transporter.signatureObj);
        }
        if (nvdObj.sale_agent.signatureObj && nvdObj.sale_agent.signatureObj.file) {
            nvdObj.sale_agent.signatureObj.fileId = newUUID();
            nvdObj.sale_agent.signatureObj.additionalPath = 'Signatures';
            nvdObj.sale_agent.signatureObj.category = 'saleagent';
            fileUploads.push(nvdObj.sale_agent.signatureObj);
        }

        nvdDetailObj = {
            Id: uuidToBuffer(nvdDetailId),
            UUID: nvdDetailId,
            NVDId: nvdSaveObj.Id,

            ConsignerPropertyId: uuidToBuffer(nvdObj.prepare_livestock.ConsignedFromPICId),
            ConsignerPIC: nvdObj.prepare_livestock.ConsignedFromPIC,
            ConsignerPICOwner: nvdObj.prepare_livestock.ownerPIC,
            ConsignerPropertyName: nvdObj.prepare_livestock.ownerOfLivestock,
            ConsignerPropertyAddress: nvdObj.prepare_livestock.journeyCommencedAddress,
            ConsignerPropertySuburbId: nvdObj.prepare_livestock.suburb && nvdObj.prepare_livestock.suburb.suburbId ?
                uuidToBuffer(nvdObj.prepare_livestock.suburb.suburbId) : null,

            ConsigneePropertyId: uuidToBuffer(nvdObj.consigned_to_property.ConsignedToPICId),
            ConsigneePIC: nvdObj.consigned_to_property.ConsignedToPIC,
            ConsigneePropertyName: nvdObj.consigned_to_property.consignedtoPropertyName,
            ConsigneePICOwner: nvdObj.consigned_to_property.consignedtoOwnerOfPIC,
            ConsigneeEmail: nvdObj.consigned_to_property.consignedtoEmail,
            ConsigneeMobile: nvdObj.consigned_to_property.consignedtoMobile,
            ConsigneeFax: nvdObj.consigned_to_property.consignedtoFax,
            ConsigneePropertyAddress: nvdObj.consigned_to_property.consignedtoAddress,
            ConsigneePropertySuburbId: nvdObj.consigned_to_property.consignedtoSuburbData && nvdObj.consigned_to_property.consignedtoSuburbData.suburbId ?
                uuidToBuffer(nvdObj.consigned_to_property.consignedtoSuburbData.suburbId) : null,

            DeclarerContactId: nvdObj.consignor_declaration.declarerContact ? uuidToBuffer(nvdObj.consignor_declaration.declarerContact) : null,
            DeclarerFirstName: nvdObj.consignor_declaration.declarerFirstName,
            DeclarerLastName: nvdObj.consignor_declaration.declarerLastName,
            DeclarerCompanyName: nvdObj.consignor_declaration.declarerCompanyName,
            DeclarerAddress: nvdObj.consignor_declaration.declarerAddress,
            DeclarerSuburbId: nvdObj.consignor_declaration.declarerSuburbData && nvdObj.consignor_declaration.declarerSuburbData.suburbId ?
                uuidToBuffer(nvdObj.consignor_declaration.declarerSuburbData.suburbId) : null,
            DeclarerMobile: nvdObj.consignor_declaration.declarerMobile,
            DeclarerTelephone: nvdObj.consignor_declaration.declarerTelephone,
            DeclarerFax: nvdObj.consignor_declaration.declarerFax,
            DeclarerEmail: nvdObj.consignor_declaration.declarerEmail,
            DeclarerSignatureId: nvdObj.consignor_declaration.signatureObj && nvdObj.consignor_declaration.signatureObj.file ?
                uuidToBuffer(nvdObj.consignor_declaration.signatureObj.fileId) : null,
            HasDeclarerAcknowledged: nvdObj.consignor_declaration.acknowledged ? 1 : 0,
            DeclarerAcknowledgedDate: nvdObj.consignor_declaration.acknowledgedate,

            DriveBy: nvdObj.transporter.driveBy,
            TransporterCompanyId: nvdObj.transporter.transporterCompany && nvdObj.transporter.transporterCompany.CompanyId ?
                uuidToBuffer(nvdObj.transporter.transporterCompany.CompanyId) : null,
            TransporterContactId: nvdObj.transporter.transporterContact ?
                uuidToBuffer(nvdObj.transporter.transporterContact) : null,
            TransporterFirstName: nvdObj.transporter.transporterFirstName,
            TransporterLastName: nvdObj.transporter.transporterLastName,
            TransporterCompanyName: nvdObj.transporter.transporterCompanyName ||
                nvdObj.transporter.transporterCompany ? nvdObj.transporter.transporterCompany.CompanyName : null,
            TransporterDriverName: nvdObj.transporter.transporterDriverName,
            TransporterAddress: nvdObj.transporter.transporterAddress,
            TransporterSuburbId: nvdObj.transporter.transporterSuburbData && nvdObj.transporter.transporterSuburbData.suburbId ?
                uuidToBuffer(nvdObj.transporter.transporterSuburbData.suburbId) : null,
            TransporterMobile: nvdObj.transporter.transporterMobile,
            TransporterTelephone: nvdObj.transporter.transporterTelephone,
            TransporterFax: nvdObj.transporter.transporterFax,
            TransporterEmail: nvdObj.transporter.transporterEmail,
            TransporterSignatureId: nvdObj.transporter.signatureObj && nvdObj.transporter.signatureObj.file ?
                uuidToBuffer(nvdObj.transporter.signatureObj.fileId) : null,
            HasTransporterAcknowledged: nvdObj.transporter.acknowledged ? 1 : 0,
            TransporterAcknowledgedDate: nvdObj.transporter.acknowledgedate,

            SaleAgentCompanyId: nvdObj.sale_agent.saleAgentCompany && nvdObj.sale_agent.saleAgentCompany.CompanyId ?
                uuidToBuffer(nvdObj.sale_agent.saleAgentCompany.CompanyId) : null,
            SaleAgentContactId: nvdObj.sale_agent.saleAgentContact ? uuidToBuffer(nvdObj.sale_agent.saleAgentContact) : null,
            SaleAgentFirstName: nvdObj.sale_agent.saleAgentFirstName,
            SaleAgentLastName: nvdObj.sale_agent.saleAgentLastName,
            SaleAgentCompanyName: nvdObj.sale_agent.saleAgentCompanyName,
            SaleAgentAddress: nvdObj.sale_agent.saleAgentAddress,
            SaleAgentSuburbId: nvdObj.sale_agent.saleAgentSuburbData && nvdObj.sale_agent.saleAgentSuburbData.suburbId ?
                uuidToBuffer(nvdObj.sale_agent.saleAgentSuburbData.suburbId) : null,
            SaleAgentMobile: nvdObj.sale_agent.saleAgentMobile,
            SaleAgentTelephone: nvdObj.sale_agent.saleAgentTelephone,
            SaleAgentFax: nvdObj.sale_agent.saleAgentFax,
            SaleAgentEmail: nvdObj.sale_agent.saleAgentEmail,
            SaleAgentSignatureId: nvdObj.sale_agent.signatureObj && nvdObj.sale_agent.signatureObj.file ?
                uuidToBuffer(nvdObj.sale_agent.signatureObj.fileId) : null,
            HasSaleAgentAcknowledged: nvdObj.sale_agent.acknowledged ? 1 : 0,
            SaleAgentAcknowledgedDate: nvdObj.sale_agent.acknowledgedate,

            NVDLPAQuestionnaireAuditLogId: uuidToBuffer(lpaAuditId)
        }

        if (nvdObj.consigned_to_property.isDestinationSame) {
            let destinationPropertyObj = {
                DestinationPropertyId: nvdObj.consigned_to_property.DestinationPICId ?
                    uuidToBuffer(nvdObj.consigned_to_property.DestinationPICId) : null,
                DestinationPIC: nvdObj.consigned_to_property.DestinationPIC,
                DestinationPropertyName: nvdObj.consigned_to_property.destinationPropertyName,
                DestinationPICOwner: nvdObj.consigned_to_property.destinationOwnerOfPIC,
                DestinationEmail: nvdObj.consigned_to_property.destinationEmail,
                DestinationMobile: nvdObj.consigned_to_property.destinationMobile,
                DestinationFax: nvdObj.consigned_to_property.destinationFax,
                DestinationPropertyAddress: nvdObj.consigned_to_property.destinationAddress,
                DestinationPropertySuburbId: nvdObj.consigned_to_property.destinationSuburbData && nvdObj.consigned_to_property.destinationSuburbData.suburbId ?
                    uuidToBuffer(nvdObj.consigned_to_property.destinationSuburbData.suburbId) : null
            }
            Object.assign(nvdDetailObj, destinationPropertyObj);
        }

        // nvd status history
        let statusId = newUUID();
        let statusAuditId = newUUID();
        createAuditIds.push(statusAuditId);
        statusHistoryObj = {
            Id: uuidToBuffer(statusId),
            UUID: statusId,
            NVDId: nvdSaveObj.Id,
            NVDStatusId: uuidToBuffer(updatetatus.Id),
            EventDate: new Date(),
            AuditLogId: uuidToBuffer(statusAuditId)
        }

        if (!nvdObj.prepare_livestock.isNewMob) {
            let getLivestockIds = [];
            nvdObj.prepare_livestock.livestockSummaryData.forEach(function (element) {
                if (element.LivestockId.indexOf(',') != -1) {
                    let livestockArr = element.LivestockId.split(',');
                    livestockArr.forEach(function (ele) {
                        getLivestockIds.push(`'${ele}'`);
                        updateLivestockIds.push(ele);
                    }, this);
                }
                else {
                    getLivestockIds.push(`'${element.LivestockId}'`);
                    updateLivestockIds.push(element.LivestockId);
                }
            });

            let select = `l.UUID AS LivestockId, l.HasLT, l.HasEU, l.NumberOfHead, la.HasERP, la.PICEarTag,
                          la.BrandText, la.EarmarkText`;
            let joins = `LEFT JOIN livestockattribute la ON l.Id = la.LivestockId`;
            let where = `l.UUID IN (${getLivestockIds.join()})`;
            return getLivestockByCondition(where, joins, select);
        }
        else {
            inductionObj = {
                type: '2',
                mob: nvdObj.prepare_livestock.livestockSummaryData[0].Mob,
                existLivestockId: nvdObj.prepare_livestock.livestockSummaryData[0].LivestockId,
                existActivityId: updateLivestockStatus.Id,
                topPIC: {
                    PropertyId: nvdObj.prepare_livestock.ConsignedFromPICId
                },
                livestockquantity: nvdObj.prepare_livestock.livestockSummaryData[0].NumberOfHead,
                species: nvdObj.prepare_livestock.livestockSummaryData[0].SpeciesId
            }
            return false;
        }
    }).then(function (res) {
        if (res)
            livestocks = res;
        else {
            livestocks = nvdObj.prepare_livestock.livestockSummaryData
        }

        // bulk object array of nvd_livestock and nvd_livestocksummary
        nvdObj.prepare_livestock.livestockSummaryData.forEach(function (element, i) {
            let summaryAuditId = newUUID();
            createAuditIds.push(summaryAuditId);
            let NTObj = nvdObj.questionnaire.NT != null && nvdObj.questionnaire.NT.summaryData.length > 0 ?
                nvdObj.questionnaire.NT.summaryData[i] : {};

            let NFASObj = nvdObj.questionnaire.NFAS != null && nvdObj.questionnaire.NFAS.summaryData.length > 0 ?
                nvdObj.questionnaire.NFAS.summaryData[i] : {};

            let SAObj = nvdObj.questionnaire.SA && nvdObj.questionnaire.SA.length > 0 ?
                nvdObj.questionnaire.SA[i] : {};
            if (SAObj.PrefixTattoo) {
                SAObj.PrefixTattoo.fileId = newUUID();
                SAObj.PrefixTattoo.additionalPath = 'Questionnaire';
                SAObj.PrefixTattoo.category = 'prefixtattoo';
                fileUploads.push(SAObj.PrefixTattoo);
            }

            let nvdSummaryObj = {
                Id: uuidToBuffer(element.SummaryId),
                UUID: element.SummaryId,
                NVDId: nvdSaveObj.Id,
                NumberOfHead: element.NumberOfHead || 1,
                Description: element.Description,
                BreedId: element.BreedId ? uuidToBuffer(element.BreedId) : null,
                MaturityId: element.MaturityId ? uuidToBuffer(element.MaturityId) : null,
                GenderId: element.GenderId ? uuidToBuffer(element.GenderId) : null,
                AuditLogId: uuidToBuffer(summaryAuditId),
                NT_Chemical: NTObj.Chemical,
                NT_TreatmentMethod: NTObj.TreatmentMethod,
                NFAS_DentitionId: NFASObj.DentitionId ? uuidToBuffer(NFASObj.DentitionId) : null,
                NFAS_DaysOnFeed: NFASObj.DaysOnFeed,
                SA_PrefixTattooId: SAObj.PrefixTattoo ? uuidToBuffer(SAObj.PrefixTattoo.fileId) : null
            }
            bulkNVDLivestockSummaryData.push(nvdSummaryObj);

            summarydata += `<tr style="border-bottom: 1px solid #000;">
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle; width: 40%;">
                    ${element.Description || ''}
			</td>
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle;">
                    ${element.NumberOfHead || 1}
			</td>
            </tr>`;

            let livestockIds = element.LivestockId;
            if (livestockIds.indexOf(',') != -1) {
                livestockIds = livestockIds.split(',');
            }
            else {
                livestockIds = [livestockIds];
            }
            livestockIds.forEach(function (livestockId) {
                let currentLivestock = livestocks.filter((ls) => {
                    return ls.LivestockId == livestockId;
                })[0];
                let nvdLivestockId = newUUID();
                let nvdLivestockObj = {
                    Id: uuidToBuffer(nvdLivestockId),
                    UUID: nvdLivestockId,
                    NVDId: nvdSaveObj.Id,
                    NVDLivestockSummaryId: nvdSummaryObj.Id,
                    LivestockId: uuidToBuffer(livestockId),
                    NumberOfHead: currentLivestock.NumberOfHead,
                    EarmarkText: currentLivestock.EarmarkText,
                    BrandText: currentLivestock.BrandText,
                    PICEarTag: currentLivestock.PICEarTag,
                    HasLT: currentLivestock.HasLT || 0,
                    HasEU: currentLivestock.HasEU || 0,
                    HasERP: currentLivestock.HasERP || 0
                }
                bulkNVDLivestockData.push(nvdLivestockObj);
            }, this);
        }, this);

        // bulk object array of nvd_lpa_questionnaire
        nvdObj.questionnaire.LPA.forEach(function (element) {
            let lpaQuestionId = newUUID();
            if (element.AgliveFile) {
                element.AgliveFile.fileId = newUUID();
                element.AgliveFile.additionalPath = 'Questionnaire';
                element.AgliveFile.category = 'lpa';
                fileUploads.push(element.AgliveFile);
            }
            let lpaObj = {
                Id: uuidToBuffer(lpaQuestionId),
                UUID: lpaQuestionId,
                NVDId: nvdSaveObj.Id,
                QuestionNo: element.QuestionNo,
                DataId: element.DataId,
                Loop: element.Loop,
                SortOrder: element.SortOrder == null ? 1 : element.SortOrder,
                Value: element.Value,
                AgliveFileId: element.AgliveFile ? uuidToBuffer(element.AgliveFile.fileId) : null
            }
            bulkNVDLPAData.push(lpaObj);
        }, this);

        // bulk object array of nvd_accreditation_questionnaire
        // health
        if (nvdObj.questionnaire.Health.length > 0) {
            nvdObj.questionnaire.Health.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'health', 'Questionnaire'));
            }, this);
        }
        // msa
        if (nvdObj.questionnaire.MSA.length > 0) {
            nvdObj.questionnaire.MSA.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'msa', 'Questionnaire'));
            }, this);
        }
        // obe
        if (nvdObj.questionnaire.OBE.length > 0) {
            nvdObj.questionnaire.OBE.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'obe', 'Questionnaire'));
            }, this);
        }
        // nt
        if (nvdObj.questionnaire.NT) {
            nvdObj.questionnaire.NT.data.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'nt', 'Questionnaire'));
            }, this);
        }
        // nfas
        if (nvdObj.questionnaire.NFAS) {
            nvdObj.questionnaire.NFAS.data.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'nfas', 'Questionnaire'));
            }, this);
        }
        // ausmeat
        if (nvdObj.questionnaire.AUSMEAT.length > 0) {
            nvdObj.questionnaire.AUSMEAT.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, nvdSaveObj.Id, fileUploads, fileDelete, 'ausmeat', 'Questionnaire'));
            }, this);
        }
        // nvd documents
        if (nvdObj.questionnaire.Documents.length > 0) {
            nvdObj.questionnaire.Documents.forEach(function (element) {
                createAuditIds.push(element.AuditLogId);
                element.DocFile.fileId = newUUID();
                element.DocFile.additionalPath = 'Documents';
                element.DocFile.category = 'document';
                fileUploads.push(element.DocFile);
                let documentObj = {
                    Id: uuidToBuffer(element.Id),
                    UUID: element.Id,
                    NVDId: nvdSaveObj.Id,
                    DocumentType: element.DocumentType,
                    DocumentNo: element.DocumentNo,
                    OfficeOfIssue: element.OfficeOfIssue,
                    ExpiryDate: element.ExpiryDate,
                    FileId: uuidToBuffer(element.DocFile.fileId),
                    AuditLogId: uuidToBuffer(element.AuditLogId)
                }
                bulkNVDDocumentData.push(documentObj);
            }, this);
        }

        // update NVDAccreditationQuestionnaireAuditLogId
        if (bulkNVDAccreditationData.length > 0) {
            let accreditaionAuditId = newUUID();
            nvdDetailObj.NVDAccreditationQuestionnaireAuditLogId = uuidToBuffer(accreditaionAuditId);
            createAuditIds.push(accreditaionAuditId);
        }

        return models.sequelize.transaction(function (t) {
            let filePromises = [];
            fileUploads.forEach(function (element) {
                filePromises.push(uploadFile(element.file, element.fileId, 'nvd', element.category,
                    nvdSaveObj.UUID, element.additionalPath, false))
            }, this);
            return Promise.map(filePromises, function (res, i) {
                bulkFilestorageData.push({
                    Id: uuidToBuffer(fileUploads[i].fileId),
                    FileName: fileUploads[i].file.storeName,
                    FilePath: res.Location,
                    MimeType: fileUploads[i].file.type
                });
            }).then(function () {
                if (bulkFilestorageData.length > 0)
                    return bulkCreateFileStorage(bulkFilestorageData, t);
                else
                    return true;
            }).then(function () {
                return createAudit(createAuditIds, contactId, t);
            }).then(function () {
                if (updateAuditIds.length > 0) {
                    return updateAudit(updateAuditIds, [], contactId, t);
                }
                else return true;
            }).then(function () {
                if (nvdObj.prepare_livestock.isNewMob) {
                    return createLivestock(inductionObj, language, contactId, t);
                }
                else {
                    return updateLivestock({ ActivityStatusId: uuidToBuffer(updateLivestockStatus.Id) },
                        { UUID: updateLivestockIds }, t);
                };
            }).then(function () {
                return createNewNVD(nvdSaveObj, t);
            }).then(function () {
                return createNVDDetail(nvdDetailObj, t);
            }).then(function () {
                return createNVDStatusHistory(statusHistoryObj, t);
            }).then(function () {
                return bulkCreateNVDLivestockSummary(bulkNVDLivestockSummaryData, t);
            }).then(function () {
                return bulkCreateNVDLivestock(bulkNVDLivestockData, t);
            }).then(function () {
                return bulkCreateNVDLPAQuestionnaire(bulkNVDLPAData, t);
            }).then(function () {
                return bulkCreateNVDAccreditaionQuestionnaire(bulkNVDAccreditationData, t);
            }).then(function () {
                return bulkCreateNVDDocument(bulkNVDDocumentData, t);
            }).then(function () {
                return bulkCreateNVDAccreditation(nvdObj.prepare_livestock.ConsignedFromPICId, nvdSaveObj.UUID,
                    nvdObj.questionnaire.SupportedAccreditationIds, t);
            }).then(function () {
                if (updatetatus.SystemCode != nvdStatusCodes.Draft)
                    return sendNVDNotificationEmail(nvdSaveObj, nvdObj, updatetatus, summarydata, contactId, language);
                else
                    return true;
            });
        }).then(function (res) {
            fileUploads.forEach(function (element) {
                deleteServerFile(element.file.name, false);
            }, this);
            return getResponse();
        }).catch(function (err) {
            let documentsFilepath = `/nvd/${nvdSaveObj.UUID}/Documents/`;
            let questionnaireFilepath = `/nvd/${nvdSaveObj.UUID}/Questionnaire/`;
            let signatureFilepath = `/nvd/${nvdSaveObj.UUID}/Signatures/`;
            deleteFile(bulkFilestorageData, documentsFilepath, questionnaireFilepath, signatureFilepath);
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

module.exports = {
    createNVD: Promise.method(createNVD)
}