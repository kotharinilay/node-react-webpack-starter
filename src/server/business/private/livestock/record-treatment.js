'use strict';

/**********************************************
 * record treatment
 * ********************************************/

import Promise from 'bluebird';
import models from '../../../schema';

import { uuidToBuffer, newUUID } from '../../../../shared/uuid';
import { currentDateTime } from '../../../../shared/format/date';

import { createTreatmentSession, bulkCreateTreatmentSessionProduct, updateTreatmentSessionProduct, updateTreatmentSession } from '../../../repository/treatmentsession';
import { createChemicalProductStock } from '../../../repository/chemicalproductstock';
import { createAudit, updateAudit } from '../common';
import { HttpStatus, getResponse } from '../../../lib/index';

let createSession = (sessionObj, language, contactId, companyId) => {

    let createAuditLogArr = [];

    // create treatment session
    let treatmentSessionId = newUUID();
    let treatmentSessionAuditLogId = newUUID();
    createAuditLogArr.push(treatmentSessionAuditLogId);

    let treatmentSessionObj = {
        Id: uuidToBuffer(treatmentSessionId),
        UUID: treatmentSessionId,
        SessionName: sessionObj.sessionName,
        Disease: sessionObj.disease,
        CompanyId: uuidToBuffer(companyId),
        AuditLogId: uuidToBuffer(treatmentSessionAuditLogId)
    }

    let treatmentSessionProductArr = [];
    let chemicalProductStockArr = [];

    sessionObj.sessionProducts.map(p => {

        // create new chemical product stock if not exist
        if (!p.ChemicalProductStockId && !p.TreatName) {
            let chemicalProductStockId = newUUID();
            let chemicalProductStockAuditLogId = newUUID();
            createAuditLogArr.push(chemicalProductStockAuditLogId);

            let chemicalProductStockObj = {
                Id: uuidToBuffer(chemicalProductStockId),
                ChemicalProductId: uuidToBuffer(p.ChemicalProductId),
                BatchNumber: p.BatchNumber,
                StockOnHand: p.StockOnHand,
                StockDate: currentDateTime().DateTimeMoment,
                Cost: p.StockCost,
                UoMId: uuidToBuffer(p.StockUoMId),
                AuditLogId: uuidToBuffer(chemicalProductStockAuditLogId),
                UUID: chemicalProductStockId
            }
            chemicalProductStockArr.push(chemicalProductStockObj);
            p.ChemicalProductStockId = chemicalProductStockId;
        }

        // create treatment session product
        let treatmentSessionProductId = newUUID();
        let treatmentSessionProductObj = {
            Id: uuidToBuffer(treatmentSessionProductId),
            TreatmentSessionId: uuidToBuffer(treatmentSessionObj.Id),
            ChemicalProductStockId: p.TreatName ? null : uuidToBuffer(p.ChemicalProductStockId),
            TreatName: p.TreatName == '' ? null : p.TreatName,
            IsVaccineChemical: p.IsVaccineChemical,
            Dosage: p.TreatName ? null : p.Dosage,
            DosageUoMId: p.TreatName ? null : uuidToBuffer(p.DosageUoMId),
            UUID: treatmentSessionProductId
        }
        treatmentSessionProductArr.push(treatmentSessionProductObj);
    });

    return models.sequelize.transaction(function (t) {
        return createAudit(createAuditLogArr, contactId, t).then(function () {
            return createTreatmentSession(treatmentSessionObj, t);
        }).then(function () {
            if (chemicalProductStockArr.length > 0)
                return createChemicalProductStock(chemicalProductStockArr, t);
            else
                return true;
        }).then(function () {
            return bulkCreateTreatmentSessionProduct(treatmentSessionProductArr, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let saveApplySession = (treatmentObj, language, contactId, companyId) => {

    let treatmentSessionProductArr = [];
    let chemicalProductStockArr = [];
    let createAuditLogArr = [];
    let updateAuditLogArr = [];
    let deleteAuditLogArr = [];

    if (treatmentObj.sessionUpdate) {
        treatmentObj.sessionProducts.map(p => {
            if (p.UpdateEntry) {
                // create new chemical product stock if not exist
                if (!p.ChemicalProductStockId && !p.TreatName) {
                    let chemicalProductStockId = newUUID();
                    let chemicalProductStockAuditLogId = newUUID();
                    createAuditLogArr.push(chemicalProductStockAuditLogId);

                    let chemicalProductStockObj = {
                        Id: uuidToBuffer(chemicalProductStockId),
                        ChemicalProductId: uuidToBuffer(p.ChemicalProductId),
                        BatchNumber: p.BatchNumber,
                        StockOnHand: p.StockOnHand,
                        StockDate: currentDateTime().DateTimeMoment,
                        Cost: p.StockCost,
                        UoMId: uuidToBuffer(p.StockUoMId),
                        AuditLogId: uuidToBuffer(chemicalProductStockAuditLogId),
                        UUID: chemicalProductStockId
                    }
                    chemicalProductStockArr.push(chemicalProductStockObj);
                    p.ChemicalProductStockId = chemicalProductStockId;
                }

                // update treatment session product
                let treatmentSessionProductObj = {
                    ChemicalProductStockId: p.TreatName ? null : uuidToBuffer(p.ChemicalProductStockId),
                    TreatName: p.TreatName == '' ? null : p.TreatName,
                    IsVaccineChemical: p.IsVaccineChemical,
                    Dosage: p.TreatName ? null : p.Dosage,
                    DosageUoMId: p.TreatName ? null : uuidToBuffer(p.DosageUoMId),
                    IsDeleted: p.IsDeleted
                }
                treatmentSessionProductArr.push({ obj: treatmentSessionProductObj, id: p.Id });

                if (p.IsDeleted)
                    deleteAuditLogArr.push(p.SessionAuditLogId);
                else
                    updateAuditLogArr.push(p.SessionAuditLogId);
            }
        });
    }

    return models.sequelize.transaction(function (t) {
        return createAudit(createAuditLogArr, contactId, t).then(function () {
            return updateAudit(updateAuditLogArr, deleteAuditLogArr, contactId, t);
        }).then(function () {
            if (chemicalProductStockArr.length > 0)
                return createChemicalProductStock(chemicalProductStockArr, t);
            else
                return true;
        }).then(function () {
            if (treatmentObj.sessionUpdate) {
                let updateStockArr = [];
                for (var j = 0; j < treatmentSessionProductArr.length; j++) {
                    let obj = treatmentSessionProductArr[j].obj;
                    let condition = { UUID: treatmentSessionProductArr[j].id };
                    updateStockArr.push(updateTreatmentSessionProduct(obj, condition, t));
                }
                return Promise.all(updateStockArr);
            }
            else
                return true;
        }).then(function () {
            if (treatmentObj.sessionUpdate && treatmentObj.deteledSessionIds)
                return updateTreatmentSession({ IsDeleted: 1 }, { UUID: treatmentObj.deteledSessionIds }, t);
            else
                return true;
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

module.exports = {
    createTreatmentSession: Promise.method(createSession),
    saveApplyTreatmentSession: Promise.method(saveApplySession),
}