'use strict';

/***********************************
 * Livestock related logic
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';

import { HttpStatus, getResponse, resMessages, jsonToCSVConvertor } from '../../lib/index';
import { formatDateTime, getMonthName, calculateAge } from '../../../shared/format/date';
import { map as _map } from 'lodash';
import { uuidToBuffer, bufferToUUID } from '../../../shared/uuid';

import { getLivestockConfiguration, setLivestockConfiguration } from '../../repository/contact';
import {
    getSireOrDamData, getLivestockDataSet, bulkCreateLivestock, bulkCreateLivestockAttribute,
    bulkCreateLivestockPropertyHistory, bulkCreateLivestockWeightHistory,
    bulkCreateLivestockStatusHistory, bulkCreateLivestockEnclosureHistory, bulkCreateMobCountHistory, bulkCreateLivestockEvent,
    exportLivestock, checkLivestockReference, updateLivestock, getLivestockByCondition, getLivestockById,
    getLivestockTracebility, getLivestockFeedHistory
} from '../../repository/livestock';
import { getLivestockOriginBinding } from '../../repository/livestockorigin';
import { getLivestockCategoryBinding } from '../../repository/livestockcategory';
import { getAllActivityStatus } from '../../repository/livestockactivitystatus';
import { getSpeciesBinding } from '../../repository/species';
import { getAllGender } from '../../repository/gender';
import { getLivestockColourBindings } from '../../repository/livestockcolour';
import { getBreedTypeBinding } from '../../repository/breedtype';
import { getDentitionBindings } from '../../repository/dentition';
import { getDisposalMethodBindings } from '../../repository/disposalmethod';
import { getEnclosureByPropertyId, getAll as getAllEnclosures } from '../../repository/enclosure';
import { getContemporaryGroupBindings } from '../../repository/contemporarygroup';
import { getGeneticStatusBindings } from '../../repository/geneticstatus';
import { getLivestockGroupBindings } from '../../repository/livestockgroup';
import { getEnclosureTypeBindings } from '../../repository/enclosuretype';
import { getConditionScoreBindings } from '../../repository/conditionscore';
import { getLivestockClassificationBindings } from '../../repository/livestockclassification';
import { getInductionInitialData, getPropertyDetailById } from '../../repository/property';
import { getMultisireGroupBindings } from '../../repository/multisiregroup';
import { getTagPlaceBindings } from '../../repository/tagplace';
import { getTagStatus, updateTag } from '../../repository/tag';
import { updateAudit } from './common';
import { getAllBreed } from '../../repository/breed';
import { getAllMaturity, getMaturityBySpeciesId } from '../../repository/maturity';
import { getSpeciesTypeBinding } from '../../repository/speciestype';
import { getConceptionMethodBindings } from '../../repository/conceptionmethod';
import { getScanPurposeBindings } from '../../repository/scanpurpose';
import { getAutoCompleteData } from '../../repository/company';
import { getUomByMeasureByType } from '../../repository/uombymeasure';
import { getSessionDataSet, getTreatmentSessionProductsByIds } from '../../repository/treatmentsession';
import { livestockActivityStatusCodes, tagStatusCodes, uomTypeCodes, eventTypes, chemicalProductService } from '../../../shared/constants';

// get livestock filter data
let getFilterData = (language, topPIC, filterObj, contactId) => {
    let responseData = null;
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getAllActivityStatus({ Language: language }).then(function (result) {
        responseData = { activityStatus: result };
        return getSpeciesBinding(language);
    }).then(function (result) {
        responseData.species = result;
        return getAllGender({ Language: language });
    }).then(function (result) {
        responseData.gender = result;
        return getLivestockOriginBinding(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.livestockOrigin = result;
        return getLivestockCategoryBinding(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.category = result;
        return getEnclosureByPropertyId(PropertyId, language);
    }).then(function (result) {
        responseData.enclosure = [];
        if (result.total > 0) {
            responseData.enclosure = _map(result.data, function (i) {
                return { Id: i.Id, Name: i.Name, NameCode: i.NameCode };
            })
        }
        return getLivestockConfiguration(contactId, null);
    }).then(function (result) {
        if (result) {
            responseData.filter = result.filter ? result.filter : filterObj.filter;
            responseData.pageSize = result.pageSize ? result.pageSize : filterObj.pageSize;
            responseData.columns = result.columns ? result.columns : filterObj.columns;
        }
        else {
            responseData.filter = filterObj.filter;
            responseData.pageSize = filterObj.pageSize;
            responseData.columns = filterObj.columns;
        }
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock filter data
let getFilterBySpecies = (language, speciesId, topPIC) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    let responseData = null;
    return getAllBreed({ Language: language, SpeciesId: speciesId }).then(function (result) {
        responseData = { breed: result };
        return getAllMaturity({ Language: language, SpeciesLanguage: language, SpeciesId: speciesId });
    }).then(function (result) {
        responseData.maturity = result;
        return getSpeciesTypeBinding(language, CompanyId, RegionId, BusinessId, PropertyId, speciesId);
    }).then(function (result) {
        responseData.speciesType = result;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock by server sorting/filtering/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj, language, searchText, contactId) => {
    filterObj.pageSize = pageSize;
    let newFilter = {
        filter: filterObj.filter,
        pageSize: filterObj.pageSize,
        columns: filterObj.columns
    }

    return setLivestockConfiguration(contactId, newFilter).then(function (result) {
        return getLivestockDataSet(pageSize, skipRec, sortOrder, sortColumn, filterObj, searchText, language);
    }).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

let getPrimaryDDLData = (language, speciesId, topPIC) => {
    let responseData = null;
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getSpeciesBinding(language).then(function (result) {
        responseData = { species: result };
        return getBreedTypeBinding(language);
    }).then(function (result) {
        responseData.breedType = result;
        return getAllActivityStatus({ Language: language })
    }).then(function (result) {
        responseData.activityStatus = result;
        return getAllGender({ Language: language });
    }).then(function (result) {
        responseData.sex = result;
        return getLivestockCategoryBinding(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.category = result;
        return getLivestockColourBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.livestockColour = result;
        return getLivestockOriginBinding(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.livestockOrigin = result;
        return getAllBreed({ Language: language, SpeciesId: speciesId });
    }).then(function (result) {
        responseData.breed = result;
        return getAllMaturity({ Language: language, SpeciesLanguage: language, SpeciesId: speciesId });
    }).then(function (result) {
        responseData.maturity = result;
        return getSpeciesTypeBinding(language, CompanyId, RegionId, BusinessId, PropertyId, speciesId);
    }).then(function (result) {
        responseData.speciesType = result;
        return getEnclosureTypeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.enclosureType = result;
        return getInductionInitialData(PropertyId);
    }).then(function (result) {
        responseData.propertyData = result;
        return getMultisireGroupBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.multisiregroup = result;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getSecondaryDDLData = (language, topPIC) => {
    let responseData = null;
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getDentitionBindings(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (result) {
        responseData = { dentition: result };
        return getContemporaryGroupBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.contemporaryGroup = result;
        return getGeneticStatusBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.geneticStatus = result;
        return getLivestockGroupBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.livestockGroup = result;
        return getConditionScoreBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.conditionScore = result;
        return getLivestockClassificationBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.classification = result;
        return getTagPlaceBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (result) {
        responseData.tagPlace = result;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock data based on click of select all
let getAllLivestockData = (filterObj, language, searchText) => {
    return getLivestockDataSet(null, null, 'asc', 'EID', filterObj, searchText, language).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response.data });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get sire or dam for autocomplete
let getSireOrDam = (language, filterObj) => {
    return getSireOrDamData(filterObj.speciesId, filterObj.type, filterObj.searchValue).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// export livestock data
let exportLivestockData = (filterObj, language) => {
    return exportLivestock(filterObj, language).then(function (response) {
        let responseData = [];
        _map(response, function (d) {
            if (d.LivestockWeight)
                d.LivestockWeight = d.LivestockWeight + ' KG';
            if (d.IsFinancierOwned != undefined && d.IsFinancierOwned != null)
                d.IsFinancierOwned = d.IsFinancierOwned == 1 ? 'Yes' : 'No';
            if (d.IsPPSR != undefined && d.IsPPSR != null)
                d.IsPPSR = d.IsPPSR == 1 ? 'Yes' : 'No';
            if (d.IsHGP != undefined && d.IsHGP != null)
                d.IsHGP = d.IsHGP == 1 ? 'Yes' : 'No';
            if (d.IsFreeMartin != undefined && d.IsFreeMartin != null)
                d.IsFreeMartin = d.IsFreeMartin == 1 ? 'Yes' : 'No';
            if (d.LastMonthOfShearing != undefined && d.LastMonthOfShearing != null)
                d.LastMonthOfShearing = d.LastMonthOfShearing == 0 ? 'Not known' : getMonthName(d.LastMonthOfShearing);
            if (d.Age)
                d.Age = calculateAge(d.Age) + ' Years';
            if (d.BirthDate)
                d.BirthDate = formatDateTime(d.BirthDate).ShortDate;
            if (d.InductionDate)
                d.InductionDate = formatDateTime(d.InductionDate).ShortDate;
            if (d.ScanDate)
                d.ScanDate = formatDateTime(d.ScanDate).ShortDate;
            if (d.ReminderDate)
                d.ReminderDate = formatDateTime(d.ReminderDate).DateTime;

            let obj = {};
            var keys = Object.keys(d);
            keys.map((k, i) => {
                obj[filterObj.displayName[i]] = d[k];
            });
            responseData.push(obj);
        });

        // let csv = json2csv({ data: responseData, fields: filterObj.displayName });
        // csv = csv.replace(/"/g, "");
        let csv = jsonToCSVConvertor(responseData, true);
        return getResponse(HttpStatus.SUCCESS, null, { data: csv });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get enclosure names by property id and enclosure type id
let getEnclosureNames = (propertyId, enclosureTypeId) => {

    let condition = {
        IsDeleted: 0,
        PropertyId: uuidToBuffer(propertyId),
        EnclosureTypeId: uuidToBuffer(enclosureTypeId)
    }
    let attr = [['UUID', 'Id'], 'Name', 'DefaultGPS'];

    return getAllEnclosures(attr, condition).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

// delete selected species and relative child tables
let remove = (uuids, auditLogIds, contactId, language) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }
    let totalCount = uuids.length;
    let pendingTagStatus, deleteLivestockIds;
    return checkLivestockReference(uuids).then(function (result) {
        return result;
    }).then(function (livestockObj) {
        deleteLivestockIds = livestockObj;
        return getTagStatus(language);
    }).then(function (res) {
        pendingTagStatus = res.filter((status) => {
            return status.SystemCode == tagStatusCodes.Pending;
        })[0].Id;
    }).then(function () {
        return deleteTransaction(contactId, auditLogIds, deleteLivestockIds, totalCount, pendingTagStatus);
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// delete selected species and relative child tables
let deleteTransaction = (contactId, auditLogIds, uuids, totalRecords, pendingTagStatus) => {
    return models.sequelize.transaction(function (t) {
        return updateAudit([], auditLogIds, contactId, t).then(function () {
            return updateLivestock({ IsDeleted: 1 }, { UUID: uuids }, t);
        }).then(function () {
            let updateObj = { CurrentStatusId: pendingTagStatus };
            let livestockIdBuffer = [];
            uuids.forEach(function (element) {
                livestockIdBuffer.push(uuidToBuffer(element));
            }, this);
            let condition = { CurrentLivestockId: livestockIdBuffer }
            return updateTag(updateObj, condition, t);
        });
    }).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { deletedCount: uuids.length, totalCount: totalRecords });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock details for split mob
let getSplitMobDetail = (uuid, topPIC, language) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    let response = null;
    let condition = `l.IsMob = 1 and l.UUID = '${uuid}'`;
    let joins = `left join speciesdata sd on sd.SpeciesId = l.SpeciesId`;
    let columns = `l.Mob, l.CurrentWeight, l.NumberOfHead, l.DefaultGPS, l.UUID as Id, l.InductionDate, l.BirthDate, l.CurrentEnclosureId, l.CurrentPropertyId, sd.SpeciesName`;
    return getLivestockByCondition(condition, joins, columns).then(function (resLivestock) {
        response = { livestock: resLivestock[0] };
        return getEnclosureTypeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (resEnclosureType) {
        response.enclosureType = resEnclosureType;
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getById = (ids) => {
    return getLivestockById(ids).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// get disposal methods
let getDisposalMethods = (language, topPIC) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getDisposalMethodBindings(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get conception methods
let getConceptionMethods = (language, topPIC) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getConceptionMethodBindings(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock by specific customization query
let getLivestockByCustomCondition = (select, join, where) => {
    return getLivestockByCondition(where, join, select).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { response: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get livestock details for merge mob
let getMergeMobDetail = (uuid, topPIC, language) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    let response = null;

    let condition = `l.UUID = '${uuid[0]}'`;
    let joins = `left join speciesdata sd on sd.SpeciesId = l.SpeciesId`;
    let columns = `sd.SpeciesName`;

    return getLivestockByCondition(condition, joins, columns).then(function (resSpecies) {
        response = { speciesName: resSpecies[0].SpeciesName };
        return getLivestockById(uuid);
    }).then(function (resLivestock) {
        response.livestock = resLivestock;
        return getEnclosureTypeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (resEnclosureType) {
        response.enclosureType = resEnclosureType;
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get dropdown data for record scan page
let getRecordScanData = (language, speciesId, topPIC) => {
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    let response = { conceptionMethods: [], conditionScores: [], dentitions: [], maturities: [], scanPurposes: [] };

    return getConceptionMethodBindings(language, CompanyId, RegionId, BusinessId, PropertyId)
        .then(function (conceptionMethods) {
            response.conceptionMethods = conceptionMethods;
        }).then(function () {
            return getMaturityBySpeciesId(speciesId, language);
        }).then(function (maturities) {
            response.maturities = maturities;
        }).then(function () {
            return getScanPurposeBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
        }).then(function (scanPurposes) {
            response.scanPurposes = scanPurposes;
        }).then(function () {
            return getConditionScoreBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
        }).then(function (scores) {
            response.conditionScores = scores;
        }).then(function () {
            return getDentitionBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
        }).then(function (dentitions) {
            response.dentitions = dentitions;
            return getResponse(HttpStatus.SUCCESS, null, { data: response });
        })
        .catch(function (err) {
            return getResponse(HttpStatus.SERVER_ERROR, err.toString());
        });
}

let getCompanyLookup = (language, pageSize, filterObj) => {
    return getAutoCompleteData(language, pageSize, filterObj).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get feed history for livestock from birth to death
function getFeedHistory(language, livestockId) {
    return getLivestockFeedHistory(language, livestockId).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get tracebility history of livestock
let getLivestockTracebilityHistory = (language, id) => {

    if (language == null || language == undefined) {
        language = 'en';
    }
    if (id == null || id == undefined) {
        throw new Error("Must provide id");
    }

    return getLivestockTracebility(language, id).then(function (response) {
        let data = _map(response.data, function (i) {
            i.Event = eventTypes[i.Event];
            return i;
        });
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
};

// get data for product of treatment session
let getTreatmentSessionProductData = (language, propertyId, livestockIds, sessionIds) => {
    let response = { uomData: [], propertyAddress: null };
    return getUomByMeasureByType(uomTypeCodes.Treatment, language).then(function (resUom) {
        response.uomData = resUom;
        return getPropertyDetailById(propertyId, language);
    }).then(function (resProperty) {
        response.address = resProperty.data[0].Suburb;

        let uuids = [];
        livestockIds.map(id => uuids.push(`'${id}'`));

        let condition = `l.UUID in (${uuids.join()})`;
        let joins = `left join livestockattribute la on la.LivestockId = l.Id`;
        let columns = `max(l.InductionDate) as InductionDate, max(la.ScanDate) as ScanDate`;
        return getLivestockByCondition(condition, joins, columns);
    }).then(function (resDates) {
        response.dates = resDates[0];
        if (sessionIds.length > 0)
            return getTreatmentSessionProductsByIds(sessionIds);
        else
            return [];
    }).then(function (resSessionProducts) {
        let sessionProductsArr = [];
        resSessionProducts.map(obj => {
            let productObj = {
                ...obj,
                ChemicalProductObj: {
                    Id: obj.ChemicalProductId,
                    Name: obj.ChemicalProduct
                },
                ChemicalProductStockObj: {
                    BatchNumber: obj.BatchNumber,
                    Cost: obj.StockCost,
                    Id: obj.ChemicalProductStockId,
                    StockOnHand: obj.StockOnHand
                }
            }
            productObj.DosageUoMId = bufferToUUID(obj.DosageUoMId);
            productObj.StockUoMId = bufferToUUID(obj.StockUoMId);
            productObj.SessionAuditLogId = bufferToUUID(obj.SessionAuditLogId);


            let serviceObj = chemicalProductService.find(x => x.Value == (obj.IsVaccineChemical ? '1' : '2'));
            productObj.Service = serviceObj.Text;

            sessionProductsArr.push(productObj);
        });
        response.sessionProducts = sessionProductsArr;
        return getResponse(HttpStatus.SUCCESS, null, { data: response });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// get treatment session by server sorting/filtering/paging
let getTreatmentSessionDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj) => {
    return getSessionDataSet(pageSize, skipRec, sortOrder, sortColumn, filterObj).then(function (response) {
        return getResponse(HttpStatus.SUCCESS, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    getLivestockFilterData: Promise.method(getFilterData),
    getLivestockFilterBySpecies: Promise.method(getFilterBySpecies),
    getLivestockDataSet: Promise.method(getDataSet),
    getLivestockPrimaryDDLData: Promise.method(getPrimaryDDLData),
    getLivestockSecondaryDDLData: Promise.method(getSecondaryDDLData),
    getAllLivestockData: Promise.method(getAllLivestockData),
    getSireOrDam: Promise.method(getSireOrDam),
    exportLivestockData: Promise.method(exportLivestockData),
    getEnclosureNames: Promise.method(getEnclosureNames),
    deleteLivestock: Promise.method(remove),
    getSplitMobDetail: Promise.method(getSplitMobDetail),
    getLivestockById: Promise.method(getById),
    getDisposalMethods: Promise.method(getDisposalMethods),
    getConceptionMethods: Promise.method(getConceptionMethods),
    getLivestockByCustomCondition: Promise.method(getLivestockByCustomCondition),
    getMergeMobDetail: Promise.method(getMergeMobDetail),
    getRecordScanData: Promise.method(getRecordScanData),
    getCompanyLookup: Promise.method(getCompanyLookup),
    getTreatmentSessionProductData: Promise.method(getTreatmentSessionProductData),
    getLivestockTracebilityHistory: Promise.method(getLivestockTracebilityHistory),
    getTreatmentSessionDataSet: Promise.method(getTreatmentSessionDataSet),
    getLivestockFeedHistory: Promise.method(getFeedHistory)
};