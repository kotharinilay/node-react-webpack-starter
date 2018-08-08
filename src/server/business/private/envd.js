'use strict';

/***********************************
 * e-NVD related logic
 * *********************************/

import Promise from 'bluebird';
import models from '../../schema';

import { map as _map } from 'lodash';

import { HttpStatus, getResponse, resMessages, jsonToCSVConvertor } from '../../lib/index';
import { getSpeciesBinding } from '../../repository/species';
import { getPropertyByCondition } from '../../repository/property';
import { getAllActivityStatus } from '../../repository/livestockactivitystatus';
import {
    getLivestockSummaryData, checkEUAccreditation, geteNVDDataSet, geteNVDLivestockDataSet, geteNVDStatusBinding,
    geteNVDById, getDeliveryInitialData, useLastAnswers, updateModel, getLivestockByCondition as getLivestockByNVDId
} from '../../repository/envd';
import { getAllProgram } from '../../repository/accreditationprogram';
import { getDentitionBindings } from '../../repository/dentition';
import {
    updateLivestock, getLivestockByCondition, bulkCreateLivestockStatusHistory,
    bulkCreateLivestockEvent
} from '../../repository/livestock';
import { readFileData, updateAudit, createAudit } from './common';

import {
    EIDValidation, NLISValidation, VisualTagValidation,
    SocietyIdValidation
} from '../../../shared/format/string';
import { uuidToBuffer, bufferToUUID } from '../../../shared/uuid/index';
import { livestockActivityStatusCodes, eventTypes, nvdImportTypes, varianceTypes } from '../../../shared/constants';
import { LivestockStatusHistoryMapper, LivestockEventMapper } from '../../schema/mapper';

var path = require('path');

let getPrepareLivestockData = (topPIC, propertyId, language, livestockIds) => {
    let responseData = null;
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getSpeciesBinding(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (result) {
        responseData = { species: result };
        let where = ` p.UUID = '${propertyId}'`;
        let select = `p.UUID AS PropertyId, p.PIC, p.Address, p.AuditLogId AS PropertyAuditId, p.Name AS PropertyName,
                      p.NLISUsername, p.NLISPassword, 
                      p.PropertyManagerId, s.UUID AS SuburbId, s.Name AS SuburbName, c.BusinessCountryId AS CountryId`;
        let joins = ` LEFT JOIN suburb s ON p.SuburbId = s.Id LEFT JOIN company c ON p.CompanyId = c.Id`;
        return getPropertyByCondition(where, joins, select);
    }).then(function (result) {
        responseData.propertyData = result;
        if (livestockIds && livestockIds.length > 0)
            return getLivestockSummaryData(livestockIds, language);
        else
            return false;
    }).then(function (result) {
        if (result)
            responseData.livestockSummaryData = result;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let isEUAccrediated = (consignedToPropertyId, destinationPropertyId) => {
    return checkEUAccreditation(consignedToPropertyId, destinationPropertyId).then(function (res) {
        return getResponse(HttpStatus.SUCCESS, null, { data: res });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getQuestionnaireData = (language, topPIC) => {
    let responseData = {};
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getAllProgram(language).then(function (response) {
        responseData.accreditationProgram = response;
        return getDentitionBindings(language, CompanyId, RegionId, BusinessId, PropertyId);
    }).then(function (response) {
        responseData.dentition = response;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// fetch all envd with server filtering/sorting/paging
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj, searchText) => {
    return geteNVDDataSet(pageSize, skipRec, sortOrder, sortColumn, filterObj, searchText).then(function (response) {
        return getResponse(200, null, response);
    });
}

// fetch envd livestock with server filtering/sorting/paging
let getLivestockDataSet = (pageSize, skipRec, sortColumn, sortOrder, filterObj, language) => {
    return geteNVDLivestockDataSet(pageSize, skipRec, sortOrder, sortColumn, filterObj, language).then(function (response) {
        return getResponse(200, null, response);
    });
}

// get nvd detail by id
let getDetail = (nvdId, language) => {
    return geteNVDById(nvdId, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

let geteNVDFilterData = (language, topPIC) => {
    let responseData = {};
    let { CompanyId, RegionId, BusinessId, PropertyId } = topPIC;
    return getSpeciesBinding(language, CompanyId, RegionId, BusinessId, PropertyId).then(function (response) {
        responseData.species = response;
        return geteNVDStatusBinding(language);
    }).then(function (response) {
        responseData.eNVDStatus = response;
        return getResponse(HttpStatus.SUCCESS, null, { data: responseData });
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

let getNVDDeliveryInitialData = (nvdId, contactId, language) => {
    return getDeliveryInitialData(nvdId, contactId, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

let useLasteNVDAnswers = (propertyId, eNVDType) => {
    return useLastAnswers(propertyId, eNVDType).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

let validateCSV = (mapping, uploadedFileData, identifier, language, contactId, nvdDetails, importType) => {
    let filePath = path.join(__dirname, '../../../../uploads/', uploadedFileData.name);
    let issues = [], issueGenerated = false, identifiers = [], inductLivestock = [], deceaseLivestock = [], livestocks;
    return readFileData(filePath).then(function (res) {
        let identifierIndex;
        mapping.forEach(function (ele) {
            if (ele.mapColumn == identifier) identifierIndex = ele.index;
        }, this);
        if (identifierIndex == undefined) {
            issues.push({ index: Math.random(), line: '', issue: 'Please map identifier column.' });
            issueGenerated = true;
            return false;
        }
        res.shift(); // remove header row
        res.forEach(function (row, i) {
            var element = row.split(',');
            if (element.length > 0) {
                if (identifier == 'EID' && !EIDValidation(element[identifierIndex]))
                    issues.push({ index: Math.random(), line: i + 1, issue: 'Invalid EID.' });
                else if (identifier == 'NLISID' && !NLISValidation(element[identifierIndex]))
                    issues.push({ index: Math.random(), line: i + 1, issue: 'Invalid NLIS Id.' });
                else if (identifier == 'Visual Tag' && !VisualTagValidation(element[identifierIndex]))
                    issues.push({ index: Math.random(), line: i + 1, issue: 'Invalid Visual Tag.' });
                else if (identifier == 'SocietyId' && !SocietyIdValidation(element[identifierIndex]))
                    issues.push({ index: Math.random(), line: i + 1, issue: 'Invalid Society Id.' });

                identifiers.push(`'${element[identifierIndex]}'`);
            }
        }, this);
        if (issues.length > 0) {
            issueGenerated = true;
            return false;
        }
        let select = `l.${identifier}, l.UUID AS Id, l.CurrentPropertyId`;
        let where = `l.${identifier} IN (${identifiers.join()})`;
        let joins = ``;

        return getLivestockByCondition(where, joins, select);
    }).then(function (res) {
        identifiers = identifiers.join().replace(/["']/g, "").split(',');
        if (issueGenerated) {
            return false;
        }
        livestocks = [...res];

        if (importType == nvdImportTypes.Variance) {
            if (nvdDetails.varianceType == varianceTypes.Less) {
                // res.length == nvdDetails.NVDLivestocks.length
                res.forEach(function (element, index) {
                    let isExist = nvdDetails.NVDLivestocks.filter((nvdLivestock) => {
                        return element.Id == bufferToUUID(nvdLivestock.LivestockId);
                    })[0];
                    if (!isExist) {
                        issues.push({ index: Math.random(), line: '', issue: `${element[identifier]} is not in NVD.` });
                    }
                    else {
                        deceaseLivestock.push(element);
                    }
                }, this);
                if (issues.length > 0) {
                    issueGenerated = true;
                    return false;
                }
                else {
                    return { varianceType: varianceTypes.Less, deceaseLivestock: deceaseLivestock };
                }
            }
            else {
                if (identifier == 'EID' || identifier == 'NLISID' && res.length > 0) {
                    res.forEach(function (dupLivestock) {
                        issues.push({ index: Math.random(), line: '', issue: `${dupLivestock[identifier]} is already exist.` });
                    }, this);
                }
                else if (identifier == 'VisualTag' || identifier == 'SocietyId' && res.length > 0) {
                    res.forEach(function (dupLivestock) {
                        if (bufferToUUID(dupLivestock.CurrentPropertyId) == nvdDetails.DestinationPropertyId) {
                            issues.push({ index: Math.random(), line: '', issue: `${dupLivestock[identifier]} is already exist.` });
                        }
                    }, this);
                }

                if (issues.length > 0) {
                    issueGenerated = true;
                    return false;
                }
                else {
                    return { varianceType: varianceTypes.More, inductLivestock: identifiers };
                }
            }
        }
        else if (importType == nvdImportTypes.DeliveredLivestock) {
            let counter = 0;
            livestocks.forEach(function (element, index) {
                let isExist = nvdDetails.NVDLivestocks.filter((nvdLivestock) => {
                    return element.Id == bufferToUUID(nvdLivestock.LivestockId);
                })[0];

                if (!isExist) {
                    issues.push({ index: Math.random(), line: '', issue: `${element[identifier]} is not in NVD.` });
                }
                else {
                    res.splice(index - counter, 1);
                    counter++;
                }
            }, this);
            if (issues.length > 0) {
                // no need to further check
                // return issues to client
                issueGenerated = true;
                return false;
            }

            if (identifier == 'EID' || identifier == 'NLISID' && res.length > 0) {
                res.forEach(function (dupLivestock) {
                    issues.push({ index: Math.random(), line: '', issue: `${dupLivestock[identifier]} is already exist.` });
                }, this);
            }
            else if (identifier == 'VisualTag' || identifier == 'SocietyId' && res.length > 0) {
                res.forEach(function (dupLivestock) {
                    if (bufferToUUID(dupLivestock.CurrentPropertyId) == nvdDetails.DestinationPropertyId) {
                        issues.push({ index: Math.random(), line: '', issue: `${dupLivestock[identifier]} is already exist.` });
                    }
                }, this);
            }

            if (issues.length > 0) {
                // no need to further check
                // return issues to client
                issueGenerated = true;
                return false;
            }
            if (identifiers.length > nvdDetails.NVDLivestocks.length) {
                // +ve
                // get eid to be induct
                identifiers.forEach(function (id) {
                    let isExist = livestocks.filter((livestock) => {
                        return id == livestock[identifier];
                    })[0];
                    if (!isExist) {
                        inductLivestock.push(id);
                    }
                }, this);
                return { varianceType: varianceTypes.More, inductLivestock: inductLivestock };
            }
            else {
                // -ve
                nvdDetails.NVDLivestocks.forEach(function (nvdLivestock) {
                    let isExist = livestocks.filter((livestock) => {
                        return bufferToUUID(nvdLivestock.LivestockId) == livestock.Id;
                    })[0];
                    if (!isExist) {
                        deceaseLivestock.push({ Id: bufferToUUID(nvdLivestock.LivestockId) });
                    }
                }, this);
                return { varianceType: varianceTypes.Less, deceaseLivestock: deceaseLivestock };
            }
        }
        else {
            issueGenerated = true;
            issues.push({ index: Math.random(), line: '', issue: 'Invalid request data.' });
            return false;
        }
    }).then(function (res) {
        if (issueGenerated) {
            return getResponse(HttpStatus.SUCCESS, null, { issues: true, data: issues });
        }
        else {
            return getResponse(HttpStatus.SUCCESS, null, { issues: false, data: res });
        }
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });
}

// delete selected eNVD
let remove = (uuids, auditLogIds, deleteComment, contactId, language) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(HttpStatus.BAD_REQUEST, resMessages.selectAtLeastOne);
    }

    let deleteObj = {
        IsDeleted: 1,
        DeleteComment: deleteComment
    }

    let bufferIds = uuids.map(function (r) {
        return uuidToBuffer(r);
    });

    let livestockArr = [];
    let statusHistoryBulk = [];
    let livestockEventBulk = [];
    let livestockActivityId = null;

    return models.sequelize.transaction(function (t) {
        return updateAudit([], auditLogIds, contactId, t).then(function () {
            return updateModel(deleteObj, 'nvd', { UUID: uuids }, t);
        }).then(function () {
            return getLivestockByNVDId(['LivestockId'], { NVDId: bufferIds }, t);
        }).then(function (res) {
            livestockArr = _map(res, 'LivestockId');
            return getAllActivityStatus({ Language: language });
        }).then(function (res) {
            livestockActivityId = res.filter((status) => {
                return status.SystemCode == livestockActivityStatusCodes['Available'];
            })[0].Id;
            return updateLivestock({ ActivityStatusId: uuidToBuffer(livestockActivityId) }, { Id: livestockArr }, t);
        }).then(function () {
            let uuids = [];
            livestockArr.map(d => {
                let id = bufferToUUID(d)
                uuids.push(`'${id}'`);
            });
            let condition = `l.UUID in (${uuids.join()})`;
            return getLivestockByCondition(condition, '', 'l.Id, l.CurrentPropertyId, l.DefaultGPS, l.CurrentEnclosureId, l.NumberOfHead');
        }).then(function (res) {
            let auditIds = [];
            _map(res, l => {
                // Livestock Event
                let reference = `Status: ${livestockActivityStatusCodes.Available}`;
                let livestockEventObj = LivestockEventMapper(uuidToBuffer(l.Id), uuidToBuffer(l.CurrentPropertyId),
                    uuidToBuffer(l.CurrentEnclosureId),
                    l.NumberOfHead, eventTypes.ModifyStatus, new Date(), l.DefaultGPS, reference);
                auditIds.push(livestockEventObj.LivestockEvent_AuditLogId);

                // Status History
                let livestockStatusHistoryObj = LivestockStatusHistoryMapper(uuidToBuffer(l.Id),
                    uuidToBuffer(l.CurrentPropertyId), uuidToBuffer(livestockActivityId),
                    l.DefaultGPS, null, livestockEventObj.LivestockEvent.Id);

                statusHistoryBulk.push(livestockStatusHistoryObj);
                livestockEventBulk.push(livestockEventObj.LivestockEvent);
            });
            return createAudit(auditIds, contactId, t);
        }).then(function () {
            return bulkCreateLivestockEvent(livestockEventBulk, t);
        }).then(function () {
            return bulkCreateLivestockStatusHistory(statusHistoryBulk, t);
        });
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(HttpStatus.SERVER_ERROR, err.toString());
    });

}

module.exports = {
    getPrepareLivestockData: Promise.method(getPrepareLivestockData),
    isEUAccrediated: Promise.method(isEUAccrediated),
    getQuestionnaireData: Promise.method(getQuestionnaireData),
    geteNVDDataSet: Promise.method(getDataSet),
    geteNVDLivestockDataSet: Promise.method(getLivestockDataSet),
    geteNVDFilterData: Promise.method(geteNVDFilterData),
    geteNVDDetail: Promise.method(getDetail),
    getNVDDeliveryInitialData: Promise.method(getNVDDeliveryInitialData),
    useLastAnswers: Promise.method(useLasteNVDAnswers),
    validateCSV: Promise.method(validateCSV),
    deleteeNVD: Promise.method(remove)
};