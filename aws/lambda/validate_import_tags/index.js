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

// get constants for NLIS Id and RFID validations
var manufacturers = constants.manufacturerCodes.map((code) => {
    return code.Text;
});
var rfidManufacturers = constants.rfidManufacturerCodes.map((code) => {
    return code.Text;
});
var devices = constants.deviceTypes.map((code) => {
    return code.Text;
});

// lambda invoke function
exports.handler = function (event, context) {
    require('./src/load.env')(event.body.env);

    var availableTagStatus, tagStatusIds = {}, accessiblePICs, picIds = {}, tagColourIds = {}, tags = {}, speciesIds = {},
        eidIndex, nlisIndex, issueDateIndex, picIndex, visualTagIndex, scanDateIndex, tagYearIndex,
        receivedDateIndex, descriptionIndex, statusIndex, csvData,
        validData = [], invalidData = [], totalIssues = [], invalidGridData = [], newMapping = [];


    var fileToProcess = event.body.fileToProcess,
        offset = event.body.offset,
        repo = require('./repo/repository');

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

    console.log(devices);
    console.log(rfidManufacturers);
    console.log(manufacturers);

    var s3 = new aws.S3();

    // firebaes initialization
    if (firebase.apps.length === 0) {
        firebase.initializeApp({
            credential: firebase.credential.cert(require(path.join(__dirname, './serviceAccountKey.json'))),
            databaseURL: "https://aglive-v3.firebaseio.com"
        });
    }
    var firebaseRef = firebase.database().ref('/import-tag/' + event.body.firebaseKey + '/');

    event.body.mapping.map((ele) => {
        if (ele.mapColumn == 'EID') eidIndex = ele.index;
        else if (ele.mapColumn == 'NLIS ID') nlisIndex = ele.index;
        else if (ele.mapColumn == 'Issue Date') issueDateIndex = ele.index;
        else if (ele.mapColumn == 'PIC') picIndex = ele.index;
        else if (ele.mapColumn == 'Visual Tag') visualTagIndex = ele.index;
        else if (ele.mapColumn == 'Scan Date') scanDateIndex = ele.index;
        else if (ele.mapColumn == 'Tag Year') tagYearIndex = ele.index;
        else if (ele.mapColumn == 'Received Date') receivedDateIndex = ele.index;
        else if (ele.mapColumn == 'Description') descriptionIndex = ele.index;
        else if (ele.mapColumn == 'Status') statusIndex = ele.index;
    });

    if (eidIndex == undefined || nlisIndex == undefined || issueDateIndex == undefined || picIndex == undefined) {
        context.done(null, { status: 400, message: 'Please map all mandatory fields' });
    }

    console.log('Fetching data for validation');
    repo['tag'].getTagStatus(event.body.language).then(function (tagStatusRes) {
        availableTagStatus = tagStatusRes.map((tag) => {
            tagStatusIds[tag.StatusName] = repo['uuid'].bufferToUUID(tag.Id);
            return tag.StatusName;
        })
        return repo.getAccessiblePICs(event.body.contactId, event.body.language, event.body.isSiteAdministrator);
    }).then(function (accessiblePICRes) {
        accessiblePICs = accessiblePICRes.map((pic) => {
            picIds[pic.PIC] = pic.UUID;
            return pic.PIC
        });
        return repo['tag'].getTagColour();
    }).then(function (tagColourRes) {
        tagColourRes.forEach((colour) => {
            tagColourIds[colour.Year] = repo['uuid'].bufferToUUID(colour.Id);
        }, this);
        return repo['species'].getSpeciesBinding(event.body.language);
    }).then(function (speciesRes) {
        console.log(speciesRes);
        speciesRes.forEach((specy) => {
            speciesIds[specy.SpeciesName] = specy.Id;
        }, this);
        console.log(speciesIds);
        console.log('Retrieves objects from Amazon S3');
        s3.getObject({
            Bucket: event.body.bucket,
            Key: fileToProcess
        }).promise().then(function (data) {
            console.log('S3 object fetched');
            csvData = data.Body.toString().replace(/(?:\r)/g, '').split('\n');
            var EIDs = csvData.map((el) => {
                el = el.split(',');
                return el[eidIndex];
            });
            return repo['tag'].getTagByEID('EID', EIDs);
        }).then(function (tagsRes) {
            console.log(tagsRes);
            tagsRes.forEach(function (tag) {
                tags[tag.EID] = {
                    tagId: repo['uuid'].bufferToUUID(tag.Id),
                    auditId: repo['uuid'].bufferToUUID(tag.AuditLogId)
                };
            }, this);
            console.log('Validating data');
            try {
                csvData.forEach((row, i) => {
                    var element = row.split(',');
                    var issues = [];
                    //console.log(element);
                    if (element[0] != event.body.mapping[0].mapColumn) {
                        if (!tags[element[eidIndex]]) {
                            console.log('INSERT');
                            issues = issues.concat(EIDValidation(element[eidIndex]));
                            console.log(issues);
                            issues = issues.concat(NLISValidation(element[nlisIndex]));
                            issues = issues.concat(PICValidation(element[picIndex]));
                            issues = issues.concat(IssueDateValidation(element[issueDateIndex]));
                            issues = visualTagIndex ? issues.concat(VisualTagValidation(element[visualTagIndex])) : issues;
                            issues = scanDateIndex ? issues.concat(ScanDateValidation(element[scanDateIndex])) : issues;
                            issues = tagYearIndex ? issues.concat(TagYearValidation(element[tagYearIndex])) : issues;
                            issues = receivedDateIndex ? issues.concat(ReceivedDateValidation(element[receivedDateIndex])) : issues;
                            issues = descriptionIndex ? issues.concat(DescriptionValidation(element[descriptionIndex])) : issues;
                            issues = statusIndex ? issues.concat(StatusValidation(element[statusIndex])) : issues;
                            if (issues.length > 0) {
                                invalidData.push(element); totalIssues.push(issues.join('\n'));
                                invalidGridData.push({ line: i + offset, issues: issues.join('\n') });
                            }
                            else {
                                // insert
                                validData.push(newRow(element, i + offset));
                            }
                        }
                        else {
                            console.log('UPDATE');
                            // update
                            let row = newRow(element, i + offset);
                            row.push(tags[element[eidIndex]].auditId);
                            row.push(tags[element[eidIndex]].tagId);
                            validData.push(row);
                        }
                    }
                }, this);
            } catch (error) {
                console.log('Error : ' + error);
                context.done(null, { status: 500, message: error });
            }

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
    }).catch(function (Erorr) {
        console.log('Error : ' + Erorr);
        context.done(null, { status: 500, message: Erorr });
    });

    function EIDValidation(val) {
        console.log('EID');
        console.log(val);
        let issues = [];

        console.log('check eid log function - Start!');

        if (val == null || val == undefined || val == '') { issues.push('EID cannot be empty.'); return issues; }
        else if (val.length != 16) { issues.push('Invalid EID.'); return issues; }
        console.log(val.split(' '));
        let parts = val.split(' ');
        console.log(parts);
        if (parts.length != 2) { issues.push('Invalid EID.'); return issues; }
        else if (rfidManufacturers.indexOf(parts[0]) == -1)
        { issues.push('Invalid manufacturer code in RFID.'); return issues; }

        console.log('check eid log function - End!');

        return issues;
    }

    function NLISValidation(val) {
        console.log('NLIS');
        console.log(val);
        val.charAt(8);
        let issues = [];
        if (val == null || val == undefined || val == '') { issues.push('NLIS Id cannot be empty'); return issues; }
        else if (val.length != 16) { issues.push('Invalid NLIS Id.'); return issues; }

        if (manufacturers.indexOf(val.charAt(8)) == -1) issues.push('Invalid manufacturer code in NLIS Id.')
        if (devices.indexOf(val.charAt(9)) == -1) issues.push('Invalid device type in NLIS Id.');
        if (!val.charAt(10).match(/[a-z]/i)) issues.push('Invalid year character in NLIS Id.')

        return issues;
    }

    function PICValidation(val) {
        console.log('PIC');
        console.log(val);
        let issues = [];
        if (!val) { issues.push('PIC cannot be empty.'); return issues; }
        else if (val.length != 8) { issues.push('Invalid PIC.'); return issues; }
        else if (accessiblePICs.indexOf(val) == -1) {
            issues.push('PIC ' + val + ' is not accessible to user.');
            return issues;
        }

        return issues;
    }

    function IssueDateValidation(val) {
        let issues = [];
        console.log('IssueDateValidation');
        console.log(val);
        if (val == null || val == undefined || val == '') { issues.push('Issue date cannot be empty.'); return issues; }
        else if (!isValid(val, 'DD/MM/YYYY') || !isValid(val, 'DD-MM-YYYY')) { issues.push('Invalid issue date.'); return issues; }
        else if (checkFutureDate(val)) { issues.push('Issue date cannot be in future.'); return issues; }

        return issues;
    }

    function VisualTagValidation(val) {
        let issues = [];
        if ((val != null && val != undefined && val != '') && val.length > 50) { issues.push('Visual Tag should not exceed 50 characters.'); return issues; }

        return issues;
    }

    function ScanDateValidation(val) {
        let issues = [];
        if ((val != null && val != undefined && val != '') && !isValid(val, 'DD/MM/YYYY') || !isValid(val, 'DD-MM-YYYY')) { issues.push('Invalid scan date.'); return issues; }

        return issues;
    }

    function TagYearValidation(val) {
        let issues = [];
        if ((val != null && val != undefined && val != '') && val.length > 4) { issues.push('Invalid tag year.'); return issues; }

        return issues;
    }

    function ReceivedDateValidation(val) {
        let issues = [];
        if ((val != null && val != undefined && val != '') && !isValid(val, 'DD/MM/YYYY') || !isValid(val, 'DD-MM-YYYY')) { issues.push('Invalid received date.'); return issues; }

        return issues;
    }

    function DescriptionValidation(val) {
        let issues = [];
        if ((val != null && val != undefined && val != '') && val.length > 250) { issues.push('Description should not exceed 250 characters.'); return issues; }

        return issues;
    }

    function StatusValidation(val) {
        let issues = [];
        if (val && availableTagStatus.indexOf(val) == -1) issues.push('Invalid Status.');

        return issues;
    }

    function checkFutureDate(val) {
        return isBefore(new Date(), new Date(dateFromString(val)));
    }

    function newRow(element, rowNumber) {
        let row = [];

        let nlis = element[nlisIndex];
        let deviceChar = nlis.charAt(9);
        let yearChar = nlis.charAt(10);
        let colour, deviceType, TagColour;

        let device = constants.deviceTypes.find((d) => {
            return d.Text == deviceChar;
        });
        console.log(device);
        if (device.Value.indexOf('Post-breeder') != -1) {
            colour = 'Pink';
            TagColour = tagColourIds[colour];
        }
        else if (device.Species == 'Cattle') {
            colour = 'White';
            TagColour = tagColourIds[colour];
        }
        else {
            let yearCode = constants.yearCode.find((y) => {
                return y.Text == yearChar;
            })
            TagColour = tagColourIds[yearCode.Value]
        }
        row.push(rowNumber);
        row.push(element[eidIndex]);
        visualTagIndex ? row.push(element[visualTagIndex]) : row.push('');
        row.push(element[nlisIndex]);
        row.push(element[issueDateIndex]);
        receivedDateIndex ? row.push(element[receivedDateIndex]) : row.push('');
        row.push(picIds[element[picIndex]]);
        statusIndex ? row.push(tagStatusIds[element[statusIndex]]) : row.push(tagStatusIds['Pending']);
        row.push(TagColour);
        tagYearIndex ? row.push(element[tagYearIndex]) : row.push(new Date(dateFromString(element[issueDateIndex])).getFullYear());
        descriptionIndex ? row.push(element[descriptionIndex]) : row.push('');
        row.push(speciesIds[device.Species]);
        console.log(row);
        return row;
    }
}
