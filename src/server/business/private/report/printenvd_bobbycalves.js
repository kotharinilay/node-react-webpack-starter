'use strict';

/*************************************
 * print eNVD report
 * *************************************/

import { filter as _filter, sumBy as _sumBy, includes as _includes } from 'lodash';
import { printeNVD } from '../../../repository/envd';
import { nvdTypes } from '../../../../shared/constants';
import { utcToLocal } from '../../../../shared/format/date';

let eNVD = (dataObj, language, args) => {
    return printeNVD(language, args.id).then(function (result) {
        let questionnaireData = result.questionnaire;
        let eNVDObj = result.eNVD;

        let loopArr = ['L40', 'L50', 'L60'];
        let queArr = ['710', '720', '920', '930'];
        let signatureArr = ['DeclarerSignature', 'TransporterSignature', 'SaleAgentSignature'];
        let dateArr = ['Q_770_L40_1', 'Q_790_L40_1', 'Q_800_L40_1', 'Q_830_L50_1', 'Q_830_L50_2', 'Q_880_L60_1', 'Q_880_L60_2',
            'DeclarerSignatureDate', 'MovementCommenceDate', 'TransporterAcknowledgedDate'];

        questionnaireData.map(d => {
            let strKey = '';
            let strVal = '';
            let key = d.DataId;

            if (_includes(loopArr, d.Loop) && (d.SortOrder == 1 || d.SortOrder == 2)) {
                strKey = 'Q_' + key + '_' + d.Loop + '_' + d.SortOrder;
                strVal = d.Value;
                if (_includes(dateArr, strKey))
                    strVal = utcToLocal(strVal).ReportDate;
            }
            else if (!_includes(loopArr, d.Loop)) {
                strKey = 'Q_' + key;
                strVal = d.Value;
                if (!_includes(queArr, d.DataId)) {
                    strKey = d.Value ? ('Q_' + d.Value + '_' + d.DataId) : ('Q_' + d.DataId);
                    strVal = true;
                }
            }

            if (strKey != '')
                dataObj.Variables.push({ Key: strKey, Value: strVal });
        });

        dataObj.DataSource = {
            StockDescription: result.stockDescription
        };

        Object.keys(eNVDObj).forEach(function (key, index) {
            if (_includes(signatureArr, key))
                dataObj.Variables.push({ Key: key, ImgValue: eNVDObj[key] });
            else if (_includes(dateArr, key))
                dataObj.Variables.push({ Key: key, Value: utcToLocal(eNVDObj[key]).ReportDate });
            else
                dataObj.Variables.push({ Key: key, Value: eNVDObj[key] });
        });

        let totalLivestock = _sumBy(result.stockDescription, 'NumberOfHead');
        dataObj.Variables.push({ Key: 'TotalLivestock', Value: totalLivestock });

        result.accreditation.map(a => {
            if (accreditationProgramCodes.LPA == a.ProgramCode)
                dataObj.Variables.push({ Key: 'ImageLPA', ImgValue: process.env.SITE_URL + '/static/images/report/lpa.png' });
            else if (accreditationProgramCodes.MSA == a.ProgramCode)
                dataObj.Variables.push({ Key: 'ImageMSA', ImgValue: process.env.SITE_URL + '/static/images/report/msa.jpeg' });
            dataObj.Variables.push({ Key: a.ProgramCode, Value: a.LicenseNumber });
        });

        return result;
    });

}

module.exports = {
    printeNVDBobbyCalvesReport: eNVD
}