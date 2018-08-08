'use strict';

/*************************************
 * livestock tracebility history report
 * *************************************/

import { getLivestockTracebility } from '../../../repository/livestock';

let livestockTracebility = (dataObj, language, args) => {
    return getLivestockTracebility(language, args.id).then(function (res) {
        dataObj.Variables.push({ Key: 'ReportParameters', Value: 'PIC: ' + args.pic })
        dataObj.Variables.push({ Key: 'EID', Value: res.livestock.EID });
        dataObj.Variables.push({ Key: 'VisualTag', Value: res.livestock.VisualTag });
        dataObj.Variables.push({ Key: 'SocietyId', Value: res.livestock.SocietyId });
        dataObj.Variables.push({ Key: 'NLISID', Value: res.livestock.NLISID });
        dataObj.Variables.push({ Key: 'MobName', Value: res.livestock.MobName });
        dataObj.Variables.push({ Key: 'EnclosureName', Value: res.livestock.EnclosureName });
        dataObj.Variables.push({ Key: 'Species', Value: res.livestock.SpeciesName });
        dataObj.Variables.push({ Key: 'Sire', Value: res.livestock.Sire });
        dataObj.Variables.push({ Key: 'Dam', Value: res.livestock.Dam });
        return res;
    });
}

module.exports = {
    tracebilityHistoryReport: livestockTracebility
}