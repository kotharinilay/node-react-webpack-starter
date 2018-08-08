'use strict';

/*****************************************
 * prepare data to generate requested
 * standard report
 * **************************************/

import { reportList } from '../../../shared/constants';

import { feedHistoryReport } from './report/feedhistory';
import { tracebilityHistoryReport } from './report/tracebilityhistory';
import { printWaybillReport } from './report/printwaybill';

import { printeNVDCattleReport } from './report/printenvd_cattle';
import { printeNVDSheepReport } from './report/printenvd_sheep';
import { printeNVDBobbyCalvesReport } from './report/printenvd_bobbycalves';
import { printeNVDGoatReport } from './report/printenvd_goat';
import { printeNVDEUCattleReport } from './report/printenvd_eucattle';

import { getContactById } from '../../repository/contact';
import { currentDateTime } from '../../../shared/format/date';
import { getResponse } from '../../lib/index';
import Promise from 'bluebird';

let {
    feedHistory, tracebilityHistory, printWaybill,
    printeNVDCattle, printeNVDSheep, printeNVDBobbyCalves, printeNVDGoat, printeNVDEUCattle
} = reportList;

let assignUrl = (name, dataObj) => {
    switch (name) {
        case feedHistory:
            dataObj.Url = 'static/reports/history/livestockfeed.mrt';
            dataObj.Title = 'Feed History';
            break;
        case tracebilityHistory:
            dataObj.Url = 'static/reports/history/traceability.mrt';
            dataObj.Title = 'Traceability History';
            break;
        case printWaybill:
            dataObj.Url = 'static/reports/print/waybill.mrt';
            dataObj.Title = 'Attachment to the National Vendor Declaration and Waybill';
            break;
        case printeNVDCattle:
            dataObj.Url = 'static/reports/print/envd_cattle.mrt';
            dataObj.Title = 'NATIONAL VENDOR DECLARATION (CATTLE) AND WAYBILL';
            break;
        case printeNVDSheep:
            dataObj.Url = 'static/reports/print/envd_sheep.mrt';
            dataObj.Title = 'NATIONAL VENDOR DECLARATION (SHEEP AND LAMBS) AND WAYBILL';
            break;
        case printeNVDBobbyCalves:
            dataObj.Url = 'static/reports/print/envd_bobbycalves.mrt';
            dataObj.Title = 'NATIONAL VENDOR DECLARATION (BOBBY CALVES) AND WAYBILL';
            break;
        case printeNVDGoat:
            dataObj.Url = 'static/reports/print/envd_goat.mrt';
            dataObj.Title = 'NATIONAL VENDOR DECLARATION (GOATS) AND WAYBILL';
            break;
        case printeNVDEUCattle:
            dataObj.Url = 'static/reports/print/envd_eucattle.mrt';
            dataObj.Title = 'EUROPEAN UNION VENDOR DECLARATION (CATTLE) AND WAYBILL';
            break;
        default:
            throw new Error("Invalid reportname provided");
    }
}

let prepareForView = (args, contactId, language) => {
    if (args.name == null || args.name == undefined || args.name == '' || args.name == "null") {
        throw new Error("Must provide valid reportname");
    }
    let today = currentDateTime();
    let dataObj = {
        Url: '',
        Title: '',
        Variables: [
            { Key: 'Copyright', Value: `Copyright (c) ${today.YYYY} Aglive Pty Ltd` }
        ],
        DataSource: null,
        ReportData: null
    }
    assignUrl(args.name, dataObj);

    return getContactById(contactId).then(function (response) {
        dataObj.Variables.push({ Key: 'PrintedPerson', Value: response.FirstName + ' ' + response.LastName });
        dataObj.Variables.push({ Key: 'PrintedDateTime', Value: today.DateTime });
        dataObj.Variables.push({ Key: 'PrintedBy', Value: `Printed By: ${response.FirstName} ${response.LastName} on ` + today.ShortDate });
    }).then(function () {
        if (args.name == feedHistory) {
            return feedHistoryReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == tracebilityHistory) {
            return tracebilityHistoryReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printWaybill) {
            return printWaybillReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printeNVDCattle) {
            return printeNVDCattleReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printeNVDSheep) {
            return printeNVDSheepReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printeNVDBobbyCalves) {
            return printeNVDBobbyCalvesReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printeNVDGoat) {
            return printeNVDGoatReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
        else if (args.name == printeNVDEUCattle) {
            return printeNVDEUCattleReport(dataObj, language, args).then(function (res) {
                return res;
            });
        }
    }).then(function (response) {
        dataObj.ReportData = response;
        return getResponse(200, null, { dataObj });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = Promise.method(prepareForView);