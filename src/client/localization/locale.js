'use strict';

/*************************************
 * load data files based on languague provided 
 * from respective folder
 * *************************************/

module.exports = (lang) => {

        var params = {
                DOCUMENT_TITLE_PREFIX: "Aglive v3 - "
        };

        // Load common languague file
        var langCommon = require('./' + lang + '/common');

        // Load languages base on file name and params
        function load(name, params = null) {
                let langFile = null;
                if (!params)
                        langFile = require('./' + lang + '/' + name);
                else
                        langFile = require('./' + lang + '/' + name)(params);

                return Object.assign(langFile, langCommon);
        }

        return {
                Dashboard: load('dashboard'),
                Header: load('header'),
                Footer: load('footer'),
                SideBar: load('sidebar'),
                Login: load('login', params),
                ChangePassword: load('popup-changepassword'),
                ForgotPassword: load('forgotpassword', params),
                CheckEmail: load('checkemail'),
                ResetPassword: load('resetpassword'),
                Lib: load('lib'),
                SetupFeed: load('feed-setup'),
                Setup: load('setup-menu'),
                SetupSpecies: load('setup-species'),
                SetupBreed: load('setup-breed'),
                SetupMaturity: load('setup-maturity'),
                SetupSpeciesType: load('setup-speciestype'),
                SetupGender: load('setup-gender'),
                SetupPropertyType: load('setup-propertytype'),
                Uom: load('setup-uom'),
                UomConversion: load('setup-uomconversion'),
                SetupServiceType: load('setup-servicetype'),
                SetupBreedType: load('setup-breedtype'),
                SetupEnclosureType: load('setup-enclosuretype'),
                SetupDoseByMeasere: load('setup-dosebymeasure'),
                SetupChemicalCategory: load('setup-chemicalcategory'),
                SetupTreatmentType: load('setup-treatmenttype'),
                SetupTreatmentMethod: load('setup-treatmentmethod'),
                SetupLivestockColour: load('setup-livestockcolour'),
                SetupGroup: load('setup-group'),
                SetupDeathReason: load('setup-deathreason'),
                SetupAccreditationProgram: load('setup-accreditationprogram'),
                PrivateLayout: load('private-layout'),
                SetupChemicalProduct: load('setup-chemicalproduct'),
                Contact: load('contact'),
                Company: load('company'),
                Property: load('property'),
                PastureComposition: load('pasturecomposition'),
                ImportDesk: load('import-desk'),
                Common: load('common'),
                UserSetup: load('setup-menu'),
                UserSetupSpecies: load('usersetup-species'),
                Livestock: load('livestock'),
                RecordFeed: load('feed-record'),
                ENVD: load('e-NVD')
        };
};
