'use strict';

/*************************************
 * mail notification when NVD status change
 * *************************************/

import Promise from 'bluebird';

import { getPropertyAccessContacts } from '../../../repository/contact';
import { formatDateTime } from '../../../../shared/format/date';
import { isEmail, unescape } from '../../../../shared/format/string';
import { sendEmail } from '../../../lib/mailer';
import CompileTemplate from '../../../lib/compile-template';
import { encrypt } from '../../../../shared';
import { nvdStatusCodes, reportList } from '../../../../shared/constants';

import { getResponse, resMessages } from '../../../lib/index';

let sendNotificationEmail = (nvdSaveObj, nvdDetails, updatetatus, summarydata, contactId, language) => {
    let consignerContacts, consigneeContacts, emails = [], senders = [], title;
    let statusCode = updatetatus.SystemCode;
    if (statusCode == nvdStatusCodes.Pending) {
        title = 'is signed by consignor';
    } else if (statusCode == nvdStatusCodes.InTransit) {
        title = 'is signed by transporter';
    } else if (statusCode == nvdStatusCodes.Delivered) {
        title = 'is delivered by transporter';
    }

    let waybillname = reportList.printWaybill;
    let waybillparam = 'name=' + waybillname + '&id=' + nvdDetails.nvdId + '&contactid=' + contactId + '&language=' + language + '&type=Waybill';
    let waybillEncryptKey = encrypt(waybillparam);
    // window.open(this.siteURL + '/report-viewer?' + param, '_blank');

    let nvdType = nvdDetails.NVDType;
    let nvdname = reportList.printeNVDCattle;
    if (nvdType == 2)
        nvdname = reportList.printeNVDSheep;
    else if (nvdType == 3)
        nvdname = reportList.printeNVDBobbyCalves;
    else if (nvdType == 4)
        nvdname = reportList.printeNVDGoat;
    else if (nvdType == 5)
        nvdname = reportList.printeNVDEUCattle;
    let nvdparam = 'name=' + nvdname + '&id=' + nvdDetails.nvdId + '&contactid=' + contactId + '&language=' + language + '&type=eNVD';
    let nvdEncryptKey = encrypt(nvdparam);

    let data = {
        envdlink: process.env.SITE_URL + "/downloadreport?" + nvdEncryptKey,
        waybilllink: process.env.SITE_URL + "/downloadreport?" + waybillEncryptKey,
        title: title,
        referencenumber: nvdSaveObj.ReferenceNumber,
        totalcount: nvdSaveObj.TotalLivestockQty,
        species: nvdDetails.prepare_livestock.selectedSpeices.SpeciesName,
        serialnumber: '',
        status: updatetatus.StatusName,
        declarerackdate: formatDateTime(nvdDetails.consignor_declaration.acknowledgedate).ShortDate,
        summarydata: unescape(summarydata),
        livestockowner: nvdDetails.prepare_livestock.ownerOfLivestock,
        responsibleperson: `${nvdDetails.consignor_declaration.declarerFirstName} ${nvdDetails.consignor_declaration.declarerLastName}`,
        consignermobile: nvdDetails.consignor_declaration.declarerMobile,
        consignerpic: nvdDetails.prepare_livestock.ConsignedFromPIC,
        consigneraddress: `${nvdDetails.prepare_livestock.journeyCommencedAddress ?
            nvdDetails.prepare_livestock.journeyCommencedAddress + ', ' : ''}
            ${nvdDetails.prepare_livestock.suburb ?
            nvdDetails.prepare_livestock.suburb.suburbName + ' ' + nvdDetails.prepare_livestock.suburb.stateName + ' ' +
            nvdDetails.prepare_livestock.suburb.suburbPostCode : ''} `,
        transporter: nvdDetails.transporter.transporterCompanyName,
        drivername: nvdDetails.transporter.transporterDriverName,
        dirvermobile: nvdDetails.transporter.transporterMobile,
        vehicleregonumber: nvdSaveObj.VehicleRego,
        saleagentcompany: nvdDetails.sale_agent.saleAgentCompanyName,
        saleagentmobile: nvdDetails.sale_agent.saleAgentMobile,
        consigneepic: nvdDetails.consigned_to_property.ConsignedToPIC,
        consigneeaddress: `${nvdDetails.consigned_to_property.consignedtoAddress ?
            nvdDetails.consigned_to_property.consignedtoAddress + ', ' : ''} 
        ${nvdDetails.consigned_to_property.consignedtoSuburbData.suburbName} 
        ${nvdDetails.consigned_to_property.consignedtoSuburbData.stateName} 
        ${nvdDetails.consigned_to_property.consignedtoSuburbData.suburbPostCode}`,
        destinationpic: nvdDetails.consigned_to_property.DestinationPIC,
        destinationaddress: `${nvdDetails.consigned_to_property.destinationAddress ?
            nvdDetails.consigned_to_property.destinationAddress + ', ' : ''} 
        ${nvdDetails.consigned_to_property.destinationSuburbData.suburbName || ''} 
        ${nvdDetails.consigned_to_property.destinationSuburbData.stateName || ''} 
        ${nvdDetails.consigned_to_property.destinationSuburbData.suburbPostCode || ''}`
    }

    let subject = `eNVD ${data.referencenumber} with ${data.totalcount} ${data.species}(s) ${title}`;

    if (nvdDetails.consigned_to_property.consignedtoEmail && isEmail(nvdDetails.consigned_to_property.consignedtoEmail)) {
        emails.push(nvdDetails.consigned_to_property.consignedtoEmail);
        senders.push('');
    }
    if (nvdDetails.consignor_declaration.declarerEmail && isEmail(nvdDetails.consignor_declaration.declarerEmail)) {
        emails.push(nvdDetails.consignor_declaration.declarerEmail);
        senders.push(`${nvdDetails.consignor_declaration.declarerFirstName} ${nvdDetails.consignor_declaration.declarerLastName}`);
    }
    if (nvdDetails.transporter.transporterEmail && isEmail(nvdDetails.transporter.transporterEmail)) {
        emails.push(nvdDetails.transporter.transporterEmail);
        senders.push(`${nvdDetails.transporter.transporterFirstName} ${nvdDetails.transporter.transporterLastName}`);
    }
    if (nvdDetails.sale_agent.saleAgentEmail && isEmail(nvdDetails.sale_agent.saleAgentEmail)) {
        emails.push(nvdDetails.sale_agent.saleAgentEmail);
        senders.push(`${nvdDetails.sale_agent.saleAgentFirstName} ${nvdDetails.sale_agent.saleAgentLastName}`);
    }
    if (nvdDetails.consigned_to_property.destinationEmail && isEmail(nvdDetails.consigned_to_property.destinationEmail)) {
        emails.push(nvdDetails.consigned_to_property.destinationEmail);
        senders.push('');
    }
    return getPropertyAccessContacts(nvdDetails.prepare_livestock.ConsignedFromPICId, 0).then(function (res) {
        consignerContacts = res;
        consignerContacts.forEach(function (element) {
            emails.push(element.Email);
            senders.push(element.Name);
        }, this);
        return getPropertyAccessContacts(nvdDetails.consigned_to_property.ConsignedToPICId, 0);
    }).then(function (res) {
        consigneeContacts = res;
        consigneeContacts.forEach(function (element) {
            emails.push(element.Email);
            senders.push(element.Name);
        }, this);
        let uniqueSenders = [];
        let uniqueEmails = emails.filter(function (item, pos, self) {
            if (self.indexOf(item) == pos) {
                uniqueSenders.push(senders[pos]);
                return true;
            }
        });
        // uniqueEmails.push('nilay.kothari@zealousys.local');
        // uniqueSenders.push('Nilay Kothari');
        let mailPromises = [];
        uniqueEmails.forEach(function (element, i) {
            data.SenderName = uniqueSenders[i];
            let body = CompileTemplate("email/pendingnvdtemplate.html", data);
            mailPromises.push(sendEmail(process.env.NO_REPLY_EMAIL, element, subject, body));
        }, this);
        return Promise.all(mailPromises);
    }).then(function (res) {
        return res;
    });
}

module.exports = {
    sendNVDNotificationEmail: Promise.method(sendNotificationEmail)
}