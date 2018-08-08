'use strict';

/*************************************
 * import desk screen
 * *************************************/

module.exports = {
    CONTROLS: {
        NEXT_LABLE: 'Next',
        PREVIOUS_LABEL: 'Previous',
        STEP3: 'Status',
        CANCEL_LABEL: 'Cancel',
        UPLOAD_CSV_LABEL: 'Select CSV file to upload & import',
        VALIDATE_LABEL: 'Validate',
        IMPORT_CSV_LABEL: 'Import CSV',
        DOWNLOAD_CSV_LINK: 'Download a sample CSV file',
        UPLOAD_FILE_VALIDAITON_MESSAGE: 'Please upload CSV file to import data.',
        VALIDATION_NO_RECORDS_FOUND: 'No records found to import.',
        VALIDATION_REQ_MESSASAGE: 'Please validate data first.',
        STEP3_GUIDE_TEXT: 'Status of import CSV records will be display.',
        VALIDATION_SUCCESS: 'Data validated successfully.',
        IMPORT_SUCCESS: 'Records imported successfully.',
        IMPORT_ERROR: 'Some error occured while importing records. Please try again.',
        TRY_AGAIN_LABEL: 'Try again',
        UPLOAD_ANOTHER_FILE_LABEL: 'Upload more data',
        IMPORT_CONFIRMATION_MESSAGE: 'Are you sure you want to import valid data to system?',
        UPLOAD_FILE_ERROR: 'Some error occured while upload file. Please try again.'
    },
    'IMPORT-DESK': {
        TITLE: 'Import Desk',
        DESCRIPTION: 'Import desk allows you to upload CSV file and populate new or modify existing data.',
        SELECTION_TEXT: 'Choose what you want to do on selected Property',
        CONTROLS: {
            CANCEL_LABEL: 'Cancel',
            PROCEED_LABEL: 'Proceed',
            PIC_PLACEHOLDER: 'Selected PIC',
            PROPERTY_NAME_PLACEHOLDER: 'Selected Property Name',
            PROPERTY_NAME_LABEL: 'Selected Property Name',
            IMPORT_TAG_LABEL: 'Import Tags',
            IMPORT_LIVESTOCK_LABEL: 'Import Livestock & Record Activities',
            IMPORT_ENVD_MOVEMENT_LABEL: 'Import eNVD Movement',
            IMPORT_TREATMENT_LABEL: 'Import Treatment',
            IMPORT_CARCASS_LABEL: 'Import Kill/Carcass Data',
            IMPORT_DECEASED_LABEL: 'Import Deceased Data',
            IMPORT_TRAIT_LABEL: 'Import Trait Data',
            IMPORT_CHEMICAL_PRODUCT_LABEL: 'Import Chemical Products',
            IMPORT_GRAIN_FODDER_LABEL: 'Import Grain & Fodder',
            IMPORT_COMPANY_CONTACT_LABEL: 'Import Company, Region, Business Unit & Contact Data',
            IMPORT_PROPERTY_LABEL: 'Import Property Data',
            IMPORT_ENCLOSURE_LABEL: 'Import Enclosure Data',
            IMPORT_LIVESTOCK_REPLACEMENT_LABEL: 'Import Replacement of Livestock Identity',
            IMPORT_LOST_TAGS_LABEL: 'Import Lost Tags'
        },
        CHOOSE_ACTION_MESSAGE: 'Choose what you want to do on selected property'
    },
    'IMPORT-TAG': {
        TITLE: 'Import Tag',
        DESCRIPTION: 'Import Tag',
        STEP1: 'Upload CSV',
        STEP2: 'Map CSV Data',
        STEP1_GUIDE_TEXT: 'Upload CSV file of tags and import data.\nIf you need assistance in creating CSV file, please download a sample.',
        STEP2_GUIDE_TEXT: 'Map CSV data with Aglive format. Import will only copy mapped data from CSV and skips un-mapped data. If you want to automate mapping, then use the same name of data in CSV file or refer sample CSV file from below link.'
    },
    'IMPORT-PROPERTY': {
        TITLE: 'Import Property',
        DESCRIPTION: 'Import Property',
        STEP1: 'Upload CSV',
        STEP2: 'Map CSV Data',
        STEP1_GUIDE_TEXT: 'Upload CSV file of propertys and import data.\nIf you need assistance in creating CSV file, please download a sample.',
        STEP2_GUIDE_TEXT: 'Map CSV data with Aglive format. Import will only copy mapped data from CSV and skips un-mapped data. If you want to automate mapping, then use the same name of data in CSV file or refer sample CSV file from below link.'
    },
    'IMPORT-DECEASED': {
        TITLE: 'Import Deceased',
        DESCRIPTION: 'Import Deceased',
        STEP1: 'Upload CSV',
        STEP2: 'Map CSV Data',
        STEP1_GUIDE_TEXT: 'Upload CSV file of deceased livestock and import data.\nIf you need assistance in creating CSV file, please download a sample.',
        STEP2_GUIDE_TEXT: 'Map CSV data with Aglive format. Import will only copy mapped data from CSV and skips un-mapped data. If you want to automate mapping, then use the same name of data in CSV file or refer sample CSV file from below link.',
        CONTROLS: {
            LIVESTOCKIDENTIFIER_PLACEHOLDER: 'Select Livetock Identifier',
            LIVESTOCKIDENTIFIER_LABEL: 'Livetock Identifier',
            LIVESTOCKIDENTIFIER_REQ_MESSAGE: 'Please select Livetock Identifier'
        }
    },
    'IMPORT-CARCASS': {
        TITLE: 'Import Carcass',
        DESCRIPTION: 'Import Carcass',
        STEP1: 'Upload CSV',
        STEP2: 'Map CSV Data',
        STEP1_GUIDE_TEXT: 'Upload CSV file of carcass livestock and import data.\nIf you need assistance in creating CSV file, please download a sample.',
        STEP2_GUIDE_TEXT: 'Map CSV data with Aglive format. Import will only copy mapped data from CSV and skips un-mapped data. If you want to automate mapping, then use the same name of data in CSV file or refer sample CSV file from below link.',
        CONTROLS: {
            LIVESTOCKIDENTIFIER_PLACEHOLDER: 'Select Livetock Identifier',
            LIVESTOCKIDENTIFIER_LABEL: 'Livetock Identifier',
            LIVESTOCKIDENTIFIER_REQ_MESSAGE: 'Please select Livetock Identifier'
        }
    }
};