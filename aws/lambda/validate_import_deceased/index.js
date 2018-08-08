'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

var path = require('path'),
    constants = require('./src/constants'),
    isBefore = require('./src/validateDate').isBefore,
    isValid = require('./src/validateDate').isValid,
    dateFromString = require('./src/validateDate').dateFromString,
    promise = require('bluebird'),
    aws = require('aws-sdk'),
    firebase = require('firebase-admin');

// lambda invoke function
exports.handler = function (event, context) {
    require('./src/load.env')(event.body.env);

    var accessiblePICs, disposalMethods, livestockData, identifierIndex, deceasedDateIndex, disposalMethodIndex,
        deathReasonIndex, csvData, validData = [], invalidData = [], totalIssues = [], invalidGridData = [];

    var fileToProcess = event.body.fileToProcess,
        offset = event.body.offset,
        topPIC = event.body.topPIC,
        repo = require('./repo/repository');

    try {
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

        // firebaes initialization
        if (firebase.apps.length === 0) {
            firebase.initializeApp({
                credential: firebase.credential.cert(require(path.join(__dirname, './serviceAccountKey.json'))),
                databaseURL: "https://aglive-v3.firebaseio.com"
            });
        }
        var firebaseRef = firebase.database().ref('/import-deceased/' + event.body.firebaseKey + '/');

        event.body.mapping.map((ele) => {
            if (ele.mapColumn.toLowerCase() == event.body.identifier.toLowerCase()) identifierIndex = ele.index;
            else if (ele.mapColumn == 'Deceased Date') deceasedDateIndex = ele.index;
            else if (ele.mapColumn == 'Disposal Method') disposalMethodIndex = ele.index;
            else if (ele.mapColumn == 'Death Reason') deathReasonIndex = ele.index;
        });

        if (identifierIndex == undefined || disposalMethodIndex == undefined) {
            context.done(null, { status: 400, message: 'Please map all mandatory fields' });
        }

        console.log('Fetching data for validation');
        repo.getAccessiblePICs(event.body.contactId, event.body.language).then(function (accessiblePICRes) {
            accessiblePICs = `fn_UuidToBin('${topPIC.PropertyId}')`
            accessiblePICRes.map((pic) => {
                accessiblePICs = accessiblePICs + `,fn_UuidToBin('${pic.UUID}')`;
            });

            return repo.getDisposalMethodBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function (disposalMethodRes) {
            disposalMethods = disposalMethodRes;
            console.log('Retrieves objects from Amazon S3');
            s3.getObject({
                Bucket: event.body.bucket,
                Key: fileToProcess
            }).promise().then(function (data) {
                console.log('S3 object fetched');
                csvData = data.Body.toString().replace(/(?:\r)/g, '').split('\n');

                var identifierValues = null;
                csvData.map((el) => {
                    el = el.split(',');
                    if (identifierValues) { identifierValues = identifierValues + `,'${el[identifierIndex]}'`; }
                    else { identifierValues = `'${el[identifierIndex]}'`; }
                });

                let join = 'left JOIN livestockactivitystatus las ON l.ActivityStatusId = las.Id';
                let select = `l.${event.body.identifier},l.UUID ,l.AuditLogId, 
            fn_BinToUuid(l.CurrentPropertyId) AS PropertyId, las.SystemCode`;
                let where = ` l.CurrentPropertyId IN (${accessiblePICs}) AND
             l.${event.body.identifier} IN (${identifierValues}) `;

                if (event.body.identifier == 'EID' || event.body.identifier == 'NLISID') {
                    join += ` left join tag t on t.Id = l.CurrentTagId `;
                    select += ',t.AuditLogId as TagAuditLogId,t.UUID as TagUUID';
                }

                return repo.getLivestockByCondition(where, join, select);
            }).then(function (livestockRes) {
                console.log('-----------------------------------------');
                console.log(livestockRes);
                livestockData = livestockRes;
                console.log('Validating data');
                csvData.forEach((row, i) => {
                    var element = row.split(',');
                    var issues = [];
                    //console.log(element);
                    if (element[0] != event.body.mapping[0].mapColumn) {
                        issues = deceasedDateIndex ? issues.concat(DeceasedDateValidation(element[deceasedDateIndex])) : issues;
                        issues = issues.concat(ValidateIdentifier(element, i));

                        if (issues.length > 0) {
                            invalidData.push(element); totalIssues.push(issues.join('\n'));
                            invalidGridData.push({ line: i + offset, issues: issues.join('\n') });
                        }
                    }
                }, this);

                console.log('Invalid data length : ' + invalidGridData.length);
                return firebaseRef.push(invalidGridData).then(function (res) {
                    console.log('Creating valid CSV file to S3');
                    return s3.putObject({
                        Bucket: event.body.bucket,
                        Key: fileToProcess.substring(0, fileToProcess.lastIndexOf(".")) + "_Valid" + fileToProcess.substring(fileToProcess.lastIndexOf(".")),
                        Body: validData.join('\n')
                    }).promise()
                }).then(function (params) {
                    return true;
                }).catch(function (s3err) {
                    console.log('Firebase error : ' + s3err);
                    throw new Error(s3err);
                })
            }).then(function (params) {
                console.log('Process completed.');
                context.done(null, 1);
            }).catch(function (err) {
                console.log('Error : ' + err);
                context.done(null, { status: 500, message: err });
            });
        });
    } catch (error) {
        context.done(null, { status: 500, message: error });
    }

    function ValidateIdentifier(element, i) {
        var val = element[identifierIndex], issues = [], currentLivestock;
        if (val == null || val == undefined || val == '') { issues.push('Identifier cannot be empty.'); return issues; }
        currentLivestock = livestockData.filter((livestock) => {
            return livestock[event.body.identifier] == val;
        });
        if (currentLivestock.length < 1) { issues.push(`No Livestock found for '${val}'.`); return issues; }
        if (currentLivestock.length > 1) { issues.push(`Multiple Livestock found for '${val}'.`); return issues; }
        let statusCode = currentLivestock[0].SystemCode;
        if (statusCode == constants.livestockActivityStatusCodes.Killed ||
            statusCode == constants.livestockActivityStatusCodes.Deceased) {
            issues.push(`Livestock '${val}' already deceased/killed.`);
            return issues;
        }
        let disposalMethod = DisposalMethodValidation(element[disposalMethodIndex]);
        if (disposalMethod == null || disposalMethod == undefined) {
            issues.push(`Invalid disposal method.`);
            return issues;
        }
        if (issues.length < 1) {
            validData.push(newRow(element, i + offset, currentLivestock[0], disposalMethod));
        }
        return issues;
    }

    function DeceasedDateValidation(val) {
        var issues = [];
        if ((val != null && val != undefined && val != '') && (!isValid(val, 'DD/MM/YYYY') || !isValid(val, 'DD-MM-YYYY'))) { issues.push('Invalid deceased date.'); return issues; }
        return issues;
    }

    function DisposalMethodValidation(val) {
        let disposalMethod = disposalMethods.filter((ele) => {
            return ele.MethodCode.toLowerCase() == val.toLowerCase() ||
                ele.MethodName.toLowerCase() == val.toLowerCase();
        })[0];
        return disposalMethod;
    }

    function newRow(element, rowNumber, livestock, disposalMethod) {
        var row = [];

        row.push(rowNumber);
        row.push(livestock.UUID);
        row.push(repo['uuid'].bufferToUUID(livestock.AuditLogId));
        row.push(element[identifierIndex]);
        row.push(disposalMethod.Id);
        deceasedDateIndex ? element[deceasedDateIndex] ? row.push(element[deceasedDateIndex]) : new Date() : new Date();
        deathReasonIndex ? row.push(element[deathReasonIndex]) : row.push('');
        if (livestock.TagUUID != null && livestock.TagUUID != undefined && livestock.TagUUID != '') {
            row.push(livestock.TagUUID);
            row.push(repo['uuid'].bufferToUUID(livestock.TagAuditLogId));
        }
        else {
            row.push('');
            row.push('');
        }
        return row;
    }
}
