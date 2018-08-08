'use strict';

/***********************************
 * logic related to update e-NVD
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';
import { sumBy as _sumBy } from 'lodash';

import { createAudit, updateAudit, deleteFile, uploadFile } from '../common';
import { sendNVDNotificationEmail } from './mail-notification';
import { getAllNVDActivityStatus } from '../../../repository/nvdstatus';
import { getAllActivityStatus } from '../../../repository/livestockactivitystatus';
import { getLivestockByCondition, updateLivestock } from '../../../repository/livestock';
import { bulkCreateFileStorage, removeFileStorage } from '../../../repository/filestorage';
import {
    updateModel, createNVDDetail, bulkCreateNVDLivestockSummary,
    bulkCreateNVDLPAQuestionnaire, bulkCreateNVDAccreditaionQuestionnaire, bulkCreateNVDDocument,
    createNVDStatusHistory, removeModel
} from '../../../repository/envd';
import { AccreditationQuestionObj } from '../../../schema/mapper';

import { deleteServerFile } from '../file-middleware';
import { HttpStatus, getResponse, resMessages } from '../../../lib/index';
import { uuidToBuffer, newUUID, bufferToUUID } from '../../../../shared/uuid';
import { currentDateTime } from '../../../../shared/format/date';
import { nvdStatusCodes, livestockActivityStatusCodes } from '../../../../shared/constants';

var ORIGINAL_FILE_PATH = '/nvd/';

let modifyNVD = (nvdObj, language, contactId) => {
    let createAuditIds = [], updateAuditIds = [], nvdStatusData,
        bulkNVDLivestockSummaryData = [], bulkNVDLivestockSummaryCondition = [], nvdUpdateObj, nvdDetailObj,
        updatetatus, fileUploads = [], fileDelete = [], bulkNVDLPAData = [], bulkNVDAccreditationData = [],
        bulkNVDDocumentData = [], bulkFilestorageData = [], filestorageDeleteIds = [], statusHistoryObj,
        updateLivestockIds = [], livestockStatusData, updateLivestockStatus, summarydata, sendNotification = false;
    let nvdCondition = { UUID: nvdObj.nvdId }, updateCondition = { NVDId: uuidToBuffer(nvdObj.nvdId) }
    updateAuditIds.push(nvdObj.nvdAuditId);
    if (nvdObj.nvdAccreditationQuestionnaireAuditId)
        updateAuditIds.push(nvdObj.nvdAccreditationQuestionnaireAuditId);

    if (nvdObj.nvdLPAQuestionnaireAuditId)
        updateAuditIds.push(nvdObj.nvdLPAQuestionnaireAuditId);

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

        nvdUpdateObj = {
            ReferenceNumber: nvdObj.ReferenceNumber,
            IsPaperNVD: nvdObj.consignor_declaration.papernvdnumber ? 1 : 0,
            PaperNVDNumber: nvdObj.consignor_declaration.papernvdnumber,
            LivestockOwnerName: nvdObj.prepare_livestock.ownerOfLivestock,
            TotalLivestockQty: _sumBy(nvdObj.prepare_livestock.livestockSummaryData, function (f) {
                return f.NumberOfHead || 1;
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
        }
        if (bufferToUUID(nvdObj.LastNVDStatusId) != updatetatus.Id) {
            // nvd status history
            sendNotification = true;
            let statusId = newUUID();
            let statusAuditId = newUUID();
            createAuditIds.push(statusAuditId);
            statusHistoryObj = {
                Id: uuidToBuffer(statusId),
                UUID: statusId,
                NVDId: uuidToBuffer(nvdObj.nvdId),
                NVDStatusId: uuidToBuffer(updatetatus.Id),
                EventDate: new Date(),
                AuditLogId: uuidToBuffer(statusAuditId)
            }
        }

        // declarer signature file
        if (nvdObj.consignor_declaration.signatureObj.deletedFile) {
            nvdObj.consignor_declaration.signatureObj.deletedFile.Id = nvdObj.consignor_declaration.signatureObj.fileId;
            nvdObj.consignor_declaration.signatureObj.deletedFile.FileName = nvdObj.consignor_declaration.signatureObj.deletedFile.name;
            nvdObj.consignor_declaration.signatureObj.deletedFile.imagePath = `/nvd/${nvdObj.nvdId}/Signatures/`;
            fileDelete.push(nvdObj.consignor_declaration.signatureObj.deletedFile);
        }
        if (nvdObj.consignor_declaration.signatureObj.file &&
            nvdObj.consignor_declaration.signatureObj.fileId == null) {
            nvdObj.consignor_declaration.signatureObj.fileId = newUUID();
            nvdObj.consignor_declaration.signatureObj.additionalPath = 'Signatures';
            nvdObj.consignor_declaration.signatureObj.category = 'declarer';
            fileUploads.push(nvdObj.consignor_declaration.signatureObj);
        }

        // tranporter signature file
        if (nvdObj.transporter.signatureObj.deletedFile) {
            nvdObj.transporter.signatureObj.deletedFile.Id = nvdObj.transporter.signatureObj.fileId;
            nvdObj.transporter.signatureObj.deletedFile.FileName = nvdObj.transporter.signatureObj.deletedFile.name;
            nvdObj.transporter.signatureObj.deletedFile.imagePath = `/nvd/${nvdObj.nvdId}/Signatures/`;
            fileDelete.push(nvdObj.transporter.signatureObj.deletedFile);
        }
        if (nvdObj.transporter.signatureObj.file &&
            nvdObj.transporter.signatureObj.fileId == null) {
            nvdObj.transporter.signatureObj.fileId = newUUID();
            nvdObj.transporter.signatureObj.additionalPath = 'Signatures';
            nvdObj.transporter.signatureObj.category = 'transporter';
            fileUploads.push(nvdObj.transporter.signatureObj);
        }

        //sale agent signature file
        if (nvdObj.sale_agent.signatureObj.deletedFile) {
            nvdObj.sale_agent.signatureObj.deletedFile.Id = nvdObj.sale_agent.signatureObj.fileId;
            nvdObj.sale_agent.signatureObj.deletedFile.FileName = nvdObj.transporter.signatureObj.deletedFile.name;
            nvdObj.sale_agent.signatureObj.deletedFile.imagePath = `/nvd/${nvdObj.nvdId}/Signatures/`;
            fileDelete.push(nvdObj.sale_agent.signatureObj.deletedFile);
        }
        if (nvdObj.sale_agent.signatureObj.file &&
            nvdObj.sale_agent.signatureObj.fileId == null) {
            nvdObj.sale_agent.signatureObj.fileId = newUUID();
            nvdObj.sale_agent.signatureObj.additionalPath = 'Signatures';
            nvdObj.sale_agent.signatureObj.category = 'saleagent';
            fileUploads.push(nvdObj.sale_agent.signatureObj);
        }

        nvdDetailObj = {
            ConsignerPropertyName: nvdObj.prepare_livestock.ownerOfLivestock,
            ConsignerPICOwner: nvdObj.prepare_livestock.ownerPIC,
            ConsignerPropertyAddress: nvdObj.prepare_livestock.journeyCommencedAddress,
            ConsignerPropertySuburbId: nvdObj.prepare_livestock.suburb && nvdObj.prepare_livestock.suburb.suburbId ?
                uuidToBuffer(nvdObj.prepare_livestock.suburb.suburbId) : null,

            ConsigneePropertyId: uuidToBuffer(nvdObj.consigned_to_property.ConsignedToPICId),
            ConsigneePIC: nvdObj.consigned_to_property.ConsignedToPIC,
            ConsigneePropertyName: nvdObj.consigned_to_property.consignedtoPropertyName,
            ConsigneePICOwner: nvdObj.consigned_to_property.consignedtoOwnerOfPIC,
            ConsigneePropertyAddress: nvdObj.consigned_to_property.consignedtoAddress,
            ConsigneePropertySuburbId: nvdObj.consigned_to_property.consignedtoSuburbData && nvdObj.consigned_to_property.consignedtoSuburbData.suburbId ?
                uuidToBuffer(nvdObj.consigned_to_property.consignedtoSuburbData.suburbId) : null,
            ConsigneeEmail: nvdObj.consigned_to_property.consignedtoEmail,
            ConsigneeMobile: nvdObj.consigned_to_property.consignedtoMobile,
            ConsigneeFax: nvdObj.consigned_to_property.consignedtoFax,

            DeclarerContactId: nvdObj.consignor_declaration.declarerContact ?
                uuidToBuffer(nvdObj.consignor_declaration.declarerContact) : null,
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
        }

        if (nvdObj.consigned_to_property.isDestinationSame) {
            let destinationPropertyObj = {
                DestinationPropertyId: nvdObj.consigned_to_property.DestinationPICId ?
                    uuidToBuffer(nvdObj.consigned_to_property.DestinationPICId) : null,
                DestinationPIC: nvdObj.consigned_to_property.DestinationPIC,
                DestinationPropertyName: nvdObj.consigned_to_property.destinationPropertyName,
                DestinationPropertyAddress: nvdObj.consigned_to_property.destinationAddress,
                DestinationPropertySuburbId: nvdObj.consigned_to_property.destinationSuburbData && nvdObj.consigned_to_property.destinationSuburbData.suburbId ?
                    uuidToBuffer(nvdObj.consigned_to_property.destinationSuburbData.suburbId) : null,
                DestinationPICOwner: nvdObj.consigned_to_property.destinationOwnerOfPIC,
                DestinationEmail: nvdObj.consigned_to_property.destinationEmail,
                DestinationMobile: nvdObj.consigned_to_property.destinationMobile,
                DestinationFax: nvdObj.consigned_to_property.destinationFax
            }
            Object.assign(nvdDetailObj, destinationPropertyObj);
        }

        // bulk object array of nvd_livestock and nvd_livestocksummary
        nvdObj.prepare_livestock.livestockSummaryData.forEach(function (element, i) {
            if (element.LivestockId.indexOf(',') != -1) {
                let livestockArr = element.LivestockId.split(',');
                livestockArr.forEach(function (ele) {
                    updateLivestockIds.push(ele);
                }, this);
            }
            else {
                updateLivestockIds.push(element.LivestockId);
            }

            summarydata += `<tr style="border-bottom: 1px solid #000;">
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle; width: 40%;">
                    ${element.Description || ''}
			</td>
                <td style="padding: 5px; border: 1px solid #000; vertical-align: middle;">
                    ${element.NumberOfHead || 1}
			</td>
            </tr>`;

            let NTObj = nvdObj.questionnaire.NT != null && nvdObj.questionnaire.NT.summaryData.length > 0 ?
                nvdObj.questionnaire.NT.summaryData[i] : {};

            let NFASObj = nvdObj.questionnaire.NFAS != null && nvdObj.questionnaire.NFAS.summaryData.length > 0 ?
                nvdObj.questionnaire.NFAS.summaryData[i] : {};

            let SAObj = nvdObj.questionnaire.SA && nvdObj.questionnaire.SA.length > 0 ?
                nvdObj.questionnaire.SA[i] : {};
            if (SAObj.PrefixTattoo) {
                if (SAObj.PrefixTattoo.deletedFile) {
                    SAObj.PrefixTattoo.deletedFile.Id = SAObj.PrefixTattoo.fileId;
                    SAObj.PrefixTattoo.deletedFile.FileName = SAObj.PrefixTattoo.deletedFile.name;
                    SAObj.PrefixTattoo.deletedFile.imagePath = `/nvd/${nvdObj.nvdId}/Questionnaire/`;
                    fileDelete.push(SAObj.PrefixTattoo.deletedFile);
                }
                if (SAObj.PrefixTattoo.file && SAObj.PrefixTattoo.fileId == null) {
                    SAObj.PrefixTattoo.fileId = newUUID();
                    SAObj.PrefixTattoo.additionalPath = 'Questionnaire';
                    SAObj.PrefixTattoo.category = 'prefixtattoo';
                    fileUploads.push(SAObj.PrefixTattoo);
                }
            }

            let nvdSummaryObj = {};
            if (nvdObj.questionnaire.NT != null && nvdObj.questionnaire.NT.summaryData.length > 0) {
                nvdSummaryObj.NT_Chemical = NTObj.Chemical;
                nvdSummaryObj.NT_TreatmentMethod = NTObj.TreatmentMethod;
            }
            if (nvdObj.questionnaire.NFAS != null && nvdObj.questionnaire.NFAS.summaryData.length > 0) {
                nvdSummaryObj.NFAS_DentitionId = NFASObj.DentitionId ? uuidToBuffer(NFASObj.DentitionId) : null;
                nvdSummaryObj.NFAS_DaysOnFeed = NFASObj.DaysOnFeed;
            }
            if (nvdObj.questionnaire.SA && nvdObj.questionnaire.SA.length > 0) {
                nvdSummaryObj.SA_PrefixTattooId = SAObj.PrefixTattoo && SAObj.PrefixTattoo.file ?
                    uuidToBuffer(SAObj.PrefixTattoo.fileId) : null;
            }
            if (Object.keys(nvdSummaryObj).length > 0) {
                bulkNVDLivestockSummaryData.push(nvdSummaryObj);
                bulkNVDLivestockSummaryCondition.push({ UUID: element.SummaryId });
                updateAuditIds.push(element.SummaryAuditId);
            }
        }, this);

        // bulk object array of nvd_lpa_questionnaire
        nvdObj.questionnaire.LPA.forEach(function (element) {
            let lpaQuestionId = newUUID();
            if (element.AgliveFile) {
                if (element.AgliveFile.deletedFile) {
                    element.AgliveFile.deletedFile.Id = element.AgliveFile.fileId;
                    element.AgliveFile.deletedFile.FileName = element.AgliveFile.deletedFile.name;
                    element.AgliveFile.deletedFile.imagePath = `/nvd/${nvdObj.nvdId}/Questionnaire/`;
                    fileDelete.push(element.AgliveFile.deletedFile);
                }
                if (element.AgliveFile.file && element.AgliveFile.fileId == null) {
                    element.AgliveFile.fileId = newUUID();
                    element.AgliveFile.additionalPath = 'Questionnaire';
                    element.AgliveFile.category = 'lpa';
                    fileUploads.push(element.AgliveFile);
                }
            }
            let lpaObj = {
                Id: uuidToBuffer(lpaQuestionId),
                UUID: lpaQuestionId,
                NVDId: uuidToBuffer(nvdObj.nvdId),
                QuestionNo: element.QuestionNo,
                DataId: element.DataId,
                Loop: element.Loop,
                SortOrder: element.SortOrder == null ? 1 : element.SortOrder,
                Value: element.Value,
                AgliveFileId: element.AgliveFile && element.AgliveFile.file ?
                    uuidToBuffer(element.AgliveFile.fileId) : null
            }
            bulkNVDLPAData.push(lpaObj);
        }, this);

        // bulk object array of nvd_accreditation_questionnaire
        // health
        if (nvdObj.questionnaire.Health && nvdObj.questionnaire.Health.length > 0) {
            nvdObj.questionnaire.Health.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'health', 'Questionnaire'));
            }, this);
        }
        // msa
        if (nvdObj.questionnaire.MSA && nvdObj.questionnaire.MSA.length > 0) {
            nvdObj.questionnaire.MSA.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'msa', 'Questionnaire'));
            }, this);
        }
        // obe
        if (nvdObj.questionnaire.OBE && nvdObj.questionnaire.OBE.length > 0) {
            nvdObj.questionnaire.OBE.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'obe', 'Questionnaire'));
            }, this);
        }
        // nt
        if (nvdObj.questionnaire.NT) {
            nvdObj.questionnaire.NT.data.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'nt', 'Questionnaire'));
            }, this);
        }
        // nfas
        if (nvdObj.questionnaire.NFAS) {
            nvdObj.questionnaire.NFAS.data.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'nfas', 'Questionnaire'));
            }, this);
        }
        // ausmeat
        if (nvdObj.questionnaire.AUSMEAT && nvdObj.questionnaire.AUSMEAT.length > 0) {
            nvdObj.questionnaire.AUSMEAT.forEach(function (element) {
                bulkNVDAccreditationData.push(AccreditationQuestionObj(element, uuidToBuffer(nvdObj.nvdId), fileUploads, fileDelete, 'ausmeat', 'Questionnaire'));
            }, this);
        }
        // nvd documents
        if (nvdObj.questionnaire.Documents && nvdObj.questionnaire.Documents.length > 0) {
            nvdObj.questionnaire.Documents.forEach(function (element) {
                if (element.NewEntry) {
                    createAuditIds.push(element.AuditLogId);
                    element.DocFile.fileId = newUUID();
                    element.DocFile.additionalPath = 'Documents';
                    element.DocFile.category = 'document';
                    fileUploads.push(element.DocFile);
                    let documentObj = {
                        Id: uuidToBuffer(element.Id),
                        UUID: element.Id,
                        NVDId: uuidToBuffer(nvdObj.nvdId),
                        DocumentType: element.DocumentType,
                        DocumentNo: element.DocumentNo,
                        OfficeOfIssue: element.OfficeOfIssue,
                        ExpiryDate: element.ExpiryDate,
                        FileId: uuidToBuffer(element.DocFile.fileId),
                        AuditLogId: uuidToBuffer(element.AuditLogId)
                    }
                    bulkNVDDocumentData.push(documentObj);
                }
                if (element.IsDeleted) {
                    let deleteFileObj = {
                        Id: bufferToUUID(element.FileId),
                        imagePath: `/nvd/${nvdObj.nvdId}/Documents/`,
                        FileName: element.DocumentFileName
                    }
                    fileDelete.push(deleteFileObj);
                }
            }, this);
        }

        return models.sequelize.transaction(function (t) {
            let filePromises = [];
            let deleteFilePromises = [];
            fileUploads.forEach(function (element) {
                filePromises.push(uploadFile(element.file, element.fileId, 'nvd', element.category,
                    nvdObj.nvdId, element.additionalPath, false))
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
                return updateModel(nvdUpdateObj, 'nvd', nvdCondition, t);
            }).then(function () {
                return updateModel(nvdDetailObj, 'nvd_detail', updateCondition, t);
            }).then(function () {
                let livestockSummaryPromises = [];
                bulkNVDLivestockSummaryData.forEach(function (element, i) {
                    livestockSummaryPromises.push(updateModel(bulkNVDLivestockSummaryData[i],
                        'nvd_livestocksummary', bulkNVDLivestockSummaryCondition[i], t));
                }, this);
                return Promise.all(livestockSummaryPromises);
                // return bulkCreateNVDLivestockSummary(bulkNVDLivestockSummaryData, t);
            }).then(function () {
                return removeModel('nvd_lpa_questionnaire', updateCondition, t);
            }).then(function () {
                return bulkCreateNVDLPAQuestionnaire(bulkNVDLPAData, t);
            }).then(function () {
                return removeModel('nvd_accreditation_questionnaire', updateCondition, t);
            }).then(function () {
                return bulkCreateNVDAccreditaionQuestionnaire(bulkNVDAccreditationData, t);
            }).then(function () {
                return removeModel('nvd_document', updateCondition, t);
            }).then(function () {
                return bulkCreateNVDDocument(bulkNVDDocumentData, t);
            }).then(function () {
                fileDelete.forEach(function (element) {
                    deleteFilePromises.push(deleteFile([element], element.imagePath))
                }, this);
                return Promise.map(deleteFilePromises, function (res, i) {
                    filestorageDeleteIds.push(uuidToBuffer(fileDelete[i].Id));
                });
            }).then(function () {
                // delele records file storage
                if (filestorageDeleteIds.length > 0)
                    return removeFileStorage({ Id: filestorageDeleteIds }, t);
                else
                    return true;
            }).then(function () {
                if (statusHistoryObj)
                    return createNVDStatusHistory(statusHistoryObj, t);
                else
                    return true;
            }).then(function () {
                if (statusHistoryObj)
                    return updateLivestock({ ActivityStatusId: uuidToBuffer(updateLivestockStatus.Id) },
                        { UUID: updateLivestockIds }, t);
                else return true;
            }).then(function () {
                if (sendNotification)
                    return sendNVDNotificationEmail(nvdUpdateObj, nvdObj, updatetatus, summarydata, contactId, language);
                else
                    return true;
            });
        }).then(function (res) {
            fileUploads.forEach(function (element) {
                deleteServerFile(element.file.name, false);
            }, this);
            return getResponse();
        }).catch(function (err) {
            let documentsFilepath = `/nvd/${nvdObj.nvdId}/Documents/`;
            let questionnaireFilepath = `/nvd/${nvdObj.nvdId}/Questionnaire/`;
            deleteFile(bulkFilestorageData, documentsFilepath, questionnaireFilepath);
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

module.exports = {
    modifyNVD: Promise.method(modifyNVD)
}