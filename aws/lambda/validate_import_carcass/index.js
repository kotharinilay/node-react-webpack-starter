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
exports.handler = function(event, context) {
    require('./src/load.env')(event.body.env);

    var accessiblePICs, dentitions, carcassCategories, buttShapes, boningGroups, msaGraders, hangMethods,
        meatColours, fatColours, gradeCodes, livestockData, csvData, validData = [], invalidData = [],
        totalIssues = [], invalidGridData = [];

    var identifierIndex, chainNumberIndex, processedDateIndex, processedTimeIndex, fromBodyNumberIndex,
        toBodyNumberIndex, mobNameIndex, livestockCountIndex, operatorNumberIndex, lotNumberIndex,
        processedPICIndex, fatThicknessIndex, ribFatnessIndex, rumpFatThicknessIndex, carcassWeightIndex,
        dentitionIndex, liveCarcassWeightIndex, hotStandardCarcassWeightIndex, bruiseScoreIndex, carcassCategoryIndex,
        buttShapeIndex, eqsReferenceIndex, producerLicenseNumberIndex, msaStartCodeIndex, bonigGroupIndex,
        msaGraderIndex, gradeDateIndex, leftSideScanTimeIndex, rightSideScanTimeIndex, hangMethodIndex,
        HGPIndex, leftSideHSCWIndex, rightSideHSCWIndex, brandIndex, priceIndex, destIndex, versionOfMSAModelIndex,
        tropicalBreedContentIndex, humpColdIndex, eyeMuscleAreaIndex, ossificationIndex, ausMarblingIndex,
        msaMarblingIndex, meatColourIndex, fatColourIndex, fatMuscleIndex, fatDepthIndex, pHIndex,
        loinTemperatureIndex, isMilkFedVealerIndex, costIndex, isRinseIndex, humpHeightIndex, isMSASaleyardIndex,
        isRIBIndex, feedTypeIndex, dressingPercentageIndex, retailProductYieldIndex, diseaseIndex,
        gradeCodeIndex, isGrassSeedIndex, isArthritisIndex;

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
        var firebaseRef = firebase.database().ref('/import-carcass/' + event.body.firebaseKey + '/');

        event.body.mapping.map((ele) => {
            if (ele.mapColumn.toLowerCase() == event.body.identifier.toLowerCase()) identifierIndex = ele.index;
            else if (ele.mapColumn == 'Chain Number') chainNumberIndex = ele.index;
            else if (ele.mapColumn == 'Processed Date') processedDateIndex = ele.index;
            else if (ele.mapColumn == 'Processed Time') processedTimeIndex = ele.index;
            else if (ele.mapColumn == 'From Body Number') fromBodyNumberIndex = ele.index;
            else if (ele.mapColumn == 'To Body Number') toBodyNumberIndex = ele.index;
            else if (ele.mapColumn == 'Mob Name') mobNameIndex = ele.index;
            else if (ele.mapColumn == 'Livestock Count') livestockCountIndex = ele.index;
            else if (ele.mapColumn == 'Operator Number') operatorNumberIndex = ele.index;
            else if (ele.mapColumn == 'Lot Number') lotNumberIndex = ele.index;
            else if (ele.mapColumn == 'Processed PIC') processedPICIndex = ele.index;
            else if (ele.mapColumn == 'Fat Thickness') fatThicknessIndex = ele.index;
            else if (ele.mapColumn == 'Rib Fatness') ribFatnessIndex = ele.index;
            else if (ele.mapColumn == 'Rump Fat Thickness') rumpFatThicknessIndex = ele.index;
            else if (ele.mapColumn == 'Carcass Weight') carcassWeightIndex = ele.index;
            else if (ele.mapColumn == 'Dentition') dentitionIndex = ele.index;
            else if (ele.mapColumn == 'Live Carcass Weight') liveCarcassWeightIndex = ele.index;
            else if (ele.mapColumn == 'Hot Standard Carcass Weight') hotStandardCarcassWeightIndex = ele.index;
            else if (ele.mapColumn == 'Bruise Score') bruiseScoreIndex = ele.index;
            else if (ele.mapColumn == 'Carcass Category') carcassCategoryIndex = ele.index;
            else if (ele.mapColumn == 'Butt Shape') buttShapeIndex = ele.index;
            else if (ele.mapColumn == 'EQS Reference') eqsReferenceIndex = ele.index;
            else if (ele.mapColumn == 'Producer License Number') producerLicenseNumberIndex = ele.index;
            else if (ele.mapColumn == 'MSA Start Code') msaStartCodeIndex = ele.index;
            else if (ele.mapColumn == 'Boning Group') bonigGroupIndex = ele.index;
            else if (ele.mapColumn == 'MSA Grader') msaGraderIndex = ele.index;
            else if (ele.mapColumn == 'Grade Date') gradeDateIndex = ele.index;
            else if (ele.mapColumn == 'Left Side Scan Time') leftSideScanTimeIndex = ele.index;
            else if (ele.mapColumn == 'Right Side Scan Time') rightSideScanTimeIndex = ele.index;
            else if (ele.mapColumn == 'Hang Method') hangMethodIndex = ele.index;
            else if (ele.mapColumn == 'HGP') HGPIndex = ele.index;
            else if (ele.mapColumn == 'Left Side HSCW') leftSideHSCWIndex = ele.index;
            else if (ele.mapColumn == 'Right Side HSCW') rightSideHSCWIndex = ele.index;
            else if (ele.mapColumn == 'Brand') brandIndex = ele.index;
            else if (ele.mapColumn == 'Price KG') priceIndex = ele.index;
            else if (ele.mapColumn == 'Dest') destIndex = ele.index;
            else if (ele.mapColumn == 'Version Of MSA Model') versionOfMSAModelIndex = ele.index;
            else if (ele.mapColumn == 'Tropical Breed Content') tropicalBreedContentIndex = ele.index;
            else if (ele.mapColumn == 'Hump Cold') humpColdIndex = ele.index;
            else if (ele.mapColumn == 'Eye Muscle Area') eyeMuscleAreaIndex = ele.index;
            else if (ele.mapColumn == 'Ossification') ossificationIndex = ele.index;
            else if (ele.mapColumn == 'AUS Marbling') ausMarblingIndex = ele.index;
            else if (ele.mapColumn == 'MSA Marbling') msaMarblingIndex = ele.index;
            else if (ele.mapColumn == 'Meat Colour') meatColourIndex = ele.index;
            else if (ele.mapColumn == 'Fat Colour') fatColourIndex = ele.index;
            else if (ele.mapColumn == 'Fat Muscle') fatMuscleIndex = ele.index;
            else if (ele.mapColumn == 'Fat Depth') fatDepthIndex = ele.index;
            else if (ele.mapColumn == 'pH') pHIndex = ele.index;
            else if (ele.mapColumn == 'Loin Temperature') loinTemperatureIndex = ele.index;
            else if (ele.mapColumn == 'Is Milk Fed Vealer') isMilkFedVealerIndex = ele.index;
            else if (ele.mapColumn == 'Cost') costIndex = ele.index;
            else if (ele.mapColumn == 'Is Rinse') isRinseIndex = ele.index;
            else if (ele.mapColumn == 'Hump Height') humpHeightIndex = ele.index;
            else if (ele.mapColumn == 'Is MSA Saleyard') isMSASaleyardIndex = ele.index;
            else if (ele.mapColumn == 'Is RIB') isRIBIndex = ele.index;
            else if (ele.mapColumn == 'Feed Type') feedTypeIndex = ele.index;
            else if (ele.mapColumn == 'Dressing Percentage') dressingPercentageIndex = ele.index;
            else if (ele.mapColumn == 'Retail Product Yield') retailProductYieldIndex = ele.index;
            else if (ele.mapColumn == 'Disease') diseaseIndex = ele.index;
            else if (ele.mapColumn == 'Grade Code') gradeCodeIndex = ele.index;
            else if (ele.mapColumn == 'Is Grass Seed') isGrassSeedIndex = ele.index;
            else if (ele.mapColumn == 'Is Arthritis') isArthritisIndex = ele.index;
        });

        if ((identifierIndex == undefined && mobNameIndex == undefined) || processedDateIndex == undefined
            || processedTimeIndex == undefined || processedPICIndex == undefined) {
            context.done(null, { status: 400, message: 'Please map all mandatory fields' });
        }

        repo.getAccessiblePICs(event.body.contactId, event.body.language).then(function(accessiblePICRes) {
            accessiblePICs = `fn_UuidToBin('${topPIC.PropertyId}')`
            accessiblePICRes.map((pic) => {
                accessiblePICs = accessiblePICs + `,fn_UuidToBin('${pic.UUID}')`;
            });

            return repo.getDentitionBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(dentitionRes) {
            dentitions = dentitionRes;
            return repo.getCarcassCategoryBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(carcassCategoryRes) {
            carcassCategories = carcassCategoryRes;
            return repo.getButtShapeBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(buttShapeRes) {
            buttShapes = buttShapeRes;
            return repo.getBoningGroupBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(boningGroupRes) {
            boningGroups = boningGroupRes;
            return repo.getMSAGraderBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(msaGraderRes) {
            msaGraders = msaGraderRes;
            return repo.getHangMethodBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(hangMethodRes) {
            hangMethods = hangMethodRes;
            return repo.getMeatColourBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(meatColourRes) {
            meatColours = meatColourRes;
            return repo.getFatColourBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(fatColourRes) {
            fatColours = fatColourRes;
            return repo.getGradeCodeBindings(event.body.language, topPIC.CompanyId, topPIC.RegionId,
                topPIC.BusinessId, topPIC.PropertyId);
        }).then(function(gradeCodeRes) {
            gradeCodes = gradeCodeRes;
            s3.getObject({
                Bucket: event.body.bucket,
                Key: fileToProcess
            }).promise().then(function(data) {
                csvData = data.Body.toString().replace(/(?:\r)/g, '').split('\n');

                var identifierValues = null;
                var mobNames = null;
                csvData.map((el) => {
                    el = el.split(',');
                    if (el[identifierIndex]) {
                        if (identifierValues)
                            identifierValues = identifierValues + `,'${el[identifierIndex]}'`;
                        else { identifierValues = `'${el[identifierIndex]}'`; }
                    }
                    else if (el[mobNameIndex]) {
                        if (mobNames)
                            mobNames = mobNames + `,'${el[mobNameIndex]}'`;
                        else { mobNames = `'${el[mobNameIndex]}'`; }
                    }
                });

                let join = 'left JOIN livestockactivitystatus las ON l.ActivityStatusId = las.Id';
                let select = `l.${event.body.identifier}, l.Mob, l.NumberOfHead, l.UUID, l.AuditLogId, 
                              l.CurrentPropertyId AS PropertyId, las.SystemCode`;
                let where = ` l.CurrentPropertyId IN (${accessiblePICs}) AND
             (l.${event.body.identifier} IN (${identifierValues}) OR (l.Mob IN (${mobNames}) AND l.NumberOfHead > 0))`;

                if (event.body.identifier == 'EID' || event.body.identifier == 'NLISID') {
                    join += ` left join tag t on t.Id = l.CurrentTagId `;
                    select += ',t.AuditLogId as TagAuditLogId,t.UUID as TagUUID';
                }

                return repo.getLivestockByCondition(where, join, select);
            }).then(function(livestockRes) {
                livestockData = livestockRes;
                console.log('--------------------------------------');
                console.log(livestockData);
                console.log('--------------------------------------');
                csvData.forEach((row, i) => {
                    var element = row.split(',');
                    var issues = [];
                    if (element[0] != event.body.mapping[0].mapColumn) {
                        chainNumberIndex != undefined ? lengthValidate(element[chainNumberIndex], 50) ?
                            null : issues.push('Chain Number should not exceed 50 characters.') : null;
                        !element[processedDateIndex] ? issues.push('Processed Date is empty.') :
                            DateValidation(element[processedDateIndex]) ? null : issues.push('Invalid Processed Time.');
                        !element[processedTimeIndex] ? issues.push('Processed Date is empty.') :
                            TimeValidation(element[processedTimeIndex]) ? null : issues.push('Invalid Processed Time.');
                        fromBodyNumberIndex != undefined ? isInt(element[fromBodyNumberIndex]) ?
                            null : issues.push('From Body Number should not exceed 50 characters.') : null;
                        toBodyNumberIndex != undefined ? isInt(element[toBodyNumberIndex]) ?
                            null : issues.push('To Body Number should not exceed 50 characters.') : null;
                        livestockCountIndex != undefined ? isInt(element[livestockCountIndex]) ?
                            null : issues.push('Invalid Livestock Count.') : null;
                        lotNumberIndex != undefined ? lengthValidate(element[lotNumberIndex], 50) ?
                            null : issues.push('Lot Number should not exceed 50 characters.') : null;
                        operatorNumberIndex != undefined ? lengthValidate(element[operatorNumberIndex], 50) ?
                            null : issues.push('Operator Number should not exceed 50 characters.') : null;
                        !element[processedPICIndex] ? issues.push('Processed PIC is empty.') :
                            lengthValidate(element[processedPICIndex], 10) ? null : issues.push('Invalid Processed PIC.');
                        carcassWeightIndex != undefined ? isFloat(element[carcassWeightIndex]) ?
                            null : issues.push('Invalid Carcass Weight.') : null;
                        fatThicknessIndex != undefined ? isFloat(element[fatThicknessIndex]) ?
                            null : issues.push('Invalid Fat Thickness.') : null;
                        ribFatnessIndex != undefined ? isFloat(element[ribFatnessIndex]) ?
                            null : issues.push('Invalid Rib Fatness.') : null;
                        rumpFatThicknessIndex != undefined ? isFloat(element[rumpFatThicknessIndex]) ?
                            null : issues.push('Invalid Rump Fat Thickness.') : null;
                        liveCarcassWeightIndex != undefined ? isFloat(element[liveCarcassWeightIndex]) ?
                            null : issues.push('Invalid Live Carcass Weight.') : null;
                        hotStandardCarcassWeightIndex != undefined ? isFloat(element[hotStandardCarcassWeightIndex]) ?
                            null : issues.push('Invalid Hot Standard Carcass Weight.') : null;
                        bruiseScoreIndex != undefined ? isInt(element[bruiseScoreIndex]) ?
                            null : issues.push('Invalid Bruise Score.') : null;
                        eqsReferenceIndex != undefined ? isInt(element[eqsReferenceIndex]) ?
                            null : issues.push('Invalid EQS Reference.') : null;
                        producerLicenseNumberIndex != undefined ? lengthValidate(element[producerLicenseNumberIndex], 50) ?
                            null : issues.push('Producer License Number should not exceed 50 characters.') : null;
                        msaStartCodeIndex != undefined ? lengthValidate(element[msaStartCodeIndex], 50) ?
                            null : issues.push('MSA Start Code should not exceed 50 characters.') : null;
                        gradeDateIndex != undefined ? DateValidation(element[gradeDateIndex]) ?
                            null : issues.push('Invalid Grade Date.') : null;
                        leftSideScanTimeIndex != undefined ? TimeValidation(element[leftSideScanTimeIndex]) ?
                            null : issues.push('Invalid Left Side Scan Time.') : null;
                        rightSideScanTimeIndex != undefined ? TimeValidation(element[rightSideScanTimeIndex]) ?
                            null : issues.push('Invalid Right Side Scan Time.') : null;
                        HGPIndex != undefined ? lengthValidate(element[HGPIndex], 50) ?
                            null : issues.push('HGP should not exceed 50 characters.') : null;
                        leftSideHSCWIndex != undefined ? isFloat(element[leftSideHSCWIndex]) ?
                            null : issues.push('Invalid Left Side HSCW.') : null;
                        rightSideHSCWIndex != undefined ? isFloat(element[rightSideHSCWIndex]) ?
                            null : issues.push('Invalid Right Side HSCW.') : null;
                        brandIndex != undefined ? lengthValidate(element[brandIndex], 50) ?
                            null : issues.push('Brand should not exceed 50 characters.') : null;
                        priceIndex != undefined ? isFloat(element[priceIndex]) ?
                            null : issues.push('Invalid Price.') : null;
                        destIndex != undefined ? lengthValidate(element[destIndex], 50) ?
                            null : issues.push('Dest should not exceed 50 characters.') : null;
                        versionOfMSAModelIndex != undefined ? lengthValidate(element[versionOfMSAModelIndex], 50) ?
                            null : issues.push('Version of MSA Model should not exceed 50 characters.') : null;
                        tropicalBreedContentIndex != undefined ? isInt(element[tropicalBreedContentIndex]) ?
                            null : issues.push('Invalid Tropical Breed Content.') : null;
                        humpColdIndex != undefined ? lengthValidate(element[humpColdIndex], 50) ?
                            null : issues.push('Hump Cold should not exceed 50 characters.') : null;
                        eyeMuscleAreaIndex != undefined ? lengthValidate(element[eyeMuscleAreaIndex], 50) ?
                            null : issues.push('Eye Muscle Area should not exceed 50 characters.') : null;
                        ossificationIndex != undefined ? lengthValidate(element[ossificationIndex], 50) ?
                            null : issues.push('Ossification should not exceed 50 characters.') : null;
                        ausMarblingIndex != undefined ? lengthValidate(element[ausMarblingIndex], 50) ?
                            null : issues.push('AUS Marbling should not exceed 50 characters.') : null;
                        msaMarblingIndex != undefined ? lengthValidate(element[msaMarblingIndex], 50) ?
                            null : issues.push('MSA Marbling should not exceed 50 characters.') : null;
                        fatMuscleIndex != undefined ? lengthValidate(element[fatMuscleIndex], 50) ?
                            null : issues.push('Fat Muscle should not exceed 50 characters.') : null;
                        fatDepthIndex != undefined ? isFloat(element[fatDepthIndex]) ?
                            null : issues.push('Invalid Fat Depth.') : null;
                        pHIndex != undefined ? isFloat(element[pHIndex]) ?
                            null : issues.push('Invalid pH.') : null;
                        loinTemperatureIndex ? isFloat(element[loinTemperatureIndex]) ?
                            null : issues.push('Invalid Loin Temperature.') : null;
                        costIndex != undefined ? isFloat(element[costIndex]) ?
                            null : issues.push('Invalid Cost.') : null;
                        dressingPercentageIndex != undefined ? isFloat(element[dressingPercentageIndex]) ?
                            null : issues.push('Invalid Dressing Percentage.') : null;
                        retailProductYieldIndex != undefined ? isFloat(element[retailProductYieldIndex]) ?
                            null : issues.push('Invalid Retail Product Yield.') : null;
                        diseaseIndex != undefined ? lengthValidate(element[diseaseIndex], 100) ?
                            null : issues.push('Disease should not exceed 100 characters.') : null;

                        issues = issues.concat(ValidateIdentifier(element, i, issues.length > 0));
                        console.log(issues);
                        if (issues.length > 0) {
                            invalidData.push(element); totalIssues.push(issues.join('\n'));
                            invalidGridData.push({ line: i + offset, issues: issues.join('\n') });
                        }
                    }
                }, this);

                return firebaseRef.push(invalidGridData).then(function(res) {
                    return s3.putObject({
                        Bucket: event.body.bucket,
                        Key: fileToProcess.substring(0, fileToProcess.lastIndexOf(".")) + "_Valid" + fileToProcess.substring(fileToProcess.lastIndexOf(".")),
                        Body: validData.join('\n')
                    }).promise()
                }).then(function(params) {
                    return true;
                }).catch(function(s3err) {
                    console.log('Firebase error : ' + s3err);
                    throw new Error(s3err);
                })
            }).then(function(params) {
                console.log('Process completed.');
                context.done(null, 1);
            }).catch(function(err) {
                console.log('Error : ' + err);
                context.done(null, { status: 500, message: err });
            });
        });
    } catch (error) {
        console.log('Error : ' + error);
        context.done(null, { status: 500, message: error });
    }

    function ValidateIdentifier(element, i, prevIssue) {

        let dentition = null, carcassCategory = null, buttShape = null, boningGroup = null, MSAGrader = null,
            hangMethod = null, meatColour = null, fatColour = null, gradeCode = null;
        let identifier = identifierIndex != undefined ? element[identifierIndex] : null,
            mobName = mobNameIndex != undefined ? element[mobNameIndex] : null, issues = [], currentLivestock;
        if (dentitionIndex != undefined && element[dentitionIndex]) {
            dentition = DentitionValidation(element[dentitionIndex]);
            if (!dentition) {
                issues.push(`Invalid Dentition.`);
            }
        }
        if (carcassCategoryIndex != undefined && element[carcassCategoryIndex]) {
            carcassCategory = CarcassCategoryValidation(element[carcassCategoryIndex]);
            if (!carcassCategory) {
                issues.push(`Invalid Carcass Category.`);
            }
        }
        if (buttShapeIndex != undefined && element[buttShapeIndex]) {
            buttShape = ButtShapeValidation(element[buttShapeIndex]);
            if (!buttShape) {
                issues.push(`Invalid Butt Shape.`);
            }
        }
        if (bonigGroupIndex != undefined && element[bonigGroupIndex]) {
            boningGroup = BoningGroupValidation(element[bonigGroupIndex]);
            if (!boningGroup) {
                issues.push(`Invalid Boning Group.`);
            }
        }
        if (msaGraderIndex != undefined && element[msaGraderIndex]) {
            MSAGrader = MSAGraderValidation(element[msaGraderIndex]);
            if (!MSAGrader) {
                issues.push(`Invalid MSA Grader.`);
            }
        }
        if (hangMethodIndex != undefined != undefined && element[hangMethodIndex]) {
            hangMethod = HangMethodValidation(element[hangMethodIndex]);
            if (!hangMethod) {
                issues.push(`Invalid Hang Method.`);
            }
        }
        if (meatColourIndex != undefined && element[meatColourIndex]) {
            meatColour = MeatColourValidation(element[meatColourIndex]);
            if (!meatColour) {
                issues.push(`Invalid Meat Colour.`);
            }
        }
        if (fatColourIndex != undefined && element[fatColourIndex]) {
            fatColour = FatColourValidation(element[fatColourIndex]);
            if (!fatColour) {
                issues.push(`Invalid Fat Colour.`);
            }
        }
        if (gradeCodeIndex != undefined && element[gradeCodeIndex]) {
            gradeCode = GradeCodeValidation(element[gradeCodeIndex]);
            if (!gradeCode) {
                issues.push(`Invalid Grade Code.`);
            }
        }
        if (!identifier && !mobName) { issues.push('Identifier and Mob cannot be empty.'); return issues; }
        if (identifier)
            currentLivestock = livestockData.filter((livestock) => {
                return livestock[event.body.identifier] == identifier;
            });
        else {
            currentLivestock = livestockData.filter((livestock) => {
                return livestock.Mob == mobName;
            });
            if (!(livestockCountIndex != undefined && element[livestockCountIndex]))
                issues.push('Livestock Count cannot empty for mob carcass.');
        }
        if (currentLivestock.length < 1) { issues.push(`No Livestock found.`); return issues; }
        // if (currentLivestock.length > 1) { issues.push(`Multiple Livestock found for '${val}'.`); return issues; }

        let statusCode = currentLivestock[0].SystemCode;
        if (statusCode == constants.livestockActivityStatusCodes.Killed ||
            statusCode == constants.livestockActivityStatusCodes.Deceased) {
            issues.push(`Livestock already deceased/killed.`);
            // return issues;
        }

        if (issues.length < 1 && !prevIssue) {
            validData.push(newRow(element, i + offset, currentLivestock[0], dentition, carcassCategory,
                buttShape, boningGroup, MSAGrader, hangMethod, meatColour, fatColour, gradeCode));
        }
        return issues;
    }

    function DateValidation(val) {
        if ((val != null && val != undefined && val != '') && (!isValid(val, 'DD/MM/YYYY') || !isValid(val, 'DD-MM-YYYY'))) {
            return false;
        }
        return true;
    }

    function TimeValidation(val) {
        let isValid = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(val);
        return isValid;
    }

    function isInt(n) {
        if (n != null && n != undefined && n != '')
            return !isNaN(n) && Math.round(n) == n;
        else
            return true;
    }

    function isFloat(n) {
        if (n != null && n != undefined && n != '')
            return !isNaN(n);
        else
            return true;
    }

    function lengthValidate(val, l) {
        if (val != null && val != undefined && val != '') {
            return val.length < l;
        }
        return true;
    }

    function DentitionValidation(val) {
        let dentition = dentitions.filter((ele) => {
            return ele.DentitionCode.toLowerCase() == val.toLowerCase() ||
                ele.DentitionName.toLowerCase() == val.toLowerCase();
        })[0];
        return dentition;
    }

    function CarcassCategoryValidation(val) {
        let carcassCategory = carcassCategories.filter((ele) => {
            return ele.CategoryCode.toLowerCase() == val.toLowerCase() ||
                ele.CategoryName.toLowerCase() == val.toLowerCase();
        })[0];
        return carcassCategory;
    }

    function ButtShapeValidation(val) {
        let buttShape = buttShapes.filter((ele) => {
            return ele.ShapeCode.toLowerCase() == val.toLowerCase() ||
                ele.ShapeName.toLowerCase() == val.toLowerCase();
        })[0];
        return buttShape;
    }

    function BoningGroupValidation(val) {
        let boningGroup = boningGroups.filter((ele) => {
            return ele.GroupCode.toLowerCase() == val.toLowerCase() ||
                ele.GroupName.toLowerCase() == val.toLowerCase();
        })[0];
        return boningGroup;
    }

    function MSAGraderValidation(val) {
        let MSAGrader = msaGraders.filter((ele) => {
            return ele.GraderCode.toLowerCase() == val.toLowerCase() ||
                ele.GraderName.toLowerCase() == val.toLowerCase();
        })[0];
        return MSAGrader;
    }

    function HangMethodValidation(val) {
        let hangMethod = hangMethods.filter((ele) => {
            return ele.MethodCode.toLowerCase() == val.toLowerCase() ||
                ele.MethodName.toLowerCase() == val.toLowerCase();
        })[0];
        return hangMethod;
    }

    function MeatColourValidation(val) {
        let meatColour = meatColours.filter((ele) => {
            return ele.ColourCode.toLowerCase() == val.toLowerCase() ||
                ele.ColourName.toLowerCase() == val.toLowerCase();
        })[0];
        return meatColour;
    }

    function FatColourValidation(val) {
        let fatColour = fatColours.filter((ele) => {
            return ele.ColourCode.toLowerCase() == val.toLowerCase() ||
                ele.ColourName.toLowerCase() == val.toLowerCase();
        })[0];
        return fatColour;
    }

    function GradeCodeValidation(val) {
        let gradeCode = gradeCodes.filter((ele) => {
            return ele.GradeCode.toLowerCase() == val.toLowerCase() ||
                ele.GradeName.toLowerCase() == val.toLowerCase();
        })[0];
        return gradeCode;
    }

    function newRow(element, rowNumber, livestock, dentition, carcassCategory,
        buttShape, boningGroup, MSAGrader, hangMethod, meatColour, fatColour, gradeCode) {
        var row = [];

        row.push(rowNumber);
        row.push(livestock.UUID);
        row.push(repo['uuid'].bufferToUUID(livestock.AuditLogId));
        identifierIndex != undefined ? row.push(element[identifierIndex]) : row.push('');
        mobNameIndex != undefined ? row.push(element[mobNameIndex]) : row.push('');
        identifierIndex != undefined && element[identifierIndex] ? row.push(0) : row.push(1);
        chainNumberIndex != undefined ? row.push(element[chainNumberIndex]) : row.push('');
        processedDateIndex != undefined ? row.push(element[processedDateIndex]) : row.push('');
        processedTimeIndex != undefined ? row.push(toDate(element[processedTimeIndex])) : row.push('');
        fromBodyNumberIndex != undefined ? row.push(element[fromBodyNumberIndex]) : row.push('');
        toBodyNumberIndex != undefined ? row.push(element[toBodyNumberIndex]) : row.push('');
        livestockCountIndex != undefined && element[livestockCountIndex] ? row.push(parseInt(element[livestockCountIndex]) * -1) : row.push('');
        operatorNumberIndex != undefined ? row.push(element[operatorNumberIndex]) : row.push('');
        lotNumberIndex != undefined ? row.push(element[lotNumberIndex]) : row.push('');
        processedPICIndex != undefined ? row.push(element[processedPICIndex]) : row.push('');
        fatThicknessIndex != undefined ? row.push(element[fatThicknessIndex]) : row.push('');
        ribFatnessIndex != undefined ? row.push(element[ribFatnessIndex]) : row.push('');
        rumpFatThicknessIndex != undefined ? row.push(element[rumpFatThicknessIndex]) : row.push('');
        carcassWeightIndex != undefined ? row.push(element[carcassWeightIndex]) : row.push('');
        dentitionIndex != undefined ? row.push(element[dentitionIndex]) : row.push('');
        liveCarcassWeightIndex != undefined ? row.push(element[liveCarcassWeightIndex]) : row.push('');
        hotStandardCarcassWeightIndex != undefined ? row.push(element[hotStandardCarcassWeightIndex]) : row.push('');
        bruiseScoreIndex != undefined ? row.push(element[bruiseScoreIndex]) : row.push('');
        carcassCategoryIndex != undefined ? row.push(element[carcassCategoryIndex]) : row.push('');
        buttShapeIndex != undefined ? row.push(element[buttShapeIndex]) : row.push('');
        eqsReferenceIndex != undefined ? row.push(element[eqsReferenceIndex]) : row.push('');
        producerLicenseNumberIndex != undefined ? row.push(element[producerLicenseNumberIndex]) : row.push('');
        msaStartCodeIndex != undefined ? row.push(element[msaStartCodeIndex]) : row.push('');
        bonigGroupIndex != undefined ? row.push(element[bonigGroupIndex]) : row.push('');
        msaGraderIndex != undefined ? row.push(element[msaGraderIndex]) : row.push('');
        gradeDateIndex != undefined ? row.push(element[gradeDateIndex]) : row.push('');
        leftSideScanTimeIndex != undefined ? row.push(toDate(element[leftSideScanTimeIndex])) : row.push('');
        rightSideScanTimeIndex != undefined ? row.push(toDate(element[rightSideScanTimeIndex])) : row.push('');
        hangMethodIndex != undefined ? row.push(element[hangMethodIndex]) : row.push('');
        HGPIndex != undefined ? row.push(element[HGPIndex]) : row.push('');
        leftSideHSCWIndex != undefined ? row.push(element[leftSideHSCWIndex]) : row.push('');
        rightSideHSCWIndex != undefined ? row.push(element[rightSideHSCWIndex]) : row.push('');
        brandIndex != undefined ? row.push(element[brandIndex]) : row.push('');
        priceIndex != undefined ? row.push(element[priceIndex]) : row.push('');
        destIndex != undefined ? row.push(element[destIndex]) : row.push('');
        versionOfMSAModelIndex != undefined ? row.push(element[versionOfMSAModelIndex]) : row.push('');
        tropicalBreedContentIndex != undefined ? row.push(element[tropicalBreedContentIndex]) : row.push('');
        humpColdIndex != undefined ? row.push(element[humpColdIndex]) : row.push('');
        eyeMuscleAreaIndex != undefined ? row.push(element[eyeMuscleAreaIndex]) : row.push('');
        ossificationIndex != undefined ? row.push(element[ossificationIndex]) : row.push('');
        ausMarblingIndex != undefined ? row.push(element[ausMarblingIndex]) : row.push('');
        msaMarblingIndex != undefined ? row.push(element[msaMarblingIndex]) : row.push('');
        meatColourIndex != undefined ? row.push(element[meatColourIndex]) : row.push('');
        fatColourIndex != undefined ? row.push(element[fatColourIndex]) : row.push('');
        fatMuscleIndex != undefined ? row.push(element[fatMuscleIndex]) : row.push('');
        fatDepthIndex != undefined ? row.push(element[fatDepthIndex]) : row.push('');
        pHIndex != undefined ? row.push(element[pHIndex]) : row.push('');
        loinTemperatureIndex != undefined ? row.push(element[loinTemperatureIndex]) : row.push('');
        isMilkFedVealerIndex != undefined ? row.push(element[isMilkFedVealerIndex]) : row.push('');
        costIndex != undefined ? row.push(element[costIndex]) : row.push('');
        isRinseIndex != undefined ? row.push(element[isRinseIndex]) : row.push('');
        humpHeightIndex != undefined ? row.push(element[humpHeightIndex]) : row.push('');
        isMSASaleyardIndex != undefined ? row.push(element[isMSASaleyardIndex]) : row.push('');
        isRIBIndex != undefined ? row.push(element[isRIBIndex]) : row.push('');
        feedTypeIndex != undefined ? row.push(element[feedTypeIndex]) : row.push('');
        dressingPercentageIndex != undefined ? row.push(element[dressingPercentageIndex]) : row.push('');
        retailProductYieldIndex != undefined ? row.push(element[retailProductYieldIndex]) : row.push('');
        diseaseIndex != undefined ? row.push(element[diseaseIndex]) : row.push('');
        gradeCodeIndex != undefined ? row.push(element[gradeCodeIndex]) : row.push('');
        isGrassSeedIndex != undefined ? row.push(element[isGrassSeedIndex]) : row.push('');
        isArthritisIndex != undefined ? row.push(element[isArthritisIndex]) : row.push('');

        if (livestock.TagUUID != null && livestock.TagUUID != undefined && livestock.TagUUID != '') {
            row.push(livestock.TagUUID);
            row.push(repo['uuid'].bufferToUUID(livestock.TagAuditLogId));
        }
        else {
            row.push('');
            row.push('');
        }
        identifierIndex != undefined && element[identifierIndex] ? row.push(1) :
            row.push(parseInt(livestock.NumberOfHead) - parseInt(element[livestockCountIndex]) < 0 ? 0 :
                parseInt(livestock.NumberOfHead) - parseInt(element[livestockCountIndex]));

        return row;
    }

    function toDate(timeStr) {
        if (timeStr != null && timeStr != undefined && timeStr != '') {
            var now = new Date();
            now.setHours(timeStr.substr(0, timeStr.indexOf(":")));
            now.setMinutes(timeStr.substr(timeStr.indexOf(":") + 1));
            now.setSeconds(0);
            return now;
        }
        else
            return '';
    }
}