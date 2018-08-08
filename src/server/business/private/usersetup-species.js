'use strict';

/***********************************
 * Company species
 * *********************************/

import Promise from 'bluebird';
import { map } from 'lodash';
import { getCompanySpeciesDetails, createCompanySpecies, removeCompanySpecies } from '../../repository/companyspecies';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { HttpStatus, getResponse, resMessages } from '../../lib/index';
import models from '../../schema';

// add/update company species
let create = (obj, contactId, companyId, isSuperUser) => {
    if (isSuperUser != 1 || !contactId)
        return getResponse(HttpStatus.UNAUTHORIZED, resMessages.unauthorized);

    obj.map(d => {
        let uuid = newUUID();

        d.UUID = uuid;
        d.Id = uuidToBuffer(uuid);
        d.ContactId = uuidToBuffer(contactId);
        d.CreatedStamp = new Date();

        d.SpeciesId = uuidToBuffer(d.SpeciesId);
        d.CompanyId = d.CompanyId ? uuidToBuffer(d.CompanyId) : null;
        d.RegionId = d.RegionId ? uuidToBuffer(d.RegionId) : null;
        d.BusinessId = d.BusinessId ? uuidToBuffer(d.BusinessId) : null;
        d.PropertyId = d.PropertyId ? uuidToBuffer(d.PropertyId) : null;

    });

    return models.sequelize.transaction(function (t) {
        return removeCompanySpecies({ CompanyId: uuidToBuffer(companyId) }, t).then(function () {
            return createCompanySpecies(obj, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

// get dose by measures
let getDetail = (language, companyId, isSuperUser) => {
    if (isSuperUser != 1)
        return getResponse(HttpStatus.UNAUTHORIZED, resMessages.unauthorized);

    return getCompanySpeciesDetails(language, companyId).then(function (response) {

        let resultData = {
            company: [],
            region: [],
            business: [],
            property: []
        }

        let propertyArr = [];
        let businessArr = [];
        let regionArr = [];

        response.result.map(d => {
            if (d.PropertyId) {
                let obj = propertyArr.find(x => x.Property == d.PropertyId && x.Region == d.PRId && x.Business == d.PBId);
                if (obj)
                    obj.Id.push(d.SpeciesId);
                else
                    propertyArr.push({ Property: d.PropertyId, Region: d.PRId, Business: d.PBId, Id: [d.SpeciesId] });
            }
            else if (d.BusinessId) {
                let obj = businessArr.find(x => x.Business == d.BusinessId && x.Region == d.RegionId);
                if (obj)
                    obj.Id.push(d.SpeciesId);
                else
                    businessArr.push({ Business: d.BusinessId, Region: d.RegionId, Id: [d.SpeciesId] });
            }
            else if (d.RegionId) {
                let obj = regionArr.find(x => x.Region == d.RegionId);
                if (obj)
                    obj.Id.push(d.SpeciesId);
                else
                    regionArr.push({ Region: d.RegionId, Id: [d.SpeciesId] });
            }
            else if (d.CompanyId) {
                resultData.company.push(d.SpeciesId);
            }
        });

        resultData.region = regionArr;
        resultData.business = businessArr;
        resultData.property = propertyArr;

        response.resultData = resultData;

        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    });
}

module.exports = {
    saveCompanySpecies: Promise.method(create),
    getCompanySpecies: Promise.method(getDetail)
}