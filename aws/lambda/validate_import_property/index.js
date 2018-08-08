'use strict';

/************************************
 * index file for lambda function invoke
 * ***********************************/

var path = require('path'),
    Sequelize = require('sequelize'),
    promise = require('bluebird'),
    aws = require('aws-sdk'),
    firebase = require('firebase-admin');

// lambda invoke function
exports.handler = function (event, context) {

    require('./src/load.env')(event.body.env);

    var repo = require('./src/repository'),

        fileToProcess = event.body.fileToProcess,
        offset = event.body.offset,

        iCompany, iRegion, iBusiness, iPIC, iPropertyName, iPropertyType, iAddress, iSuburb,
        iState, iPostcode, iPropertyMngr, iBrand, iEarmark, iNLISUser, iNLISPwd, iExportEligibility,

        iEULicense, iEUExpiry, iEUState, iEUDesc, iEUStatus,
        iOBELicense, iOBEExpiry, iOBEState, iOBEDesc, iOBEStatus,
        iPCASLicense, iPCASExpiry, iPCASState, iPCASDesc, iPCASStatus,
        iMSALicense, iMSAExpiry, iMSAState, iMSADesc, iMSAStatus,
        iLPALicense, iLPAExpiry, iLPAState, iLPADesc, iLPAStatus,
        iNTLicense, iNTExpiry, iNTState, iNTDesc, iNTStatus,

        listContact = [], listPropertyType = [], listPIC = [], listAccreditation = [],
        listState = [], listCompany = [], listSuburb = [],

        propertyTypeSystemCode = null, stateSystemCode = null;


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

    if (firebase.apps.length === 0) {
        firebase.initializeApp({
            credential: firebase.credential.cert(require(path.join(__dirname, './serviceAccountKey.json'))),
            databaseURL: "https://aglive-v3.firebaseio.com"
        });
    }
    var firebaseRef = firebase.database().ref('/import-property/' + event.body.firebaseKey + '/');

    var s3 = new aws.S3();
    event.body.mapping.map((ele) => {
        if (ele.mapColumn == 'Company') iCompany = ele.index;
        else if (ele.mapColumn == 'Region') iRegion = ele.index;
        else if (ele.mapColumn == 'Business') iBusiness = ele.index;
        else if (ele.mapColumn == 'PIC') iPIC = ele.index;
        else if (ele.mapColumn == 'Property Name') iPropertyName = ele.index;
        else if (ele.mapColumn == 'Property Type') iPropertyType = ele.index;
        else if (ele.mapColumn == 'Address') iAddress = ele.index;
        else if (ele.mapColumn == 'Suburb') iSuburb = ele.index;
        else if (ele.mapColumn == 'State') iState = ele.index;
        else if (ele.mapColumn == 'Postcode') iPostcode = ele.index;
        else if (ele.mapColumn == 'Property Manager') iPropertyMngr = ele.index;
        else if (ele.mapColumn == 'Brand Text') iBrand = ele.index;
        else if (ele.mapColumn == 'Earmark Text') iEarmark = ele.index;
        else if (ele.mapColumn == 'NLIS Username') iNLISUser = ele.index;
        else if (ele.mapColumn == 'NLIS Password') iNLISPwd = ele.index;
        else if (ele.mapColumn == 'Export Eligibility') iExportEligibility = ele.index;

        else if (ele.mapColumn == 'EU Accreditation License Number') iEULicense = ele.index;
        else if (ele.mapColumn == 'EU Accreditation Expiry Date') iEUExpiry = ele.index;
        else if (ele.mapColumn == 'EU Accreditation State') iEUState = ele.index;
        else if (ele.mapColumn == 'EU Accreditation Description') iEUDesc = ele.index;
        else if (ele.mapColumn == 'EU Accreditation Status') iEUStatus = ele.index;

        else if (ele.mapColumn == 'OBE Accreditation License Number') iOBELicense = ele.index;
        else if (ele.mapColumn == 'OBE Accreditation Expiry Date') iOBEExpiry = ele.index;
        else if (ele.mapColumn == 'OBE Accreditation State') iOBEState = ele.index;
        else if (ele.mapColumn == 'OBE Accreditation Description') iOBEDesc = ele.index;
        else if (ele.mapColumn == 'OBE Accreditation Status') iOBEStatus = ele.index;

        else if (ele.mapColumn == 'PCAS Accreditation License Number') iPCASLicense = ele.index;
        else if (ele.mapColumn == 'PCAS Accreditation Expiry Date') iPCASExpiry = ele.index;
        else if (ele.mapColumn == 'PCAS Accreditation State') iPCASState = ele.index;
        else if (ele.mapColumn == 'PCAS Accreditation Description') iPCASDesc = ele.index;
        else if (ele.mapColumn == 'PCAS Accreditation Status') iPCASStatus = ele.index;

        else if (ele.mapColumn == 'MSA Accreditation License Number') iMSALicense = ele.index;
        else if (ele.mapColumn == 'MSA Accreditation Expiry Date') iMSAExpiry = ele.index;
        else if (ele.mapColumn == 'MSA Accreditation State') iMSAState = ele.index;
        else if (ele.mapColumn == 'MSA Accreditation Description') iMSADesc = ele.index;
        else if (ele.mapColumn == 'MSA Accreditation Status') iMSAStatus = ele.index;

        else if (ele.mapColumn == 'LPA Accreditation License Number') iLPALicense = ele.index;
        else if (ele.mapColumn == 'LPA Accreditation Expiry Date') iLPAExpiry = ele.index;
        else if (ele.mapColumn == 'LPA Accreditation State') iLPAState = ele.index;
        else if (ele.mapColumn == 'LPA Accreditation Description') iLPADesc = ele.index;
        else if (ele.mapColumn == 'LPA Accreditation Status') iLPAStatus = ele.index;

        else if (ele.mapColumn == 'NT Accreditation License Number') iNTLicense = ele.index;
        else if (ele.mapColumn == 'NT Accreditation Expiry Date') iNTExpiry = ele.index;
        else if (ele.mapColumn == 'NT Accreditation State') iNTState = ele.index;
        else if (ele.mapColumn == 'NT Accreditation Description') iNTDesc = ele.index;
        else if (ele.mapColumn == 'NT Accreditation Status') iNTStatus = ele.index;

    });

    if (iPIC == undefined) {
        context.done(null, { status: 400, message: 'Please add PIC inside the CSV.' });
    }

    console.log('Fetching data for validation');
    repo.getPropertyTypeBindings(event.body.language).then(function (propertyTypeRes) {
        listPropertyType = propertyTypeRes;
        return repo.getState(event.body.language);
    }).then(function (stateRes) {
        listState = stateRes;
        return repo.getPropAccredByPropId(null, event.body.language);
    }).then(function (accreditationRes) {
        listAccreditation = accreditationRes;
        return repo.getCompanyByCondition({ IsDeleted: 0 });
    }).then(function (companyRes) {
        listCompany = companyRes;
        return repo.getAllSuburb({});
    }).then(function (suburbRes) {
        listSuburb = suburbRes;

        console.log('Retrieves objects from Amazon S3');
        s3.getObject({
            Bucket: event.body.bucket,
            Key: fileToProcess
        }).promise().then(function (data) {

            console.log('S3 object fetched');
            var picList = [];
            var mngrList = [];

            data.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach((row, i) => {
                var element = row.split(',');
                if (element[0] != event.body.mapping[0].mapColumn) {
                    picList.push(element[iPIC].trim());
                    if (iPropertyMngr != undefined && element[iPropertyMngr].trim())
                        mngrList.push(element[iPropertyMngr].trim().toLowerCase());
                }
            });

            console.log('Retrieves PIC list from db');
            return repo.getProperties({ PIC: picList, IsDeleted: 0 }, [['UUID', 'Id'], 'PIC', 'AuditLogId']).then(function (picResult) {
                listPIC = picResult;
                if (mngrList.length > 0) {
                    var condition = {
                        $or: [
                            Sequelize.where(Sequelize.fn('concat', Sequelize.col('FirstName'), ' ', Sequelize.col('LastName')), { eq: mngrList }),
                            Sequelize.where(Sequelize.fn('concat', Sequelize.col('LastName'), ' ', Sequelize.col('FirstName')), { eq: mngrList }),
                            { FirstName: mngrList }
                        ]
                    }
                    return repo.getAllContact(condition);
                }
                else {
                    return [];
                }
            }).then(function (contactResult) {
                listContact = contactResult;

                console.log('Validating data');
                var validData = [];
                var invalidData = [];
                var totalIssues = [];
                var invalidGridData = [];

                data.Body.toString().replace(/(?:\r)/g, '').split('\n').forEach((row, i) => {
                    var element = row.split(',');
                    var issues = [];

                    if (element[0] != event.body.mapping[0].mapColumn) {

                        var company = iCompany == undefined ? null : element[iCompany].trim().toLowerCase();
                        var region = iRegion == undefined ? null : element[iRegion].trim().toLowerCase();
                        var business = iBusiness == undefined ? null : element[iBusiness].trim().toLowerCase();
                        var pic = iPIC == undefined ? null : element[iPIC].trim().toUpperCase();
                        var name = iPropertyName == undefined ? null : element[iPropertyName].trim();
                        var type = iPropertyType == undefined ? null : element[iPropertyType].trim().toLowerCase();
                        var address = iAddress == undefined ? null : element[iAddress].trim();
                        var suburb = iSuburb == undefined ? null : element[iSuburb].trim().toLowerCase();
                        var state = iState == undefined ? null : element[iState].trim().toLowerCase();
                        var postcode = iPostcode == undefined ? null : element[iPostcode].trim().toLowerCase();
                        var brand = iBrand == undefined ? null : element[iBrand].trim();
                        var earmark = iEarmark == undefined ? null : element[iEarmark].trim();
                        var nlisUser = iNLISUser == undefined ? null : element[iNLISUser].trim();
                        var nlisPwd = iNLISPwd == undefined ? null : element[iNLISPwd].trim();
                        var exportEligibilityData = iExportEligibility == undefined ? null : element[iExportEligibility].trim().toLowerCase();
                        var propertyMngr = iPropertyMngr == undefined ? null : element[iPropertyMngr].trim();

                        var euLicense = iEULicense == undefined ? null : element[iEULicense].trim();
                        var euExpiryDate = iEUExpiry == undefined ? null : element[iEUExpiry].trim();
                        var euState = iEUState == undefined ? null : element[iEUState].trim().toLowerCase();
                        var euDesc = iEUDesc == undefined ? null : element[iEUDesc].trim();
                        var euStatus = iEUStatus == undefined ? null : element[iEUStatus].trim().toLowerCase();

                        var obeLicense = iOBELicense == undefined ? null : element[iOBELicense].trim();
                        var obeExpiryDate = iOBEExpiry == undefined ? null : element[iOBEExpiry].trim();
                        var obeState = iOBEState == undefined ? null : element[iOBEState].trim().toLowerCase();
                        var obeDesc = iOBEDesc == undefined ? null : element[iOBEDesc].trim();
                        var obeStatus = iOBEStatus == undefined ? null : element[iOBEStatus].trim().toLowerCase();

                        var pcasLicense = iPCASLicense == undefined ? null : element[iPCASLicense].trim();
                        var pcasExpiryDate = iPCASExpiry == undefined ? null : element[iPCASExpiry].trim();
                        var pcasState = iPCASState == undefined ? null : element[iPCASState].trim().toLowerCase();
                        var pcasDesc = iPCASDesc == undefined ? null : element[iPCASDesc].trim();
                        var pcasStatus = iPCASStatus == undefined ? null : element[iPCASStatus].trim().toLowerCase();

                        var msaLicense = iMSALicense == undefined ? null : element[iMSALicense].trim();
                        var msaExpiryDate = iMSAExpiry == undefined ? null : element[iMSAExpiry].trim();
                        var msaState = iMSAState == undefined ? null : element[iMSAState].trim().toLowerCase();
                        var msaDesc = iMSADesc == undefined ? null : element[iMSADesc].trim();
                        var msaStatus = iMSAStatus == undefined ? null : element[iMSAStatus].trim().toLowerCase();

                        var lpaLicense = iLPALicense == undefined ? null : element[iLPALicense].trim();
                        var lpaExpiryDate = iLPAExpiry == undefined ? null : element[iLPAExpiry].trim();
                        var lpaState = iLPAState == undefined ? null : element[iLPAState].trim().toLowerCase();
                        var lpaDesc = iLPADesc == undefined ? null : element[iLPADesc].trim();
                        var lpaStatus = iLPAStatus == undefined ? null : element[iLPAStatus].trim().toLowerCase();

                        var ntLicense = iNTLicense == undefined ? null : element[iNTLicense].trim();
                        var ntExpiryDate = iNTExpiry == undefined ? null : element[iNTExpiry].trim();
                        var ntState = iNTState == undefined ? null : element[iNTState].trim().toLowerCase();
                        var ntDesc = iNTDesc == undefined ? null : element[iNTDesc].trim();
                        var ntStatus = iNTStatus == undefined ? null : element[iNTStatus].trim().toLowerCase();

                        issues = issues.concat(companyValidation(company, region, business));
                        issues = issues.concat(propertyNameValidation(name));
                        issues = issues.concat(propertyTypeValidation(type));
                        issues = issues.concat(addressValidation(address));
                        issues = issues.concat(suburbValidation(suburb, state, postcode));
                        issues = issues.concat(brandValidation(brand));
                        issues = issues.concat(earmarkValidation(earmark));
                        issues = issues.concat(nlisValidation(nlisUser, nlisPwd));
                        issues = issues.concat(exportEligibilityValidation(exportEligibilityData));
                        issues = issues.concat(picValidation(pic));

                        if (accreditationValidation(euLicense, euExpiryDate, euState, euDesc, euStatus, 'EU')) {
                            issues = issues.concat(acLicenseValidation(euLicense, 'EU'));
                            issues = issues.concat(acExpiryValidation(euExpiryDate, 'EU'));
                            issues = issues.concat(acStateValidation(euState, 'EU'));
                            issues = issues.concat(acDescValidation(euDesc, 'EU'));
                            issues = issues.concat(acStatusValidation(euStatus, 'EU'));
                        }
                        else {
                            issues.push('EU Accreditation Program is not exist in our system.');
                        }


                        if (accreditationValidation(obeLicense, obeExpiryDate, obeState, obeDesc, obeStatus, 'OBE')) {
                            issues = issues.concat(acLicenseValidation(obeLicense, 'OBE'));
                            issues = issues.concat(acExpiryValidation(obeExpiryDate, 'OBE'));
                            issues = issues.concat(acStateValidation(obeState, 'OBE'));
                            issues = issues.concat(acDescValidation(obeDesc, 'OBE'));
                            issues = issues.concat(acStatusValidation(obeStatus, 'OBE'));
                        }
                        else {
                            issues.push('OBE Accreditation Program is not exist in our system.');
                        }

                        if (accreditationValidation(pcasLicense, pcasExpiryDate, pcasState, pcasDesc, pcasStatus, 'PCAS')) {
                            issues = issues.concat(acLicenseValidation(pcasLicense, 'PCAS'));
                            issues = issues.concat(acExpiryValidation(pcasExpiryDate, 'PCAS'));
                            issues = issues.concat(acStateValidation(pcasState, 'PCAS'));
                            issues = issues.concat(acDescValidation(pcasDesc, 'PCAS'));
                            issues = issues.concat(acStatusValidation(pcasStatus, 'PCAS'));
                        }
                        else {
                            issues.push('PCAS Accreditation Program is not exist in our system.');
                        }

                        if (accreditationValidation(msaLicense, msaExpiryDate, msaState, msaDesc, msaStatus, 'MSA')) {
                            issues = issues.concat(acLicenseValidation(msaLicense, 'MSA'));
                            issues = issues.concat(acExpiryValidation(msaExpiryDate, 'MSA'));
                            issues = issues.concat(acStateValidation(msaState, 'MSA'));
                            issues = issues.concat(acDescValidation(msaDesc, 'MSA'));
                            issues = issues.concat(acStatusValidation(msaStatus, 'MSA'));
                        }
                        else {
                            issues.push('MSA Accreditation Program is not exist in our system.');
                        }

                        if (accreditationValidation(lpaLicense, lpaExpiryDate, lpaState, lpaDesc, lpaStatus, 'LPA')) {
                            issues = issues.concat(acLicenseValidation(lpaLicense, 'LPA'));
                            issues = issues.concat(acExpiryValidation(lpaExpiryDate, 'LPA'));
                            issues = issues.concat(acStateValidation(lpaState, 'LPA'));
                            issues = issues.concat(acDescValidation(lpaDesc, 'LPA'));
                            issues = issues.concat(acStatusValidation(lpaStatus, 'LPA'));
                        }
                        else {
                            issues.push('LPA Accreditation Program is not exist in our system.');
                        }

                        if (accreditationValidation(ntLicense, ntExpiryDate, ntState, ntDesc, ntStatus, 'NT')) {
                            issues = issues.concat(acLicenseValidation(ntLicense, 'NT'));
                            issues = issues.concat(acExpiryValidation(ntExpiryDate, 'NT'));
                            issues = issues.concat(acStateValidation(ntState, 'NT'));
                            issues = issues.concat(acDescValidation(ntDesc, 'NT'));
                            issues = issues.concat(acStatusValidation(ntStatus, 'NT'));
                        }
                        else {
                            issues.push('NT Accreditation Program is not exist in our system.');
                        }


                        if (issues.length > 0) {
                            invalidData.push(element);
                            totalIssues.push(issues.join('\n'));
                            invalidGridData.push({ line: i + event.body.offset, issues: issues.join('\n') });
                        }
                        else {

                            var objEU = getAccreditationProgram(euLicense, euExpiryDate, euState, euDesc, euStatus, 'EU');
                            var objOBE = getAccreditationProgram(obeLicense, obeExpiryDate, obeState, obeDesc, obeStatus, 'OBE');
                            var objPCAS = getAccreditationProgram(pcasLicense, pcasExpiryDate, pcasState, pcasDesc, pcasStatus, 'PCAS');
                            var objMSA = getAccreditationProgram(msaLicense, msaExpiryDate, msaState, msaDesc, msaStatus, 'MSA');
                            var objLPA = getAccreditationProgram(lpaLicense, lpaExpiryDate, lpaState, lpaDesc, lpaStatus, 'LPA');
                            var objNT = getAccreditationProgram(ntLicense, ntExpiryDate, ntState, ntDesc, ntStatus, 'NT');

                            var contact = getPropertyMngr(propertyMngr);

                            var newData = [];
                            newData.push(i + event.body.offset);

                            var obj = listPIC.find(x => x.PIC == pic);
                            if (obj) {
                                // Update records
                                newData.push(obj.Id, repo.bufferToUUID(obj.AuditLogId));
                            }
                            else {
                                // Create records
                                newData.push('', '');
                            }

                            newData.push(getCompanyId(company, region, business),
                                pic, name, getPropertyTypeId(type),
                                address, getSuburbId(suburb, state, postcode),
                                brand, earmark, getExportEligibility(exportEligibilityData),
                                nlisUser, nlisPwd, contact.propertyMngrId, contact.firstName, contact.lastName);

                            newData.push(objEU.AccreditationProgramId, objEU.IsActive,
                                objEU.LicenseNumber, objEU.StateId, objEU.ExpiryDate, objEU.Notes);

                            newData.push(objOBE.AccreditationProgramId, objOBE.IsActive, objOBE.LicenseNumber,
                                objOBE.StateId, objOBE.ExpiryDate, objOBE.Notes);

                            newData.push(objPCAS.AccreditationProgramId, objPCAS.IsActive, objPCAS.LicenseNumber,
                                objPCAS.StateId, objPCAS.ExpiryDate, objPCAS.Notes);

                            newData.push(objMSA.AccreditationProgramId, objMSA.IsActive, objMSA.LicenseNumber,
                                objMSA.StateId, objMSA.ExpiryDate, objMSA.Notes);

                            newData.push(objLPA.AccreditationProgramId, objLPA.IsActive, objLPA.LicenseNumber,
                                objLPA.StateId, objLPA.ExpiryDate, objLPA.Notes);

                            newData.push(objNT.AccreditationProgramId, objNT.IsActive, objNT.LicenseNumber,
                                objNT.StateId, objNT.ExpiryDate, objNT.Notes);

                            newData.push(contact.companyId);

                            validData.push(newData.join());

                        }

                    }
                }, this);

                console.log('Push invalid data in firebase');
                console.log('Invalid data length : ' + invalidGridData.length);
                return firebaseRef.push(invalidGridData).then(function (res) {
                    console.log('Creating valid CSV file to S3');
                    return s3.putObject({
                        Bucket: event.body.bucket,
                        Key: fileToProcess.substring(0, fileToProcess.lastIndexOf(".")) + "_Valid" + fileToProcess.substring(fileToProcess.lastIndexOf(".")),
                        Body: validData.join('\n')
                    }).promise();
                }).catch(function (err) {
                    console.log('Firebase error : ' + err);
                    throw new Error(err);
                });

            }).catch(function (err) {
                console.log('Data validation error : ' + err);
                throw new Error(err);
            });


        }).then(function () {
            console.log('Process completed.');
            context.done(null, 1);
        }).catch(function (err) {
            console.log('Error : ' + err);
            context.done(null, { status: 500, message: err });
        });

    });


    function companyValidation(company, region, business) {
        try {
            var issues = [];
            if (company == null || company == undefined || company == '') { issues.push('Company cannot be empty.'); }
            else if ((region == null || region == undefined || region == '') && business) { issues.push('Region cannot be empty.'); }
            else if (region && (business == null || business == undefined || business == '')) { issues.push('Business cannot be empty.'); }
            else if (region && business) {
                var companyObj = listCompany.find(x => x.Name.toLowerCase() == company && x.CompanyType == 'C');

                if (event.body.isAgliveSupportAdmin == 0 && companyObj && companyObj.Id != event.body.companyId)
                    companyObj = null;

                if (companyObj == null) { issues.push('Invalid Company.'); }
                else {
                    var regionObj = region ? listCompany.find(x => x.CompanyId && repo.bufferToUUID(x.CompanyId) == companyObj.Id && x.Name.toLowerCase() == region && x.CompanyType == 'R') : null;
                    if (region && !regionObj) { issues.push('Invalid Region.'); }
                    else {
                        var businessObj = business ? listCompany.find(x => x.CompanyId && repo.bufferToUUID(x.CompanyId) == companyObj.Id && x.RegionId && repo.bufferToUUID(x.RegionId) == regionObj.Id && x.Name.toLowerCase() == business && x.CompanyType == 'B') : null;
                        if (business && (businessObj == null || businessObj == undefined)) { issues.push('Invalid Business.'); }
                    }
                }
            }
            return issues;
        }
        catch (ex) {
            console.log('companyValidation : ' + ex);
            return [];
        }
    }

    function picValidation(pic) {
        try {
            var issues = [];
            if (pic == null || pic == undefined || pic == '') { issues.push('PIC cannot be empty.'); }
            else if (pic.length != 8 || !repo.picValidation(pic, propertyTypeSystemCode, stateSystemCode)) {
                issues.push('Invalid PIC.');
            }
            return issues;
        }
        catch (ex) {
            console.log('picValidation : ' + ex);
            return [];
        }
    }

    function propertyNameValidation(name) {
        try {
            var issues = [];
            if (name == null || name == undefined || name == '') { issues.push('Property Name cannot be empty.'); }
            else if (name.length > 250) { issues.push('Property Name should not exceed 250 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('propertyNameValidation : ' + ex);
            return [];
        }
    }

    function propertyTypeValidation(type) {
        try {
            var issues = [];
            if (type == null || type == undefined || type == '') { issues.push('Property Type cannot be empty.'); }
            else {
                var obj = listPropertyType.find(x => x.PropertyTypeName.toLowerCase() == type);
                if (obj == null || obj == undefined) { issues.push('Property Type cannot be empty.'); }
                else { propertyTypeSystemCode = obj.SystemCode; }
            }
            return issues;
        }
        catch (ex) {
            console.log('propertyTypeValidation : ' + ex);
            return [];
        }
    }

    function addressValidation(address) {
        try {
            var issues = [];
            if ((address != null && address != undefined && address != '') && address.length > 300) { issues.push('Address should not exceed 300 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('addressValidation : ' + ex);
            return [];
        }
    }

    function suburbValidation(suburb, state, postcode) {
        try {
            var issues = [];
            if ((suburb == null || suburb == undefined || suburb == '') &&
                (state == null || state == undefined || state == '') &&
                (postcode == null || postcode == undefined || postcode == '')) { return issues; }
            else if (suburb == null || suburb == undefined || suburb == '') { issues.push('Suburb cannot be empty.'); }
            else if (state == null || state == undefined || state == '') { issues.push('State cannot be empty.'); }
            else if (postcode == null || postcode == undefined || postcode == '') { issues.push('Postcode cannot be empty.'); }
            else {
                var obj = listSuburb.find(x => x.SuburbName.toLowerCase() == suburb && x.StateName.toLowerCase() == state && x.PostCode.toLowerCase() == postcode);
                if (obj == null || obj == undefined) { issues.push('Invalid Suburb/State/Postcode.'); }
                else { stateSystemCode = obj.StateSystemCode; }
            }
            return issues;
        }
        catch (ex) {
            console.log('suburbValidation : ' + ex);
            return [];
        }
    }

    function brandValidation(brand) {
        try {
            var issues = [];
            if ((brand != null && brand != undefined && brand != '') && brand.length > 50) { issues.push('Brand Text should not exceed 50 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('brandValidation : ' + ex);
            return [];
        }
    }

    function earmarkValidation(earmark) {
        try {
            var issues = [];
            if ((earmark != null && earmark != undefined && earmark != '') && earmark.length > 50) { issues.push('Earmark Text should not exceed 50 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('earmarkValidation : ' + ex);
            return [];
        }
    }

    function nlisValidation(nlisUser, nlisPwd) {
        try {
            var issues = [];
            if ((nlisUser == null || nlisUser == undefined || nlisUser == '')
                && (nlisPwd == null || nlisPwd == undefined || nlisPwd == '')) { return issues; }
            else if (nlisUser == null || nlisUser == undefined || nlisUser == '') { issues.push('NLIS Username cannot be empty.'); return issues; }
            else if (nlisPwd == null || nlisPwd == undefined || nlisPwd == '') { issues.push('NLIS Password cannot be empty.'); return issues; }
            else if (nlisUser.length > 100) { issues.push('NLIS Username should not exceed 100 characters.'); return issues; }
            else if (nlisPwd.length > 100) { issues.push('NLIS Password should not exceed 100 characters.'); return issues; }
            return issues;
        }
        catch (ex) {
            console.log('nlisValidation : ' + ex);
            return [];
        }
    }

    function exportEligibilityValidation(exportEligibilityData) {
        try {
            var issues = [];
            if (exportEligibilityData != null && exportEligibilityData != undefined && exportEligibilityData != '') {
                var data = exportEligibilityData.split('|');
                var isValid = true;
                data.map(d => {
                    var obj = repo.exportEligibility.find(x => x.Text.toLowerCase() == d);
                    if (obj != null || obj != undefined)
                        isValid = false;
                });
                if (!isValid) { issues.push('Invalid Export Eligibility.'); }
            }
            return issues;
        }
        catch (ex) {
            console.log('exportEligibilityValidation : ' + ex);
            return [];
        }
    }

    function accreditationValidation(license, expiryDate, state, desc, status, name) {
        try {
            var result = true;
            if (license || expiryDate || state || desc || status) {
                var obj = listAccreditation.find(x => x.Name.toLowerCase() == name.toLowerCase() || x.Code.toLowerCase() == name.toLowerCase());
                if (!obj)
                    result = false;
            }
            return result
        }
        catch (ex) {
            console.log('accreditationValidation - ' + name + ' : ' + ex);
            return true;
        }
    }

    function acLicenseValidation(license, name) {
        try {
            var issues = [];
            if ((license != null && license != undefined && license != '') && license.length > 50) { issues.push(name + ' Accreditation License Number should not exceed 50 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('acLicenseValidation - ' + name + ' : ' + ex);
            return [];
        }
    }

    function acExpiryValidation(expiryDate, name) {
        try {
            var issues = [];
            if ((expiryDate != null && expiryDate != undefined && expiryDate != '') && (!repo.isValid(expiryDate, 'DD-MM-YYYY') || !repo.isValid(expiryDate, 'DD/MM/YYYY')))
                issues.push('Invalid ' + name + ' Accreditation Expiry Date.');

            return issues;
        }
        catch (ex) {
            console.log('acExpiryValidation - ' + name + ' : ' + ex);
            return [];
        }
    }

    function acStateValidation(state, name) {
        try {
            var issues = [];
            if (state != null && state != undefined && state != '') {
                var data = state.split('|');
                var isValid = true;
                data.map(d => {
                    var obj = listState.find(x => x.State.toLowerCase() == d);
                    if (!obj)
                        isValid = false;
                });
                if (!isValid) { issues.push('Invalid ' + name + ' Accreditation State.'); }
            }
            return issues;
        }
        catch (ex) {
            console.log('acStateValidation - ' + name + ' : ' + ex);
            return [];
        }
    }

    function acDescValidation(desc, name) {
        try {
            var issues = [];
            if ((desc != null && desc != undefined && desc != '') && desc.length > 250) { issues.push(name + ' Accreditation Description should not exceed 250 characters.'); }
            return issues;
        }
        catch (ex) {
            console.log('acDescValidation - ' + name + ' : ' + ex);
            return [];
        }
    }

    function acStatusValidation(status, name) {
        try {
            var issues = [];
            if (status != null && status != undefined) {
                var obj = repo.accreditationStatus.find(x => x.Text.toLowerCase() == status);
                if (!obj)
                    issues.push('Invalid ' + name + ' Accreditation Status.');
            }
            return issues;
        }
        catch (ex) {
            console.log('acStatusValidation - ' + name + ' : ' + ex);
            return [];
        }
    }


    // Functions to prepare object for insert update

    function getCompanyId(company, region, business) {
        try {
            var result = null;
            var companyObj = listCompany.find(x => x.Name.toLowerCase() == company && x.CompanyType == 'C');
            if (region && business && companyObj) {
                var regionObj = region ? listCompany.find(x => x.CompanyId && repo.bufferToUUID(x.CompanyId) == companyObj.Id && x.Name.toLowerCase() == region && x.CompanyType == 'R') : null;
                if (regionObj) {
                    var businessObj = business ? listCompany.find(x => x.CompanyId && repo.bufferToUUID(x.CompanyId) == companyObj.Id && x.RegionId && repo.bufferToUUID(x.RegionId) == regionObj.Id && x.Name.toLowerCase() == business && x.CompanyType == 'B') : null;
                    if (businessObj) {
                        result = businessObj.Id;
                    }
                }
            }
            else if (companyObj) {
                result = companyObj.Id;
            }
            return result;
        }
        catch (ex) {
            console.log('getCompanyId : ' + ex);
            return null;
        }
    }

    function getPropertyTypeId(type) {
        try {
            var result = null;
            if (type) {
                var obj = listPropertyType.find(x => x.PropertyTypeName.toLowerCase() == type);
                if (obj)
                    result = obj.Id;
            }
            return result;
        }
        catch (ex) {
            console.log('getPropertyTypeId : ' + ex);
            return null;
        }
    }

    function getSuburbId(suburb, state, postcode) {
        try {
            var result = null;
            if (suburb) {
                var obj = listSuburb.find(x => x.SuburbName.toLowerCase() == suburb && x.StateName.toLowerCase() == state && x.PostCode.toLowerCase() == postcode);
                if (obj)
                    result = obj.Id;
            }
            return result;
        }
        catch (ex) {
            console.log('getSuburbId : ' + ex);
            return null;
        }
    }

    function getExportEligibility(exportEligibilityData) {
        try {
            var result = null;
            if (exportEligibilityData) {
                var data = exportEligibilityData.split('|');
                data.map(d => {
                    var obj = repo.exportEligibility.find(x => x.Text.toLowerCase() == d);
                    if (obj) { result += obj.Value + "|" }
                });
            }
            return result ? result.substr(0, result.length - 1) : null;
        }
        catch (ex) {
            console.log('getExportEligibility : ' + ex);
            return null;
        }
    }

    function getPropertyMngr(propertyMngr, company) {
        try {
            var result = { propertyMngrId: null, companyId: null, firstName: null, lastName: null };
            if (propertyMngr) {
                var companyObj = listCompany.find(x => x.Name.toLowerCase() == company && x.CompanyType == 'C');
                var obj = listContact.find(x => ((x.FirstName + ' ' + x.LastName).toLowerCase() == propertyMngr.toLowerCase() || (x.LastName + ' ' + x.FirstName).toLowerCase() == propertyMngr.toLowerCase() || x.FirstName.toLowerCase() == propertyMngr.toLowerCase()) && x.Id == companyObj.Id);
                if (obj != null && obj != undefined) {
                    result.propertyMngrId = obj.Id;
                }
                else {
                    result.companyId = companyObj.Id;
                    var i = propertyMngr.indexOf(' ');
                    if (i != -1) {
                        result.firstName = propertyMngr.substring(0, i);
                        result.lastName = propertyMngr.substring(i + 1);
                    }
                    else {
                        result = { firstName: propertyMngr, lastName: propertyMngr };
                    }
                }
            }
            return result;
        }
        catch (ex) {
            console.log('getPropertyMngr : ' + ex);
            return { propertyMngrId: null, companyId: null, firstName: null, lastName: null };
        }
    }

    function getAccreditationProgram(license, expiryDate, state, desc, status, name) {
        try {
            var result = { AccreditationProgramId: '', IsActive: '', LicenseNumber: '', StateId: '', ExpiryDate: '', Notes: '' };
            if (license || expiryDate || state || desc || status) {
                var obj = listAccreditation.find(x => x.Name.toLowerCase() == name.toLowerCase() || x.Code.toLowerCase() == name.toLowerCase());
                if (obj) {

                    var statusRes = null;
                    if (status) {
                        var obj = repo.accreditationStatus.find(x => x.Text.toLowerCase() == status);
                        if (obj) { statusRes = obj.Value == 1 ? null : obj.Value == 2 ? true : false; }
                    }

                    var stateIdRes = "";
                    if (state) {
                        var data = state.split('|');
                        data.map(d => {
                            var obj = listState.find(x => x.State.toLowerCase() == d);
                            if (obj) { stateIdRes += obj.Id + "|"; }
                        });
                        stateIdRes = stateIdRes ? stateIdRes.substr(0, stateIdRes.length - 1) : null;
                    }

                    // var expiryDateRes = null;
                    // if (expiryDate) {
                    // if (repo.isValid(expiryDate, 'DD-MM-YYYY'))
                    //     expiryDateRes = repo.moment(expiryDate, 'DD-MM-YYYY');
                    // else if (repo.isValid(expiryDate, 'DD/MM/YYYY'))
                    //     expiryDateRes = repo.moment(expiryDate, 'DD/MM/YYYY');
                    // }

                    result = {
                        AccreditationProgramId: obj.Id,
                        IsActive: statusRes,
                        LicenseNumber: license,
                        StateId: stateIdRes,
                        ExpiryDate: expiryDate,
                        Notes: desc
                    };
                }
            }
            return result
        }
        catch (ex) {
            console.log('accreditationValidation - ' + name + ' : ' + ex);
            return { AccreditationProgramId: '', IsActive: '', LicenseNumber: '', StateId: '', ExpiryDate: '', Notes: '' };
        }
    }


}
