'use strict';

/***********************************
 * Logic related to setup group api
 * *********************************/

import Promise from 'bluebird';
import {
    createLivestockGroup, getLivestockGroupDataSet, getLivestockGroupCount,
    removeLivestockGroup, getLivestockGroupById, updateLivestockGroup,
    updateLivestockGroupLanguageData
} from '../../repository/livestockgroup';
import { createAuditLog, updateAuditLog } from '../../repository/auditlog';
import { toEmptyStr, getFirstChar, getLastChar } from '../../../shared/format/string';
import { newUUID, uuidToBuffer } from '../../../shared/uuid';
import { getResponse, resMessages } from '../../lib/index';
import models from '../../schema';
import { generateSystemCode } from '../../../shared';

// perform server validations
let serverValidations = (groupName, groupCode) => {
    if (!groupName) {
        return getResponse(400, 'VALIDATION.1026');
    }
    else if (!groupCode) {
        return getResponse(400, 'VALIDATION.1027');
    }
    else if (groupName.length > 50) {
        return getResponse(400, 'VALIDATION.1028');
    }
    else if (groupCode.length > 10) {
        return getResponse(400, 'VALIDATION.1029');
    }
    return null;
}

// create new group 
let create = (groupName, groupCode, contactId, configuredByAdmin) => {
    let response = serverValidations(groupName, groupCode);
    if (response != null)
        return response;

    return getLivestockGroupCount().then(function (count) {
        let systemCode = generateSystemCode(groupName, count);
        let groupId = newUUID();
        let auditId = newUUID();

        let auditObj = {
            Id: uuidToBuffer(auditId),
            UUID: auditId,
            CreatedBy: uuidToBuffer(contactId),
            CreatedStamp: new Date()
        }

        let groupObj = {
            Id: uuidToBuffer(groupId),
            UUID: groupId,
            IsConfiguredByAdmin: configuredByAdmin,
            SystemCode: systemCode,
            LocalizedData: [{
                LivestockGroupId: groupId,
                Language: 'en',
                GroupCode: groupCode,
                GroupName: groupName
            }],
            AuditLogId: uuidToBuffer(auditId)
        }
        return models.sequelize.transaction(function (t) {
            return Promise.all([
                createAuditLog(auditObj, t),
                createLivestockGroup(groupObj, t)
            ]);
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    }).catch(function (errCount) {
        return getResponse(500, errCount.toString());
    });
}

// update existing group details
let update = (groupName, groupCode, contactId, groupId, auditId, language) => {
    let response = serverValidations(groupName, groupCode);
    if (response != null)
        return response;

    return getLivestockGroupById(groupId, language).then(function (res) {
        return res;
    }).then(function (detail) {
        let groupCondition = {
            Id: uuidToBuffer(groupId)
        }

        let groupObj = {
            LocalizedData: [{
                LivestockGroupId: groupId,
                Language: 'en',
                GroupCode: groupCode,
                GroupName: groupName
            }]
        };
        let auditCondition = {
            Id: uuidToBuffer(auditId)
        }
        let auditObj = {
            ModifiedBy: uuidToBuffer(contactId),
            ModifiedStamp: new Date(),
            ModifiedFromSource: 'web'
        }
        return models.sequelize.transaction(function (t) {
            return updateAuditLog(auditObj, auditCondition, t).then(function () {
                return updateLivestockGroupLanguageData(groupObj.LocalizedData, t);
            });
        }).then(function (res) {
            return getResponse();
        }).catch(function (err) {
            return getResponse(500, err.toString());
        });
    });
}

// fetch group by server paging/filtering/sorting
let getDataSet = (pageSize, skipRec, sortColumn, sortOrder, searchText, language) => {
    return getLivestockGroupDataSet(pageSize, skipRec, sortOrder, sortColumn, searchText, language).then(function (response) {
        return getResponse(200, null, response);
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

// delete selected groups
let remove = (uuids, auditLogIds, contactId) => {
    if (uuids.length == 0 || auditLogIds.length == 0) {
        return getResponse(400, resMessages.selectAtLeastOne);
    }

    let groupObj = {
        IsDeleted: 1,
        LocalizedData: []
    }
    let auditObj = {
        DeletedBy: uuidToBuffer(contactId),
        DeletedStamp: new Date(),
        DeletedFromSource: 'web'
    }
    auditLogIds = auditLogIds.map(function (r) {
        return new uuidToBuffer(r);
    });
    return models.sequelize.transaction(function (t) {
        return Promise.all([
            updateAuditLog(auditObj, { Id: auditLogIds }, t),
            updateLivestockGroup(groupObj, { UUID: uuids }, t)
        ]);
    }).then(function (res) {
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });

}

// get group detail by Id
let getDetail = (id, language) => {
    return getLivestockGroupById(id, language).then(function (response) {
        return getResponse(200, null, { data: response });
    }).catch(function (err) {
        return getResponse(500, err.toString());
    })
}

module.exports = {
    getLivestockGroupDataSet: Promise.method(getDataSet),
    getLivestockGroupDetail: Promise.method(getDetail),
    createLivestockGroup: Promise.method(create),
    updateLivestockGroup: Promise.method(update),
    deleteLivestockGroup: Promise.method(remove)
}