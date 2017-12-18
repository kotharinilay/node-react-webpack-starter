'use strict';

/*************************************
 * initial temporary data generator  
 * *************************************/

var config = require('./config');
var contact = require('../../server/repository/contact');
var client = require('../../server/repository/client');
var crypto = require('crypto');
var encryptPassword = require('../../server/auth/password-auth').encryptPassword;
//var firebase = require('firebase');
var models = require('../../server/schema');
module.exports = function () {

    // // Company
    // let uuid = newUUID();
    // let obj = {
    //     Id: uuidToBuffer(uuid),
    //     UUID: uuid,
    //     CompanyType: 'R',
    //     Name:'C3_R2',
    //     CompanyId:uuidToBuffer('a9f0cc80-fca6-11e6-b543-0f26224c9389')
    // }
    // models.company.create(obj);

    // // contact type data
    // var propertyaccess = config.get("default:propertyaccess");
    // propertyaccess.map((paObj) => {
    //     let paid = newUUID();
    //     let auditId = newUUID();

    //     let pa = {
    //         Id: uuidToBuffer(paid),
    //         UUID: paid,
    //         PropertyId: uuidToBuffer(paObj.property),
    //         AuditLogId: uuidToBuffer(auditId),
    //         ValidFromDate: new Date(paObj.ValidFromDate),
    //         ValidToDate: new Date(paObj.ValidToDate),
    //         ContactId: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6')
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     require('deasync').sleep(100);
    //     models.propertyaccess.create(pa);
    // });

    // // contact role
    // var contactroles = config.get("default:contactroles");
    // contactroles.map((contactroleObj) => {
    //     let contactroleid = newUUID();
    //     let contactrole = {
    //         Id: uuidToBuffer(contactroleid),
    //         CompanyId: uuidToBuffer(contactroleObj.company),
    //         ContactId: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         ContactTypeId: uuidToBuffer(contactroleObj.contacttype),
    //     }
    //     models.contactrole.create(contactrole);
    // });

    //     // contact type data
    //     var contacttypes = config.get("default:contacttypes");
    //     contacttypes.map((contacttypeObj) => {
    //         let contacttypeid = newUUID();
    //         let auditId = newUUID();
    //         let jsonObj = {
    //             en: { TypeName: contacttypeObj.TypeName, TypeCode: contacttypeObj.TypeName }
    //         }
    //         let contacttype = {
    //             Id: uuidToBuffer(contacttypeid),
    //             UUID: contacttypeid,
    //             SystemCode: contacttypeObj.SystemCode,
    //             AuditLogId: uuidToBuffer(auditId),
    //             LocalizedData: JSON.stringify(jsonObj),
    //             CountryId: uuidToBuffer('3f5cff40-f33e-11e6-b4e1-47f5e99f5e29')
    //     }
    //         let audit = {
    //             Id: uuidToBuffer(auditId),
    //             UUID: auditId,
    //             CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //             CreatedStamp: new Date(),
    //             CreatedFromSource: 'web'
    //         }
    //         models.auditlog.create(audit);
    //     require('deasync').sleep(100);
    //     models.contacttype.create(contacttype);
    // });

    // // Module
    // let uuid = '33d33ca2-f98f-11e6-b179-d7c06e3b519a';
    // let obj = {
    //     Id: uuidToBuffer(uuid),
    //     SystemCode: 'M1',
    //     UUID: uuid
    // }
    // models.module.create(obj);

    // // ControlMenu
    // var controlmenu = config.get("default:controlmenu");
    // controlmenu.map((obj) => {
    //     let uuid = newUUID();
    //     let jsonObj = {
    //         en: { Name: obj.Name }
    //     }
    //     let controlmenuObj = {
    //         Id: uuidToBuffer(uuid),
    //         LocalizedData: JSON.stringify(jsonObj),
    //         ModuleId: uuidToBuffer(obj.ModuleId),
    //         SystemCode: obj.SystemCode,
    //         Icon: obj.Icon,
    //         HoverIcon: obj.HoverIcon,
    //         UUID: uuid,
    //         RedirectURL: obj.RedirectURL,
    //         SortOrder: obj.SortOrder
    //     }
    //     models.controlmenu.create(controlmenuObj);
    // });


    // // Setup menu insertation in controlmenu
    // var controlmenu = config.get("default:setupmenu");
    // controlmenu.map((obj) => {
    //     let uuid = newUUID();
    //     let jsonObj = {
    //         en: { Name: obj.Name }
    //     }
    //     let controlmenuObj = {
    //         Id: uuidToBuffer(uuid),
    //         UUID: uuid,
    //         ModuleId: uuidToBuffer('33d33ca2-f98f-11e6-b179-d7c06e3b519a'),
    //         ParentId: uuidToBuffer('d1305210-fcd4-11e6-a8a3-575637f1f77d'),
    //         GroupId: uuidToBuffer(obj.GroupId),
    //         SystemCode: obj.SystemCode,
    //         LocalizedData: JSON.stringify(jsonObj),
    //         RedirectURL: obj.RedirectURL,
    //         SortOrder: obj.SortOrder,
    //         IsSetupMenu: 1
    //     }
    //     models.controlmenu.create(controlmenuObj);
    // });



    // // MenuGroup
    // var menugroup = config.get("default:menugroup");
    // menugroup.map((obj) => {
    //     let uuid = newUUID();
    //     let jsonObj = {
    //         en: { Name: obj.GroupName }
    //     }
    //     let menugroupObj = {
    //         Id: uuidToBuffer(uuid),
    //         UUID: uuid,
    //         SystemCode: obj.SystemCode,
    //         LocalizedData: JSON.stringify(jsonObj),
    //         Icon: obj.Icon,
    //         HoverIcon: obj.HoverIcon,
    //         SortOrder: obj.SortOrder
    //     }
    //     models.menugroup.create(menugroupObj);
    // });


    // // property data
    // var properties = config.get("default:property");
    // properties.map((propertyObj) => {
    //     let propertyid = newUUID();
    //     let auditId = newUUID();
    //     let property = {
    //         Id: uuidToBuffer(propertyid),
    //         UUID: propertyid,
    //         AuditLogId: uuidToBuffer(auditId),
    //         PIC: propertyObj.PIC,
    //         Name: propertyObj.Name,
    //         PropertyTypeId: uuidToBuffer(propertyObj.PropertyTypeId),
    //         SuburbId: uuidToBuffer(propertyObj.SuburbId),
    //         Area: propertyObj.Area,
    //         LivestockIdentifier: '',
    //         CompanyId: uuidToBuffer(propertyObj.CompanyId)
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     require('deasync').sleep(500);
    //     models.property.create(property);
    // });

    // // suburb data
    // var suburbs = config.get("default:suburb");
    // suburbs.map((suburbObj) => {
    //     let suburbid = newUUID();
    //     let auditId = newUUID();
    //     let suburb = {
    //         Id: uuidToBuffer(suburbid),
    //         UUID: suburbid,
    //         AuditLogId: uuidToBuffer(auditId),
    //         Name: suburbObj.Name,
    //         StateId: uuidToBuffer(suburbObj.StateId),
    //         PostCode: suburbObj.PostCode
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     require('deasync').sleep(100);
    //     models.suburb.create(suburb);
    // });

    // // state data
    // var states = config.get("default:state");
    // states.map((stateObj) => {
    //     let stateid = newUUID();
    //     let auditId = newUUID();
    //     let state = {
    //         Id: uuidToBuffer(stateid),
    //         UUID: stateid,
    //         SystemCode: stateObj.SystemCode,
    //         AuditLogId: uuidToBuffer(auditId),
    //         LocalizedData: models.Sequelize.fn('COLUMN_CREATE', ["StateName", stateObj.StateName, "StateCode", stateObj.StateCode]),
    //         CountryId: uuidToBuffer('3f5cff40-f33e-11e6-b4e1-47f5e99f5e29')
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     require('deasync').sleep(100);
    //     models.state.create(state);
    // });

    // // country data
    // var countries = config.get("default:country");
    // countries.map((countryObj) => {
    //     let countryid = newUUID();
    //     let auditId = newUUID();
    //     let country = {
    //         Id: uuidToBuffer(countryid),
    //         UUID: countryid,
    //         SystemCode: countryObj.SystemCode,
    //         AuditLogId: uuidToBuffer(auditId),
    //         LocalizedData: models.Sequelize.fn('COLUMN_CREATE', ["CountryName", countryObj.CountryName, "CountryCode", countryObj.CountryCode])
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     models.country.create(country);
    // });

    // // chemicalCategory data
    // var chemicalCategories = config.get("default:chemicalCategory");
    // chemicalCategories.map((chemicalCategoryObj) => {
    //     let chemicalCategoryid = newUUID();
    //     let auditId = newUUID();
    //     let chemicalCategory = {
    //         Id: uuidToBuffer(chemicalCategoryid),
    //         UUID: chemicalCategoryid,
    //         SystemCode: chemicalCategoryObj.SystemCode,
    //         AuditLogId: uuidToBuffer(auditId),
    //         LocalizedData: models.Sequelize.fn('COLUMN_CREATE', ["ChemicalCategoryName", chemicalCategoryObj.ChemicalCategoryName, "ChemicalCategoryCode", chemicalCategoryObj.ChemicalCategoryCode])
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     models.chemicalcategory.create(chemicalCategory);
    // });

    // // chemicalproductactivity
    // var chemicalproductactivities = config.get("default:chemicalproductactivity");
    // chemicalproductactivities.map((chemicalproductactivityObj) => {
    //     let chemicalproductactivityid = newUUID();
    //     let auditId = newUUID();
    //     let chemicalproductactivity = {
    //         Id: uuidToBuffer(chemicalproductactivityid),
    //         UUID: chemicalproductactivityid,
    //         SystemCode: chemicalproductactivityObj.SystemCode,
    //         AuditLogId: uuidToBuffer(auditId),
    //         ActivityName: chemicalproductactivityObj.ActivityName
    //     }
    //     let audit = {
    //         Id: uuidToBuffer(auditId),
    //         UUID: auditId,
    //         CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //         CreatedStamp: new Date(),
    //         CreatedFromSource: 'web'
    //     }
    //     models.auditlog.create(audit);
    //     models.chemicalproductactivity.create(chemicalproductactivity);
    // });

    // // UoM types data
    // var uomTypes = config.get("default:uomTypes");
    // uomTypes.map((uomTypeObj) => {
    //     let uomTypeid = newUUID();
    //     let uomType = {
    //         Id: uuidToBuffer(uomTypeid),
    //         UUID: uomTypeid,
    //         SystemCode: uomTypeObj.SystemCode,
    //         LocalizedData: models.Sequelize.fn('COLUMN_CREATE', ["UoMTypeName", uomTypeObj.UoMTypeName, "UoMTypeCode", uomTypeObj.UoMTypeCode])
    //     }
    //     models.uomtype.create(uomType);
    // });

    var salt = crypto.randomBytes(32).toString('hex');
    console.log('Email : ' + config.get("default:user:email"));
    var contactObj = {
        FirstName: config.get("default:user:firstname"),
        LastName: config.get("default:user:lastname"),
        Email: config.get("default:user:email"),
        PasswordSalt: salt,
        PasswordHash: encryptPassword(salt, config.get("default:user:password"))
    }

    models.contact.create(contactObj);

    // contact.create(contactObj).then(function (res, err) {
    //     if (err)
    //         console.log("Error occured while creating contact : " + err);
    //     else {
    //         // Initialize Firebase
    //         // var Fconfig = {
    //         //     apiKey: "AIzaSyCmSNSF4K2clHCxWVMsE72NI5lZhwxBcW0",
    //         //     authDomain: "aglive-v3.firebaseapp.com",
    //         //     databaseURL: "https://aglive-v3.firebaseio.com",
    //         //     storageBucket: "aglive-v3.appspot.com",
    //         //     messagingSenderId: "1034649343420"
    //         // };
    //         // firebase.initializeApp(Fconfig);

    //         // firebase.auth().signInWithEmailAndPassword("romil@zealousys.com", "ze@lous2012").then(function (res) {
    //         //     console.log(res);
    //         //     writeUserData();
    //         // }).catch(function (err) {
    //         //     console.log(err);
    //         // });

    //         // function writeUserData() {
    //         //     firebase.database().ref('users/' + contactid).set({
    //         //         FirstName: contactObj.FirstName,
    //         //         LastName: contactObj.LastName,
    //         //         Email: contactObj.Email,
    //         //         UserName: contactObj.UserName,
    //         //         PasswordHash: contactObj.PasswordHash
    //         //     });
    //         // }
    //         console.log("Contact created with email : " + contactObj.Email + " and password : " + config.get("default:user:password"));
    //     }

    // });

    // var clientObj = {
    //     Name: config.get("default:client:name"),
    //     ClientId: config.get("default:client:clientId"),
    //     ClientSecret: config.get("default:client:clientSecret")
    // }

    // client.create1(clientObj).then(function (res, err) {
    //     if (err)
    //         console.log("Error occured while creating contact : " + err);
    //     else
    //         console.log("Contact created with client id : " + config.get("default:client:clientId") + " and ClientSecret : " + config.get("default:client:clientSecret"));
    // });

    // let auditId = newUUID();
    // let audit = {
    //     Id: uuidToBuffer(auditId),
    //     UUID: auditId,
    //     CreatedBy: uuidToBuffer('ca4d4b30-d7e3-11e6-86f4-b5756a924ac6'),
    //     CreatedStamp: new Date(),
    //     CreatedFromSource: 'web'
    // }
    // models.auditlog.create(audit);

    // var companyid = newUUID();
    // var companyObj = {
    //     Id: uuidToBuffer(companyid),
    //     UUID: companyid,
    //     Name: config.get("default:company:Name"),
    //     CompanyType: config.get("default:company:CompanyType"),
    //     ShortCode: config.get("default:company:ShortCode")
    // }
    // models.company.create(companyObj);

    // company.create(companyObj).then(function (res, err) {
    //     if (err)
    //         console.log("Error occured while creating contact : " + err);
    //     else
    //         console.log("Contact created with client id : " + config.get("default:client:clientId") + " and ClientSecret : " + config.get("default:client:clientSecret"));
    // });
}