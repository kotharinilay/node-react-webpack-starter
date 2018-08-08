'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

var dateFromString = require('./src/validateDate').dateFromString,
    promise = require('bluebird'),
    constants = require('./src/constants'),
    aws = require('aws-sdk');

// lambda invoke function
exports.handler = function (event, context) {
    require('./src/load.env')(event.body.env);

    var repo = require('./repo/repository'),

        insertEventStr = `INSERT INTO livestockevent (Id,PropertyId,LivestockId,EventType,EventDate,
        NumberOfHead,AuditLogId,UUID) VALUES `,
        insertStatusHistoryStr = `INSERT INTO livestockstatushistory (Id,LivestockId,PropertyId,
        ActivityStatusId,LivestockEventId,Comment,UUID) VALUES `,
        auditInsertStr = `INSERT INTO auditlog (Id,CreatedBy,CreatedStamp,CreatedFromSource,UUID) VALUES `,
        auditInsertArr = [], updateTagArr = [], insertLivestockEventArr = [], insertStatusHistoryArr = [],
        updateLivestockArr = [], auditUpdateArr = [],
        fileToProcess = event.body.fileToProcess,
        rowIndex = 0, livestockIdIndex = 1, livestockAuditIndex = 2, identifierIndex = 3, disposalMethodIndex = 4,
        deceasedDateIndex = 5, deathReasonIndex = 6, tagIdIndex = 7, tagAuditIndex = 8, deceasedTagStatus = null,
        deceasedLivestockStatus, modifiedSource = 'import-deceased-csv',
        propertyId = `fn_UuidToBin('${event.body.topPIC.PropertyId}')`;

    aws.config.setPromisesDependency(promise);

    // not need to update config while execute on AWS
    // only for local testing
    if (event.body.localTesting) {
        aws.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }
    var s3 = new aws.S3();

    console.log('Retrieves objects from Amazon S3');
    try {
        repo.getAllActivityStatus({ SystemCode: constants.livestockActivityStatusCodes.Deceased }).then(function (livestockStatus) {
            if (livestockStatus.length == 0) {
                context.done("Livestock Status - Deceased not available");
            }
            deceasedLivestockStatus = livestockStatus[0].Id;
            console.log(deceasedLivestockStatus);
            return repo.getTagStatus(event.body.language);
        }).then(function (tagStatus) {
            console.log(tagStatus);
            console.log(constants.tagStatusCodes.Deceased);
            deceasedTagStatus = tagStatus.filter((status) => {
                return status.SystemCode == constants.tagStatusCodes.Deceased;
            })[0].Id;
            deceasedTagStatus = repo['uuid'].bufferToUUID(deceasedTagStatus);
            console.log(deceasedTagStatus.Id);
            if (!deceasedTagStatus) {
                context.done("Tag Status - Deceased not available");
            }
            s3.getObject({
                Bucket: event.body.bucket,
                Key: fileToProcess
            }).promise().then(function (data) {
                console.log('S3 object fetched');
                data.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach((row, i) => {
                    var element = row.split(',');

                    // update
                    let livestockAttrFieldArr = [];
                    element[disposalMethodIndex] ? livestockAttrFieldArr.push(`DisposalMethodId=fn_UuidToBin('${element[disposalMethodIndex]}')`) : null;
                    element[deathReasonIndex] ? livestockAttrFieldArr.push(`DeathReason='${element[deathReasonIndex]}'`) : null;

                    let strUpdateLivestock = `UPDATE livestock SET ActivityStatusId=fn_UuidToBin('${deceasedLivestockStatus}') WHERE UUID='${element[livestockIdIndex]}';`;
                    updateLivestockArr.push(strUpdateLivestock);
                    let strUpdateLivestockAttr = `UPDATE livestockattribute SET 
                ${livestockAttrFieldArr.join()} WHERE LivestockId=fn_UuidToBin('${element[livestockIdIndex]}');`;
                    updateLivestockArr.push(strUpdateLivestockAttr);

                    auditUpdateArr.push(`UPDATE auditlog SET ModifiedBy=fn_UuidToBin('${event.body.contactId}'),
                ModifiedStamp=now(),ModifiedFromSource='${modifiedSource}' WHERE UUID='${element[livestockAuditIndex]}';`);

                    if (element[tagIdIndex]) {
                        updateTagArr.push(`UPDATE tag SET CurrentLivestockId=null,
                    CurrentStatusId=fn_UuidToBin('${deceasedTagStatus}') WHERE UUID='${element[tagIdIndex]}';`);
                        auditUpdateArr.push(`UPDATE auditlog SET ModifiedBy=fn_UuidToBin('${event.body.contactId}'),
                ModifiedStamp=now(),ModifiedFromSource='${modifiedSource}' WHERE UUID='${element[tagAuditIndex]}';`);
                    }

                    // insert livestock event and status history
                    let livestockEventId = repo['uuid'].newUUID();
                    let livestockEventAuditId = repo['uuid'].newUUID();
                    let statusHistoryId = repo['uuid'].newUUID();

                    let comment = element[deathReasonIndex] ? `'${element[deathReasonIndex]}'` : null;
                    let eventDate = (element[deceasedDateIndex] ? dateFromString(element[deceasedDateIndex]) : new Date());
                    let eventType = 'ActivityStatusUpdate';
                    let livestockId = element[livestockIdIndex] ? `fn_UuidToBin('${element[livestockIdIndex]}')` : null;

                    insertLivestockEventArr.push(`(fn_UuidToBin('${livestockEventId}'),${propertyId},${livestockId},
                '${eventType}','${eventDate}',1,fn_UuidToBin('${livestockEventAuditId}'),'${livestockEventId}')`);

                    insertStatusHistoryArr.push(`(fn_UuidToBin('${statusHistoryId}'),${livestockId},${propertyId},
                fn_UuidToBin('${deceasedLivestockStatus}'),fn_UuidToBin('${livestockEventId}'),
                ${comment},'${statusHistoryId}')`);

                    auditInsertArr.push(`(fn_UuidToBin('${livestockEventAuditId}'),fn_UuidToBin('${event.body.contactId}'),
                now(),'${modifiedSource}','${livestockEventAuditId}')`);
                }, this);


                auditInsertStr += auditInsertArr.join();
                insertEventStr += insertLivestockEventArr.join();
                insertStatusHistoryStr += insertStatusHistoryArr.join();

                console.log('--------------------------');
                console.log(insertEventStr);
                console.log('--------------------------');
                console.log(insertStatusHistoryStr);
                console.log('--------------------------');
                console.log(updateLivestockArr.join(' '));
                console.log('--------------------------');
                console.log(updateTagArr.join(' '));
                console.log('--------------------------');
                console.log(auditUpdateArr.join(' '));

                repo['models'].sequelize.transaction(function (t) {
                    return repo['models'].sequelize.query(auditInsertStr, { transaction: t }).then(function () {
                        return repo['models'].sequelize.query(insertEventStr, { transaction: t });
                    }).then(function () {
                        return repo['models'].sequelize.query(insertStatusHistoryStr, { transaction: t });
                    }).then(function () {
                        return repo['models'].sequelize.query(updateLivestockArr.join(' '), { transaction: t });
                    }).then(function () {
                        if (updateTagArr.length > 0)
                            return repo['models'].sequelize.query(updateTagArr.join(' '), { transaction: t });
                        else
                            return true;
                    }).then(function () {
                        return repo['models'].sequelize.query(auditUpdateArr.join(' '), { transaction: t });
                    });
                }).then(function () {
                    console.log('Process completed.');
                    context.done(null, 1);
                }).catch(function (err) {
                    console.log('Error : ' + err);
                    context.done(err);
                });
            });
        });
    } catch (error) {
        context.done(error);
    }
}