'use strict';

/*************************************
 * print waybill report
 * *************************************/

import { filter as _filter, sumBy as _sumBy } from 'lodash';
import { printWaybill } from '../../../repository/envd';
import { nvdTypes } from '../../../../shared/constants';

let waybill = (dataObj, language, args) => {
    return printWaybill(language, args.id).then(function (result) {
        let questionnaireData = result.questionnaire;
        let eNVDType = result.eNVD.NVDType;

        let loop1, loop2 = '';
        let q1, q2, q3, q4 = '';
        let q5, q6, q7, q8, q9 = '';

        if (nvdTypes.Cattle == eNVDType) {
            loop1 = 'L50'; loop2 = 'L60';
            q1 = '810'; q2 = '820'; q3 = '830'; q4 = '840';
            q5 = '860'; q6 = '870'; q7 = '880'; q8 = '890'; q9 = '900';
        }
        else if (nvdTypes.Sheep == eNVDType) {
            loop1 = 'L40'; loop2 = 'L50';
            q1 = '770'; q2 = '780'; q3 = '790'; q4 = '800';
            q5 = '820'; q6 = '830'; q7 = '840'; q8 = '850'; q9 = '860';
        }
        else if (nvdTypes['Bobby Calves'] == eNVDType) {
            loop1 = 'L60'; loop2 = 'L40';
            q1 = '870'; q2 = '880'; q3 = '890'; q4 = '900';
            q5 = '760'; q6 = '770'; q7 = '780'; q8 = '790'; q9 = '800';
        }
        else if (nvdTypes.Goat == eNVDType) {
            loop1 = 'L40'; loop2 = 'L50';
            q1 = '740'; q2 = '750'; q3 = '760'; q4 = '770';
            q5 = '790'; q6 = '800'; q7 = '810'; q8 = '820'; q9 = '830';
        }
        else if (nvdTypes.EUCattle == eNVDType) {
            loop1 = 'L50'; loop2 = 'L60';
            q1 = '800'; q2 = '810'; q3 = '820'; q4 = '830';
            q5 = '850'; q6 = '860'; q7 = '870'; q8 = '880'; q9 = '890';
        }

        let animalTreatments = [];
        let fodderCropGrainTreatments = [];
        let maxOrder = questionnaireData.length > 0 ? questionnaireData[questionnaireData.length - 1]['SortOrder'] : 0;

        for (var index = 0; index < maxOrder; index++) {
            let filterObj = _filter(questionnaireData, function (d) { return d.SortOrder == index + 1; });

            let animalTreatmentObj = {
                chemicalProduct: '',
                treatmentDate: '',
                whp: '',
                esi: ''
            }

            let fodderCropGrainTreatmentObj = {
                chemProduct: '',
                dateApplied: '',
                grazingWHP: '',
                dateFirstFed: '',
                dateFeeding: ''
            }

            filterObj.map(d => {
                if (d.Loop == loop1) {
                    if (d.DataId == q1)
                        animalTreatmentObj.chemicalProduct = d.Value;
                    else if (d.DataId == q2)
                        animalTreatmentObj.treatmentDate = d.Value;
                    else if (d.DataId == q3)
                        animalTreatmentObj.whp = d.Value;
                    else if (d.DataId == q4)
                        animalTreatmentObj.esi = d.Value;
                }
                if (d.Loop == loop2) {
                    if (d.DataId == q5)
                        fodderCropGrainTreatmentObj.chemProduct = d.Value;
                    else if (d.DataId == q6)
                        fodderCropGrainTreatmentObj.dateApplied = d.Value;
                    else if (d.DataId == q7)
                        fodderCropGrainTreatmentObj.grazingWHP = d.Value;
                    else if (d.DataId == q8)
                        fodderCropGrainTreatmentObj.dateFirstFed = d.Value;
                    else if (d.DataId == q9)
                        fodderCropGrainTreatmentObj.dateFeeding = d.Value;
                }

            });

            if (animalTreatmentObj.chemicalProduct)
                animalTreatments.push(animalTreatmentObj);
            else if (fodderCropGrainTreatmentObj.chemProduct)
                fodderCropGrainTreatments.push(fodderCropGrainTreatmentObj);
        }

        dataObj.DataSource = {
            AnimalTreatments: animalTreatments,
            FodderCropGrainTreatments: fodderCropGrainTreatments,
            StockDescription: result.stockDescription
        };

        let { ReferenceNumber, ConsignerPIC, DeclarerName, DeclarerAddress,
            DeclarerSignature, DeclarerSignatureDate, DeclarerTelephone } = result.eNVD;

        let totalLivestock = _sumBy(result.stockDescription, 'NumberOfHead');

        dataObj.Variables.push({ Key: 'ConsignerPIC', Value: ConsignerPIC });
        dataObj.Variables.push({ Key: 'ReferenceNumber', Value: ReferenceNumber });
        dataObj.Variables.push({ Key: 'DeclarerName', Value: DeclarerName });
        dataObj.Variables.push({ Key: 'DeclarerAddress', Value: DeclarerAddress });
        dataObj.Variables.push({ Key: 'DeclarerSignature', ImgValue: DeclarerSignature });
        dataObj.Variables.push({ Key: 'DeclarerSignatureDate', Value: DeclarerSignatureDate });
        dataObj.Variables.push({ Key: 'DeclarerTelephone', Value: DeclarerTelephone });
        dataObj.Variables.push({ Key: 'TotalLivestock', Value: totalLivestock });
        dataObj.Variables.push({ Key: 'cb', Value: false });
        return result;
    });

}

module.exports = {
    printWaybillReport: waybill
}