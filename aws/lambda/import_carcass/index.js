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

        insertCarcassStr = `INSERT INTO livestockcarcass (Id,LivestockId,LivestockCount,LivestockEventId,
        FromBodyNumber,ToBodyNumber,ProcessedDate,ProcessedTime,LotNumber,ChainNumber,OperatorNumber,
        ProcessedPIC,CarcassWeight,FatThickness,RibFatness,RumpFatThickness,DentitionId,LiveCarcassWeight,
        HotStandardCarcassWeight,BruiseScore,CarcassCategoryId,ButtShapeId,EQSReference,ProducerLicenseNumber,
        MSAStartCode,BoningGroupId,MSAGraderId,GradeDate,LeftSideScanTime,RightSideScanTime,HangMethodId,HGP,
        LeftSideHSCW,RightSideHSCW,Brand,PriceKG,Dest,VersionOfMSAModel,TropicalBreedContent,HumpCold,EyeMuscleArea,
        Ossification,AUSMarbling,MSAMarbling,MeatColourId,FatMuscle,FatColourId,FatDepth,pH,LoinTemperature,
        Cost,IsMilkFedVealer,IsRinse,HumpHeight,IsMSASaleyard,IsRIB,FeedType,DressingPercentage,RetailProductYield,
        Disease,GradeCodeId,IsGrassSeed,IsArthritis,AuditLogId,UUID) VALUES `,
        insertEventStr = `INSERT INTO livestockevent (Id,PropertyId,LivestockId,EventType,EventDate,
        NumberOfHead,AuditLogId,UUID) VALUES `,
        insertStatusHistoryStr = `INSERT INTO livestockstatushistory (Id,LivestockId,PropertyId,
        ActivityStatusId,LivestockEventId,Comment,UUID) VALUES `,
        insertMobCountHistoryStr = `INSERT INTO mobcounthistory (Id,LivestockId,PropertyId,LivestockCount,LivestockEventId,UUID) 
        VALUES `,
        auditInsertStr = `INSERT INTO auditlog (Id,CreatedBy,CreatedStamp,CreatedFromSource,UUID) VALUES `,
        auditInsertArr = [], updateTagArr = [], insertLivestockEventArr = [], insertStatusHistoryArr = [],
        insertMobCountHistoryArr = [], insertCarcassArr = [], updateLivestockArr = [], auditUpdateArr = [],
        fileToProcess = event.body.fileToProcess, deceasedTagStatus = null, killedLivestockStatus,
        modifiedSource = 'import-carcass-csv', propertyId = `fn_UuidToBin('${event.body.topPIC.PropertyId}')`;

    var rowIndex = 0, livestockIdIndex = 1, livestockAuditIndex = 2, identifierIndex = 3, mobNameIndex = 4,
        isMob = 5, chainNumberIndex = 6, processedDateIndex = 7, processedTimeIndex = 8, fromBodyNumberIndex = 9,
        toBodyNumberIndex = 10, livestockCountIndex = 11, operatorNumberIndex = 12, lotNumberIndex = 13,
        processedPICIndex = 14, fatThicknessIndex = 15, ribFatnessIndex = 16, rumpFatThicknessIndex = 17,
        carcassWeightIndex = 18, dentitionIndex = 19, liveCarcassWeightIndex = 20,
        hotStandardCarcassWeightIndex = 21, bruiseScoreIndex = 22, carcassCategoryIndex = 23, buttShapeIndex = 24,
        eqsReferenceIndex = 25, producerLicenseNumberIndex = 26, msaStartCodeIndex = 27, bonigGroupIndex = 28,
        msaGraderIndex = 29, gradeDateIndex = 30, leftSideScanTimeIndex = 31, rightSideScanTimeIndex = 32,
        hangMethodIndex = 33, HGPIndex = 34, leftSideHSCWIndex = 35, rightSideHSCWIndex = 36, brandIndex = 37,
        priceIndex = 38, destIndex = 39, versionOfMSAModelIndex = 40, tropicalBreedContentIndex = 41,
        humpColdIndex = 42, eyeMuscleAreaIndex = 43, ossificationIndex = 44, ausMarblingIndex = 45,
        msaMarblingIndex = 46, meatColourIndex = 47, fatColourIndex = 48, fatMuscleIndex = 49, fatDepthIndex = 50,
        pHIndex = 51, loinTemperatureIndex = 52, isMilkFedVealerIndex = 53, costIndex = 54, isRinseIndex = 55,
        humpHeightIndex = 56, isMSASaleyardIndex = 57, isRIBIndex = 58, feedTypeIndex = 59,
        dressingPercentageIndex = 60, retailProductYieldIndex = 61, diseaseIndex = 62, gradeCodeIndex = 63,
        isGrassSeedIndex = 64, isArthritisIndex = 65, tagIdIndex = 66, tagAuditIndex = 67, newCountIndex = 68;

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
        repo.getAllActivityStatus({ SystemCode: constants.livestockActivityStatusCodes.Killed }).then(function (livestockStatus) {
            if (livestockStatus.length == 0) {
                context.done("Livestock Status - Deceased not available");
            }
            killedLivestockStatus = livestockStatus[0].Id;
            console.log(killedLivestockStatus);
            return repo.getTagStatus(event.body.language);
        }).then(function (tagStatus) {
            console.log(constants.tagStatusCodes.Deceased);
            deceasedTagStatus = tagStatus.filter((status) => {
                return status.SystemCode == constants.tagStatusCodes.Deceased;
            })[0].Id;
            deceasedTagStatus = repo['uuid'].bufferToUUID(deceasedTagStatus);
            console.log(deceasedTagStatus);
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
                    let newCount = element[newCountIndex];
                    let strUpdateLivestock = `UPDATE livestock SET ` +
                        newCount == 0 || element[isMob] == 0 ? `ActivityStatusId=fn_UuidToBin('${killedLivestockStatus}'),` : '' +
                        `  NumberOfHead=${newCount} WHERE UUID='${element[livestockIdIndex]}';`;
                    updateLivestockArr.push(strUpdateLivestock);


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

                    // let comment = element[deathReasonIndex] ? `'${element[deathReasonIndex]}'` : null;
                    let eventDate = (element[processedDateIndex] ? dateFromString(element[processedDateIndex]) : new Date());
                    let eventType = 'ActivityStatusUpdate';
                    let livestockId = element[livestockIdIndex] ? `fn_UuidToBin('${element[livestockIdIndex]}')` : null;

                    // let carcassCount = element[livestockCountIndex] ? element[livestockCountIndex] : 1;
                    insertLivestockEventArr.push(`(fn_UuidToBin('${livestockEventId}'),${propertyId},${livestockId},
                '${eventType}','${eventDate}',${newCount},fn_UuidToBin('${livestockEventAuditId}'),'${livestockEventId}')`);

                    if (newCount == 0 || element[isMob] == 0) {
                        insertStatusHistoryArr.push(`(fn_UuidToBin('${statusHistoryId}'),${livestockId},${propertyId},
                            fn_UuidToBin('${killedLivestockStatus}'),fn_UuidToBin('${livestockEventId}'),
                            null,'${statusHistoryId}')`);
                    }

                    if (element[isMob] == 1) {
                        let mobCountHistoryId = repo['uuid'].newUUID();

                        insertMobCountHistoryArr.push(`(fn_UuidToBin('${mobCountHistoryId}'),${livestockId},
                        ${propertyId},${element[livestockCountIndex]},fn_UuidToBin('${livestockEventId},
                        '${mobCountHistoryId}')`);
                    }

                    auditInsertArr.push(`(fn_UuidToBin('${livestockEventAuditId}'),fn_UuidToBin('${event.body.contactId}'),
                now(),'${modifiedSource}','${livestockEventAuditId}')`);

                    // insert livestock carcass fields
                    let carcassId = repo['uuid'].newUUID();
                    let livestockCount = element[livestockCountIndex] ? element[livestockCountIndex] * -1 : 1;
                    let fromBodyNumber = element[fromBodyNumberIndex] ? `'${element[fromBodyNumberIndex]}'` : null;
                    let toBodyNumber = element[toBodyNumberIndex] ? `'${element[toBodyNumberIndex]}'` : null;
                    let processedTime = `'${new Date(element[processedTimeIndex]).toISOString().replace('T', ' ').replace('Z', '')}'`;
                    let lotNumber = element[lotNumberIndex] ? `'${element[lotNumberIndex]}'` : null;
                    let chainNumber = element[chainNumberIndex] ? `'${element[chainNumberIndex]}'` : null;
                    let operatorNumber = element[operatorNumberIndex] ? `'${element[operatorNumberIndex]}'` : null;
                    let processedPIC = `'${element[processedPICIndex]}'`;
                    let carcassWeight = element[carcassWeightIndex] ? element[carcassWeightIndex] : 0;
                    let fatThickness = element[fatThicknessIndex] ? element[fatThicknessIndex] : 0;
                    let ribFatness = element[ribFatnessIndex] ? element[ribFatnessIndex] : 0;
                    let rumpFatThickness = element[rumpFatThicknessIndex] ? element[rumpFatThicknessIndex] : 0;
                    let dentition = element[dentitionIndex] ? `fn_UuidToBin('${element[dentitionIndex]}')` : null;
                    let liveCarcassWeight = element[liveCarcassWeightIndex] ? element[liveCarcassWeightIndex] : 0;
                    let hotStandardCarcassWeight = element[hotStandardCarcassWeightIndex] ? element[hotStandardCarcassWeightIndex] : 0;
                    let bruiseScore = element[bruiseScoreIndex] ? element[bruiseScoreIndex] : 0;
                    let carcassCategory = element[carcassCategoryIndex] ? `fn_UuidToBin('${element[carcassCategoryIndex]}')` : null;
                    let buttShape = element[buttShapeIndex] ? `fn_UuidToBin('${element[buttShapeIndex]}')` : null;
                    let eqsReference = element[eqsReferenceIndex] ? element[eqsReferenceIndex] : 0;
                    let producerLicenseNumber = element[producerLicenseNumberIndex] ? `'${element[producerLicenseNumberIndex]}'` : null;
                    let msaStartCode = element[msaStartCodeIndex] ? `'${element[msaStartCodeIndex]}'` : null;
                    let boningGroup = element[bonigGroupIndex] ? `fn_UuidToBin('${element[bonigGroupIndex]}')` : null;
                    let msaGrader = element[msaGraderIndex] ? `fn_UuidToBin('${element[msaGraderIndex]}')` : null;
                    let gradeDate = element[gradeDateIndex] ? `'${dateFromString(element[gradeDateIndex])}'` : null;
                    let leftSideScanTime = element[leftSideScanTimeIndex] ? `'${new Date(element[leftSideScanTimeIndex]).toISOString().replace('T', ' ').replace('Z', '')}'` : null;
                    let rightSideScanTime = element[rightSideScanTimeIndex] ? `'${new Date(element[rightSideScanTimeIndex]).toISOString().replace('T', ' ').replace('Z', '')}'` : null;
                    let hangMethod = element[hangMethodIndex] ? `fn_UuidToBin('${element[hangMethodIndex]}')` : null;
                    let hgp = element[HGPIndex] ? `'${element[HGPIndex]}'` : null;
                    let leftSideHSCW = element[leftSideHSCWIndex] ? element[leftSideHSCWIndex] : 0;
                    let rightSideHSCW = element[rightSideHSCWIndex] ? element[rightSideHSCWIndex] : 0;
                    let brand = element[brandIndex] ? `'${element[brandIndex]}'` : null;
                    let price = element[priceIndex] ? element[priceIndex] : 0;
                    let dest = element[destIndex] ? `'${element[destIndex]}'` : null;
                    let versionOfMSAModel = element[versionOfMSAModelIndex] ? `'${element[versionOfMSAModelIndex]}'` : null;
                    let tropicalBreedContent = element[tropicalBreedContentIndex] ? element[tropicalBreedContentIndex] : 0;
                    let humpCold = element[humpColdIndex] ? `'${element[humpColdIndex]}'` : null;
                    let eyeMuscleArea = element[eyeMuscleAreaIndex] ? `'${element[eyeMuscleAreaIndex]}'` : null;
                    let ossification = element[ossificationIndex] ? `'${element[ossificationIndex]}'` : null;
                    let ausMarbling = element[ausMarblingIndex] ? `'${element[ausMarblingIndex]}'` : null;
                    let msaMarbling = element[msaMarblingIndex] ? `'${element[msaMarblingIndex]}'` : null;
                    let meatColour = element[meatColourIndex] ? `fn_UuidToBin('${element[meatColourIndex]}')` : null;
                    let fatMuscle = element[fatMuscleIndex] ? `'${element[fatMuscleIndex]}'` : null;
                    let fatColour = element[fatColourIndex] ? `fn_UuidToBin('${element[fatColourIndex]}')` : null;
                    let fatDepth = element[fatDepthIndex] ? element[fatDepthIndex] : 0;
                    let pH = element[pHIndex] ? element[pHIndex] : 0;
                    let loinTemperature = element[loinTemperatureIndex] ? element[loinTemperatureIndex] : 0;
                    let cost = element[costIndex] ? element[costIndex] : 0;
                    let isMilkFeedVealer = element[isMilkFedVealerIndex] && element[isMilkFedVealerIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let isRinse = element[isRinseIndex] && element[isRinseIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let humpHeight = element[humpHeightIndex] ? element[humpHeightIndex] : 0;
                    let isMSASaleyard = element[isMSASaleyardIndex] && element[isMSASaleyardIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let isRIB = element[isRIBIndex] && element[isRIBIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let feedType = element[feedTypeIndex] ? `'${element[feedTypeIndex]}'` : null;
                    let dressingPercentage = element[dressingPercentageIndex] ? element[dressingPercentageIndex] : 0;
                    let retailProductYield = element[retailProductYieldIndex] ? element[retailProductYieldIndex] : 0;
                    let disease = element[diseaseIndex] ? `'${element[diseaseIndex]}'` : null;
                    let gradeCode = element[gradeCodeIndex] ? `fn_UuidToBin('${element[gradeCodeIndex]}')` : null;
                    let isGrassSeed = element[isGrassSeedIndex] && element[isGrassSeedIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let isArthritis = element[isArthritisIndex] && element[isArthritisIndex].toString().toLowerCase() != 'false' ? 1 : 0;
                    let carcassAuditId = repo['uuid'].newUUID();

                    insertCarcassArr.push(`(fn_UuidToBin('${carcassId}'),${livestockId},${livestockCount},
                    fn_UuidToBin('${livestockEventId}'),${fromBodyNumber},${toBodyNumber},'${eventDate}',${processedTime},
                    ${lotNumber},${chainNumber},${operatorNumber},${processedPIC},${carcassWeight},${fatThickness},
                    ${ribFatness},${rumpFatThickness},${dentition},${liveCarcassWeight},${hotStandardCarcassWeight},
                    ${bruiseScore},${carcassCategory},${buttShape},${eqsReference},${producerLicenseNumber},${msaStartCode},
                    ${boningGroup},${msaGrader},${gradeDate},${leftSideScanTime},${rightSideScanTime},${hangMethod},${hgp},
                    ${leftSideHSCW},${rightSideHSCW},${brand},${price},${dest},${versionOfMSAModel},${tropicalBreedContent},
                    ${humpCold},${eyeMuscleArea},${ossification},${ausMarbling},${msaMarbling},${meatColour},${fatMuscle},
                    ${fatColour},${fatDepth},${pH},${loinTemperature},${cost},${isMilkFeedVealer},${isRinse},${humpHeight},
                    ${isMSASaleyard},${isRIB},${feedType},${dressingPercentage},${retailProductYield},${disease},${gradeCode},
                    ${isGrassSeed},${isArthritis},fn_UuidToBin('${carcassAuditId}'),'${carcassId}')`);

                    auditInsertArr.push(`(fn_UuidToBin('${carcassAuditId}'),fn_UuidToBin('${event.body.contactId}'),
                    now(),'${modifiedSource}','${carcassAuditId}')`);

                }, this);

                auditInsertStr += auditInsertArr.join();
                insertEventStr += insertLivestockEventArr.join();
                if (insertStatusHistoryArr.length > 0)
                    insertStatusHistoryStr += insertStatusHistoryArr.join();
                insertCarcassStr += insertCarcassArr.join();
                if (insertMobCountHistoryArr.length > 0)
                    insertMobCountHistoryStr += insertMobCountHistoryArr.join();

                console.log('--------------------------');
                console.log(insertEventStr);
                console.log('--------------------------');
                console.log(insertStatusHistoryStr);
                console.log('--------------------------');
                console.log(insertMobCountHistoryStr);
                console.log('--------------------------');
                console.log(insertCarcassStr);
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
                        if (insertStatusHistoryArr.length > 0)
                            return repo['models'].sequelize.query(insertStatusHistoryStr, { transaction: t });
                        else
                            return true;
                    }).then(function () {
                        if (insertMobCountHistoryArr.length > 0)
                            return repo['models'].sequelize.query(insertMobCountHistoryStr, { transaction: t });
                        else
                            return true;
                    }).then(function () {
                        return repo['models'].sequelize.query(updateLivestockArr.join(' '), { transaction: t });
                    }).then(function () {
                        if (updateTagArr.length > 0)
                            return repo['models'].sequelize.query(updateTagArr.join(' '), { transaction: t });
                        else
                            return true;
                    }).then(function () {
                        return repo['models'].sequelize.query(insertCarcassStr, { transaction: t });
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
        console.log('Error : ' + err);
        context.done(error);
    }
}