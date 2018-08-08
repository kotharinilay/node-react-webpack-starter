'use strict';

/***********************************
 * logic related to pickup e-NVD
 * *********************************/

import Promise from 'bluebird';
import models from '../../../schema';

import { createAudit, updateAudit, deleteFile, uploadFile } from '../common';
import { getAllNVDActivityStatus } from '../../../repository/nvdstatus';
import { bulkCreateFileStorage, removeFileStorage } from '../../../repository/filestorage';
import { updateModel, createNVDStatusHistory } from '../../../repository/envd';

import { deleteServerFile } from '../file-middleware';
import { HttpStatus, getResponse } from '../../../lib/index';
import { uuidToBuffer, newUUID } from '../../../../shared/uuid';
import { nvdStatusCodes } from '../../../../shared/constants';

let pickupNVD = (nvdObj, language, contactId) => {

    let createAuditIds = [], nvdDetailObj, nvdUpdateObj,
        updateStatus, fileUploads = [], fileDelete = [],
        bulkFilestorageData = [], filestorageDeleteIds = [], statusHistoryObj;

    let nvdCondition = { UUID: nvdObj.nvdId }, updateCondition = { NVDId: uuidToBuffer(nvdObj.nvdId) }

    return getAllNVDActivityStatus({ Language: language }).then(function (res) {

        // object for nvd table
        nvdUpdateObj = {
            MovementCommenceDate: nvdObj.transporter.movementCommenceDate
        }

        // decide update status
        if (nvdObj.transporter.acknowledged) {
            updateStatus = res.filter((status) => {
                return nvdStatusCodes.InTransit == status.SystemCode;
            })[0];

            nvdUpdateObj.LastNVDStatusId = uuidToBuffer(updateStatus.Id);

            // nvd status history
            let statusId = newUUID();
            let statusAuditId = newUUID();
            createAuditIds.push(statusAuditId);
            statusHistoryObj = {
                Id: uuidToBuffer(statusId),
                UUID: statusId,
                NVDId: uuidToBuffer(nvdObj.nvdId),
                NVDStatusId: uuidToBuffer(updateStatus.Id),
                EventDate: new Date(),
                AuditLogId: uuidToBuffer(statusAuditId)
            }
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

        // object for nvd_details table
        nvdDetailObj = {
            TransporterCompanyId: nvdObj.transporter.transporterCompany && nvdObj.transporter.transporterCompany.CompanyId ?
                uuidToBuffer(nvdObj.transporter.transporterCompany.CompanyId) : null,
            TransporterContactId: uuidToBuffer(nvdObj.transporter.transporterContact),
            TransporterFirstName: nvdObj.transporter.transporterFirstName,
            TransporterLastName: nvdObj.transporter.transporterLastName,
            TransporterCompanyName: nvdObj.transporter.transporterCompanyName,
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
            TransporterAcknowledgedDate: nvdObj.transporter.acknowledgedate
        }

        return models.sequelize.transaction(function (t) {
            let filePromises = [];
            let deleteFilePromises = [];
            fileUploads.forEach(function (element) {
                filePromises.push(uploadFile(element.file, element.fileId, 'nvd', element.category, nvdObj.nvdId, element.additionalPath, false));
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
                return updateAudit([nvdObj.nvdAuditId], [], contactId, t);
            }).then(function () {
                if (createAuditIds.length > 0)
                    return createAudit(createAuditIds, contactId, t);
                else return true;
            }).then(function () {
                return updateModel(nvdUpdateObj, 'nvd', nvdCondition, t);
            }).then(function () {
                if (statusHistoryObj)
                    return createNVDStatusHistory(statusHistoryObj, t);
                else return true;
            }).then(function () {
                return updateModel(nvdDetailObj, 'nvd_detail', updateCondition, t);
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
            });
        }).then(function (res) {
            fileUploads.forEach(function (element) {
                deleteServerFile(element.file.name, false);
            }, this);
            return getResponse();
        }).catch(function (err) {
            deleteFile(bulkFilestorageData, `/nvd/${nvdObj.nvdId}/Signatures/`);
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
    });
}

module.exports = {
    pickupNVD: Promise.method(pickupNVD)
}