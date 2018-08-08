'use strict';

/*************************************
 * livestock feed history report
 * *************************************/

import { getLivestockFeedHistory } from '../../../repository/livestock';

let livestockFeed = (dataObj, language, args) => {
    return getLivestockFeedHistory(language, args.id).then(function (res) {
        dataObj.Variables.push({ Key: 'ReportParameters', Value: 'PIC: ' + args.pic })
        dataObj.Variables.push({ Key: 'EID', Value: res.livestock.EID });
        dataObj.Variables.push({ Key: 'VisualTag', Value: res.livestock.VisualTag });
        dataObj.Variables.push({ Key: 'SocietyId', Value: res.livestock.SocietyId });
        dataObj.Variables.push({ Key: 'NLISID', Value: res.livestock.NLISID });
        dataObj.Variables.push({ Key: 'MobName', Value: res.livestock.MobName });
        dataObj.Variables.push({ Key: 'EnclosureName', Value: res.livestock.EnclosureName });
        dataObj.Variables.push({ Key: 'Species', Value: res.livestock.SpeciesName });
        return res;
    });
}

module.exports = {
    feedHistoryReport: livestockFeed
}