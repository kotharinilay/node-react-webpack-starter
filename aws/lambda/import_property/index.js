'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

var path = require('path'),
    promise = require('bluebird'),
    aws = require('aws-sdk');

// lambda invoke function
exports.handler = function (event, context) {

    require('./src/load.env')(event.body.env);

    var repo = require('./src/repository'),
        fileToProcess = event.body.fileToProcess,
        auditInsertStr = `INSERT INTO auditlog (Id,CreatedBy,CreatedStamp,CreatedFromSource,CreatedFromFeature,UUID) VALUES `,
        insertStr = `INSERT INTO property (Id, CompanyId, PIC, Name, PropertyTypeId, 
            Address, SuburbId, BrandText, EarmarkText, ExportEligibility, PropertyManagerId, NLISUsername, 
            NLISPassword, LivestockIdentifier, AuditLogId, UUID) VALUES `,
        accreditationInsertStr = `INSERT INTO propertyaccreditationprogram (Id, PropertyId, AccreditationProgramId, IsActive, LicenseNumber, StateId, ExpiryDate, Notes, UUID) VALUES `,
        contactInsertStr,
        insertArr = [], auditInsertArr = [], accreditationInsertArr = [],
        updateArr = [], auditUpdateArr = [], accreditationUpdateArr = [],
        CreatedBy = `fn_UuidToBin('${event.body.contactId}')`,
        CreatedFromSource = `'web'`, CreatedFromFeature = `'import-property-csv'`;

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
        var validData = [];
        var invalidData = [];
        var totalIssues = [];

        data = data.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach((row, i) => {
            var element = row.split(',');

            var RowNo = element[0];

            var UUID = element[1] ? element[1] : null;
            var Id = element[1] ? `fn_UuidToBin('${element[1]}')` : null;
            var AuditLogUUID = element[2] ? element[2] : null;
            var AuditLogId = element[2] ? `fn_UuidToBin('${element[2]}')` : null;

            var CompanyId = element[3] ? `fn_UuidToBin('${element[3]}')` : null;
            var PIC = element[4] ? `'${element[4]}'` : null;
            var PropertyName = element[5] ? `'${element[5]}'` : null;
            var PropertyType = element[6] ? `fn_UuidToBin('${element[6]}')` : null;
            var Address = element[7] ? `'${element[7]}'` : null;
            var SuburbId = element[8] ? `fn_UuidToBin('${element[8]}')` : null;
            var Brand = element[9] ? `'${element[9]}'` : null;
            var Earmark = element[10] ? `'${element[10]}'` : null;
            var ExportEligibility = element[11] ? `'${element[11].split('|').join()}'` : null;
            var NLISUser = element[12] ? `'${element[12]}'` : null;
            var NLISPwd = element[13] ? `'${element[13]}'` : null;

            var PropertyMngrId = element[14] ? `fn_UuidToBin('${element[14]}')` : null;
            var FirstName = element[15] ? `'${element[15]}'` : null;
            var LastName = element[16] ? `'${element[16]}'` : null;

            var EUAccreditationProgramId = element[17] ? `fn_UuidToBin('${element[17]}')` : null;
            var EUIsActive = element[18] ? element[18] : null;
            var EULicenseNumber = element[19] ? `'${element[19]}'` : null;
            var EUStateId = element[20] ? `'${element[20].split('|').join()}'` : null;
            var EUExpiryDate = element[21] ? `'${repo.dateFromString(element[21])}'` : null;
            var EUNotes = element[22] ? `'${element[22]}'` : null;

            var OBEAccreditationProgramId = element[23] ? `fn_UuidToBin('${element[23]}')` : null;
            var OBEIsActive = element[24] ? element[24] : null;
            var OBELicenseNumber = element[25] ? `'${element[25]}'` : null;
            var OBEStateId = element[26] ? `'${element[26].split('|').join()}'` : null;
            var OBEExpiryDate = element[27] ? `'${repo.dateFromString(element[27])}'` : null;
            var OBENotes = element[28] ? `'${element[28]}'` : null;

            var PCASAccreditationProgramId = element[29] ? `fn_UuidToBin('${element[29]}')` : null;
            var PCASIsActive = element[30] ? element[30] : null;
            var PCASLicenseNumber = element[31] ? `'${element[31]}'` : null;
            var PCASStateId = element[32] ? `'${element[32].split('|').join()}'` : null;
            var PCASExpiryDate = element[33] ? `'${repo.dateFromString(element[33])}'` : null;
            var PCASNotes = element[34] ? `'${element[34]}'` : null;

            var MSAAccreditationProgramId = element[35] ? `fn_UuidToBin('${element[35]}')` : null;
            var MSAIsActive = element[36] ? element[36] : null;
            var MSALicenseNumber = element[37] ? `'${element[37]}'` : null;
            var MSAStateId = element[38] ? `'${element[38].split('|').join()}'` : null;
            var MSAExpiryDate = element[39] ? `'${repo.dateFromString(element[39])}'` : null;
            var MSANotes = element[40] ? `'${element[40]}'` : null;

            var LPAAccreditationProgramId = element[41] ? `fn_UuidToBin('${element[41]}')` : null;
            var LPAIsActive = element[42] ? element[42] : null;
            var LPALicenseNumber = element[43] ? `'${element[43]}'` : null;
            var LPAStateId = element[44] ? `'${element[44].split('|').join()}'` : null;
            var LPAExpiryDate = element[45] ? `'${repo.dateFromString(element[45])}'` : null;
            var LPANotes = element[46] ? `'${element[46]}'` : null;

            var NTAccreditationProgramId = element[47] ? `fn_UuidToBin('${element[47]}')` : null;
            var NTIsActive = element[48] ? element[48] : null;
            var NTLicenseNumber = element[49] ? `'${element[49]}'` : null;
            var NTStateId = element[50] ? `'${element[50].split('|').join()}'` : null;
            var NTExpiryDate = element[51] ? `'${repo.dateFromString(element[51])}'` : null;
            var NTNotes = element[52] ? `'${element[52]}'` : null;

            var ContactCompanyId = element[53] ? `fn_UuidToBin('${element[53]}')` : null;

            if (!PropertyMngrId && ContactCompanyId && FirstName && LastName) {
                var contactUUID = repo.newUUID();
                var contactAuditLogUUID = repo.newUUID();

                PropertyMngrId = `fn_UuidToBin('${contactUUID}')`;
                var contactAuditLogId = `fn_UuidToBin('${contactAuditLogUUID}')`;

                auditInsertArr.push(`(${contactAuditLogId}, ${CreatedBy}, NOW(), ${CreatedFromSource}, ${CreatedFromFeature}, '${contactAuditLogUUID}')`);
                contactInsertStr = `INSERT INTO contact (Id, FirstName, LastName, CompanyId, AuditLogId, UUID) VALUES (${PropertyMngrId}, ${FirstName}, ${LastName}, ${ContactCompanyId}, ${contactAuditLogId},'${contactUUID}')`;
            }


            if (Id) {
                // update
                let fieldArr = [];

                // CompanyId ? fieldArr.push(`CompanyId=${CompanyId}`) : null;
                PIC ? fieldArr.push(`PIC=${PIC}`) : null;
                PropertyName ? fieldArr.push(`Name=${PropertyName}`) : null;
                PropertyType ? fieldArr.push(`PropertyTypeId=${PropertyType}`) : null;
                Address ? fieldArr.push(`Address=${Address}`) : null;

                SuburbId ? fieldArr.push(`SuburbId=${SuburbId}`) : null;
                Brand ? fieldArr.push(`BrandText=${Brand}`) : null;
                Earmark ? fieldArr.push(`EarmarkText=${Earmark}`) : null;
                ExportEligibility ? fieldArr.push(`ExportEligibility=${ExportEligibility}`) : null;
                PropertyMngrId ? fieldArr.push(`PropertyManagerId=${PropertyMngrId}`) : null;
                NLISUser ? fieldArr.push(`NLISUsername=${NLISUser}`) : null;
                NLISPwd ? fieldArr.push(`NLISPassword=${NLISPwd}`) : null;

                updateArr.push(`UPDATE property SET ${fieldArr.join()} WHERE UUID='${UUID}';`);
                auditUpdateArr.push(`UPDATE auditlog SET ModifiedBy=${CreatedBy},ModifiedStamp=now(),ModifiedFromSource=${CreatedFromSource},ModifiedFromFeature=${CreatedFromFeature} WHERE UUID='${AuditLogUUID}';`)


                if (EUAccreditationProgramId)
                    AccreditationUpdate(Id, EUAccreditationProgramId, EUIsActive, EULicenseNumber, EUStateId, EUExpiryDate, EUNotes);

                if (OBEAccreditationProgramId)
                    AccreditationUpdate(Id, OBEAccreditationProgramId, OBEIsActive, OBELicenseNumber, OBEStateId, OBEExpiryDate, OBENotes);

                if (PCASAccreditationProgramId)
                    AccreditationUpdate(Id, PCASAccreditationProgramId, PCASIsActive, PCASLicenseNumber, PCASStateId, PCASExpiryDate, PCASNotes);

                if (MSAAccreditationProgramId)
                    AccreditationUpdate(Id, MSAAccreditationProgramId, MSAIsActive, MSALicenseNumber, MSAStateId, MSAExpiryDate, MSANotes);

                if (LPAAccreditationProgramId)
                    AccreditationInsert(Id, LPAAccreditationProgramId, LPAIsActive, LPALicenseNumber, LPAStateId, LPAExpiryDate, LPANotes);

                if (NTAccreditationProgramId)
                    AccreditationUpdate(Id, NTAccreditationProgramId, NTIsActive, NTLicenseNumber, NTStateId, NTExpiryDate, NTNotes);


            }
            else {
                // insert

                UUID = repo.newUUID();
                AuditLogUUID = repo.newUUID();

                Id = "fn_UuidToBin('".concat(UUID, "')");
                AuditLogId = "fn_UuidToBin('".concat(AuditLogUUID, "')");

                auditInsertArr.push(`(${AuditLogId}, ${CreatedBy}, NOW(), ${CreatedFromSource}, ${CreatedFromFeature}, '${AuditLogUUID}')`);

                insertArr.push(`(${Id}, ${CompanyId}, ${PIC}, ${PropertyName}, ${PropertyType},
                ${Address},${SuburbId},${Brand},${Earmark},${ExportEligibility},${PropertyMngrId},
                ${NLISUser}, ${NLISPwd},'EID',${AuditLogId},'${UUID}')`);

                if (EUAccreditationProgramId)
                    AccreditationInsert(Id, EUAccreditationProgramId, EUIsActive, EULicenseNumber, EUStateId, EUExpiryDate, EUNotes);

                if (OBEAccreditationProgramId)
                    AccreditationInsert(Id, OBEAccreditationProgramId, OBEIsActive, OBELicenseNumber, OBEStateId, OBEExpiryDate, OBENotes);

                if (PCASAccreditationProgramId)
                    AccreditationInsert(Id, PCASAccreditationProgramId, PCASIsActive, PCASLicenseNumber, PCASStateId, PCASExpiryDate, PCASNotes);

                if (MSAAccreditationProgramId)
                    AccreditationInsert(Id, MSAAccreditationProgramId, MSAIsActive, MSALicenseNumber, MSAStateId, MSAExpiryDate, MSANotes);

                if (LPAAccreditationProgramId)
                    AccreditationInsert(Id, LPAAccreditationProgramId, LPAIsActive, LPALicenseNumber, LPAStateId, LPAExpiryDate, LPANotes);

                if (NTAccreditationProgramId)
                    AccreditationInsert(Id, NTAccreditationProgramId, NTIsActive, NTLicenseNumber, NTStateId, NTExpiryDate, NTNotes);
            }

        }, this);

        auditInsertStr += auditInsertArr.join();
        insertStr += insertArr.join();
        accreditationInsertStr += accreditationInsertArr.join();

        console.log('Importing CSV records to DB');
        return repo.models.sequelize.transaction(function (t) {

            if (insertArr.length == 0 && !contactInsertStr) {
                auditInsertStr = 'select 1 from auditlog limit 1;';
            }

            return repo.models.sequelize.query(auditInsertStr, { transaction: t }).then(function () {
                if (contactInsertStr)
                    return repo.models.sequelize.query(contactInsertStr, { transaction: t });
                else return true;
            }).then(function () {
                if (insertArr.length > 0)
                    return repo.models.sequelize.query(insertStr, { transaction: t });
                else return true;
            }).then(function () {
                if (accreditationInsertArr.length > 0)
                    return repo.models.sequelize.query(accreditationInsertStr, { transaction: t });
                else return true;
            }).then(function () {
                if (auditUpdateArr.length > 0)
                    return repo.models.sequelize.query(auditUpdateArr.join(' '), { transaction: t });
                else return true;
            }).then(function () {
                if (updateArr.length > 0)
                    return repo.models.sequelize.query(updateArr.join(' '), { transaction: t });
                else return true;
            }).then(function () {
                if (accreditationUpdateArr.length > 0)
                    return repo.models.sequelize.query(accreditationUpdateArr.join(' '), { transaction: t });
                else return true;
            });
        }).catch(function (err) {
            console.log('Sequelize error : ' + err);
            throw new Error(err);
        });

    }).then(function () {
        console.log('Process completed.');
        context.done(null, 1);
    }).catch(function (err) {
        console.log('Error : ' + err);
        context.done(err);
    });


    function AccreditationInsert(PropertyId, AccreditationProgramId, IsActive, LicenseNumber, StateId, ExpiryDate, Notes) {
        var accUUID = repo.newUUID();
        var accId = "fn_UuidToBin('".concat(accUUID, "')");
        accreditationInsertArr.push(`(${accId}, ${PropertyId}, ${AccreditationProgramId}, ${IsActive}, ${LicenseNumber}, ${StateId}, ${ExpiryDate}, ${Notes}, '${accUUID}')`);
    }

    function AccreditationUpdate(PropertyId, AccreditationProgramId, IsActive, LicenseNumber, StateId, ExpiryDate, Notes) {
        let fieldArr = [];
        IsActive ? fieldArr.push(`IsActive=${IsActive}`) : null;
        LicenseNumber ? fieldArr.push(`LicenseNumber=${LicenseNumber}`) : null;
        StateId ? fieldArr.push(`StateId=${StateId}`) : null;
        ExpiryDate ? fieldArr.push(`ExpiryDate=${ExpiryDate}`) : null;
        Notes ? fieldArr.push(`Notes=${Notes}`) : null;
        accreditationUpdateArr.push(`UPDATE propertyaccreditationprogram SET ${fieldArr.join()} WHERE PropertyId=${PropertyId} AND AccreditationProgramId=${AccreditationProgramId};`);
    }

}
