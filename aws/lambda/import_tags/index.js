'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

var dateFromString = require('./src/validateDate').dateFromString,
    promise = require('bluebird'),
    aws = require('aws-sdk');

// lambda invoke function
exports.handler = function (event, context) {
    require('./src/load.env')(event.body.env);

    var repo = require('./repo/repository'),

        insertStr = `INSERT INTO tag (Id,EID,VisualTag,NLISID,IssueDate,ReceivedDate,OriginPropertyId,
    CurrentStatusId,TagColorId,TagYear,Description,SpeciesId,AuditLogId,UUID) VALUES `,
        auditInsertStr = `INSERT INTO auditlog (Id,CreatedBy,CreatedStamp,CreatedFromSource,UUID) VALUES `,
        insertArr = [], auditInsertArr = [],
        updateArr = [], auditUpdateArr = [],

        fileToProcess = event.body.fileToProcess,
        rowIndex = 0, eidIndex = 1, visualTagIndex = 2, nlisIndex = 3, issueDateIndex = 4,
        receivedDateIndex = 5, picIndex = 6, statusIndex = 7, tagColourIndex = 8, tagYearIndex = 9,
        descriptionIndex = 10, speciesIndex = 11, auditIndex = 12, tagIndex = 13;

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
    s3.getObject({
        Bucket: event.body.bucket,
        Key: fileToProcess
    }).promise().then(function (data) {
        console.log('S3 object fetched');
        data.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach((row, i) => {
            var element = row.split(',');

            if (element[tagIndex]) {
                // update
                let fieldArr = [];
                element[visualTagIndex] ? fieldArr.push(`VisualTag='${element[visualTagIndex]}'`) : null;
                element[nlisIndex] ? fieldArr.push(`NLISID='${element[nlisIndex]}'`) : null;
                element[issueDateIndex] ? fieldArr.push(`IssueDate='${dateFromString(element[issueDateIndex])}'`) : null;
                element[receivedDateIndex] ? fieldArr.push(`ReceivedDate='${dateFromString(element[receivedDateIndex])}'`) : null;
                element[picIndex] ? fieldArr.push(`OriginPropertyId=fn_UuidToBin('${element[picIndex]}')`) : null;
                element[statusIndex] ? fieldArr.push(`CurrentStatusId=fn_UuidToBin('${element[statusIndex]}')`) : null;
                element[tagColourIndex] ? fieldArr.push(`TagColorId=fn_UuidToBin('${element[tagColourIndex]}')`) : null;
                element[tagYearIndex] ? fieldArr.push(`TagYear='${element[tagYearIndex]}'`) : null;
                element[descriptionIndex] ? fieldArr.push(`Description='${element[descriptionIndex]}'`) : null;
                element[speciesIndex] ? fieldArr.push(`SpeciesId=fn_UuidToBin('${element[speciesIndex]}')`) : null;
                let strTag = `UPDATE tag SET ${fieldArr.join()} WHERE UUID='${element[tagIndex]}';`;
                updateArr.push(strTag);
                console.log(strTag);
                auditUpdateArr.push(`UPDATE auditlog SET ModifiedBy=fn_UuidToBin('${event.body.contactId}'),ModifiedStamp=now(),ModifiedFromSource='import-tag-csv' WHERE UUID='${element[auditIndex]}';`)
            }
            else {
                // insert
                let tagId = repo['uuid'].newUUID();
                let auditId = repo['uuid'].newUUID();
                let visualTag = element[visualTagIndex] ? `'${element[visualTagIndex]}'` : null;
                let receivedDate = (element[receivedDateIndex] ? `'${dateFromString(element[receivedDateIndex])}'` : null);
                let colorId = element[tagColourIndex] ? `fn_UuidToBin('${element[tagColourIndex]}')` : null;
                let description = element[descriptionIndex] ? `'${element[descriptionIndex]}'` : null;
                let speciesId = element[speciesIndex] ? `fn_UuidToBin('${element[speciesIndex]}')` : null;

                auditInsertArr.push(`(fn_UuidToBin('${auditId}'),fn_UuidToBin('${event.body.contactId}'),
                now(),'import-tag-csv','${auditId}')`);

                insertArr.push(`(fn_UuidToBin('${tagId}'),'${element[eidIndex]}',${visualTag},'${element[nlisIndex]}',
                '${dateFromString(element[issueDateIndex])}',${receivedDate},fn_UuidToBin('${element[picIndex]}'),
                fn_UuidToBin('${element[statusIndex]}'),${colorId},'${element[tagYearIndex]}',${description},
                ${speciesId},fn_UuidToBin('${auditId}'),'${tagId}')`);
            }
        }, this);

        console.log('Importing CSV records to DB');
        console.log(insertArr);
        auditInsertStr += auditInsertArr.join();
        insertStr += insertArr.join();
        repo['models'].sequelize.transaction(function (t) {
            if (insertArr.length > 0)
                return repo['models'].sequelize.query(auditInsertStr, { transaction: t }).then(function () {
                    return repo['models'].sequelize.query(insertStr, { transaction: t });
                });
            if (updateArr.length > 0)
                return repo['models'].sequelize.query(auditUpdateArr.join(' '), { transaction: t }).then(function () {
                    return repo['models'].sequelize.query(updateArr.join(' '), { transaction: t });
                });
        }).then(function () {
            console.log('Process completed.');
            context.done(null, 1);
        }).catch(function (err) {
            console.log('Error : ' + err);
            context.done(err);
        });
    });
}