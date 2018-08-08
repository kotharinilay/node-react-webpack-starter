'use strict';

/*************************************
 * Common messages comes here...
 * *************************************/

module.exports = {
    COMMON: {
        SOMETHING_WRONG: 'Sorry, something went wrong. Please try again later.',
        UNAUTHORIZED: 'Un authorized user.',
        MANDATORY_DETAILS: 'Please fill all mandatory details.',
        RADIO_BUTTON_REQ: 'Please select any one option.',
        INVALID_DETAILS: 'Invalid data value given.',
        EMAIL_FROM_REQ: 'Email from-address not specified.',
        EMAIL_TO_REQ: 'Email to-address not specified.',
        EMAIL_SUBJECT_REQ: 'Subject not specified.',
        EMAIL_MESSAG_EREQ: 'Message body not specified.',
        SELECT_ONLY_ONE: 'Please select only one record.',
        SELECT_AT_LEAST_ONE: 'Please select at least one record.',
        SELECT_AT_LEAST_TWO: 'Please select at least two records.',
        SELECT_SAME_TYPE: 'Please select either individual livestocks or mobs.',
        SELECT_SAME_SPECIES: 'Please select same species records.',
        SELECT_ONLY_MOB: 'Operation can be performed only on Mob.',
        SELECT_ONLY_EID: 'Operation can be performed only on Individual Livestock.',
        ONLY_EID_OR_MOB: 'Please select either Mob or Individual Livestock',
        PIC_REQ: 'Please enter PIC.',
        PIC_INVALID: "Please enter valid PIC.",
        DUPLICATE_PIC: "PIC already exist.",

        SAVE: 'Save',
        CLEAR: 'Clear',
        CLOSE: 'Close',
        RESET: 'Reset',
        CANCEL: 'Cancel',
        BACK: 'Back',
        SELECT_ALL: "Select All",

        NLIS_REQ: 'NLIS Username & Password are required.',
        NLIS_VERIFIED: 'NLIS Credentials are verified successfully.',

        PIC_LPA_ACCREDITED: 'PIC is LPA accredited.',
        PIC_NOT_LPA_ACCREDITED: 'PIC is not LPA accredited.',

        CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation'),

        COMPANY_PLACEHOLDER: 'Select Company',
        COMPANY_REQ_MESSAGE: 'Please select Company',
        COMPANY_LABEL: 'Company',
        REGION_PLACEHOLDER: 'Select Region',
        REGION_REQ_MESSAGE: 'Please select Region',
        REGION_LABEL: 'Region',
        BUSINESS_PLACEHOLDER: 'Select Business Unit',
        BUSINESS_REQ_MESSAGE: 'Please select Business Unit',
        BUSINESS_LABEL: 'Business Unit',
        PROPERTY_PLACEHOLDER: 'Select Property',
        PROPERTY_REQ_MESSAGE: 'Please select Property',
        PROPERTY_LABEL: 'Property',

        BREED_PLACEHOLDER: 'Select Breed',
        BREED_LABEL: 'Breed',
        BREED_REQ_MESSAGE: 'Please select Breed',
        BREED_PERCENT_PLACEHOLDER: 'Enter Percent',
        BREED_PERCENT_REQ_MESSAGE: 'Please enter Breed Percent',

        SUBURB_PLACEHOLDER: "Enter Suburb",
        SUBURB_LABEL: "Suburb",
        STATE_PLACEHOLDER: "Enter State",
        STATE_LABEL: "State",
        POSTCODE_PLACEHOLDER: "Enter Postcode",
        POSTCODE_LABEL: "Postcode",

        FILTERS_LABEL: 'Filters',

        CHOOSE_FILE_LABEL: 'Choose File...',
        SELECT_LABEL: "Choose File",
        UPLOAD_LABEL: "Upload",
        DELETE_LABEL: "Delete",
        FILE_SELECT_VALIDATION_MESSAGE: 'Please select file to upload.',
        UPLOAD_FILE_SIZE_EXCESS_MESSAGE: "Please upload file upto 2 MB in size.",
        PICTURE_TYPE_VIOLATION_MESSAGE: "Please select image file only.",
        SIGNATURE_PAD: "SIGNATURE PAD",

        DOC_UPLOAD_SUCCESS: "Document uploaded successfully.",
        DOC_DELETE_SUCCESS: "Document deleted successfully.",

        VALIDATION: {
            1102: "Please enter PIC.",
            1103: "Please enter valid PIC.",
            1110: "PIC already exist.",
            1104: "Please select Company/Region/Business."
        }
    },
    FIND_COMPANY: {
        TITLE: "FIND COMPANY",
        CONTROLS: {
            COMPANY_NAME_HINT_TEXT: "Enter Company Name",
            COMPANY_NAME_FLOATING_TEXT: "Company Name",
            BUSINESS_NAME_HINT_TEXT: "Enter Business Name",
            BUSINESS_NAME_FLOATING_TEXT: "Business Name",
            CONTACT_NAME_HINT_TEXT: "Enter Contact Name",
            CONTACT_NAME_FLOATING_TEXT: "Contact Name",
            ABN_HINT_TEXT: "Enter ABN",
            ABN_FLOATING_TEXT: "ABN",
            ACN_HINT_TEXT: "Enter ACN",
            ACN_FLOATING_TEXT: "ACN",
            SERVICE_TYPE_HINT_TEXT: "Select Service Type",
            SUBURB_HINT_TEXT: "Type to search",
            SUBURB_FLOATING_TEXT: "Suburb",
            STATE_HINT_TEXT: "Select State",
            STATE_FLOATING_TEXT: "State",
            POSTCODE_HINT_TEXT: "Postcode",
            POSTCODE_FLOATING_TEXT: "Postcode",
            BTN_SEARCH_LABEL: "Search",
            BTN_RESET_LABEL: "Reset",
            BTN_CLOSE_LABEL: "Close"
        },
        CRITERIA_REQUIRED: "Atleast one search value is required.",
        GRID_COLUMNS: {
            ACTION: "ACTION",
            COMPANY_NAME: "Company Name",
            SHORT_CODE: "Short Code",
            SUBURB: "Suburb",
            MOBILE: "Mobile",
            EMAIL: "Email"
        }
    },
    FIND_PIC: {
        TITLE: "FIND PIC",
        CONTROLS: {
            PROPERTY_NAME_HINT_TEXT: "Enter Property Name",
            PROPERTY_NAME_FLOATING_TEXT: "Property Name",
            PIC_HINT_TEXT: "Enter PIC",
            PIC_FLOATING_TEXT: "PIC",
            COMPANY_NAME_HINT_TEXT: "Enter Company Name",
            COMPANY_NAME_FLOATING_TEXT: "Company Name",
            BUSINESS_NAME_HINT_TEXT: "Enter Business Name",
            BUSINESS_NAME_FLOATING_TEXT: "Business Name",
            CONTACT_NAME_HINT_TEXT: "Enter Contact Name",
            CONTACT_NAME_FLOATING_TEXT: "Contact Name",
            PROPERTY_TYPE_HINT_TEXT: "Select Property Type",
            SUBURB_HINT_TEXT: "Type to search",
            SUBURB_FLOATING_TEXT: "Suburb",
            STATE_HINT_TEXT: "Select State",
            STATE_FLOATING_TEXT: "State",
            POSTCODE_HINT_TEXT: "Postcode",
            POSTCODE_FLOATING_TEXT: "Postcode",
            BTN_SEARCH_LABEL: "Search",
            BTN_SEARCH_NLIS_LABEL: "Search NLIS",
            BTN_RESET_LABEL: "Reset",
            BTN_CLOSE_LABEL: "Close"
        },
        CRITERIA_REQUIRED: "Atleast one search value is required.",
        GRID_COLUMNS: {
            ACTION: "ACTION",
            PIC: "PIC",
            PROPERTY_NAME: "Property Name",
            SUBURB: "Suburb"
        }
    },
    FIND_CONTACT: {
        TITLE: "FIND CONTACT",
        CONTROLS: {
            COMPANY_NAME_HINT_TEXT: "Enter Company Name",
            COMPANY_NAME_FLOATING_TEXT: "Company Name",
            BUSINESS_NAME_HINT_TEXT: "Enter Business Name",
            BUSINESS_NAME_FLOATING_TEXT: "Business Name",
            CONTACT_NAME_HINT_TEXT: "Enter Contact Name",
            CONTACT_NAME_FLOATING_TEXT: "Contact Name",
            ABN_HINT_TEXT: "Enter ABN",
            ABN_FLOATING_TEXT: "ABN",
            ACN_HINT_TEXT: "Enter ACN",
            ACN_FLOATING_TEXT: "ACN",
            SUBURB_HINT_TEXT: "Type to search",
            SUBURB_FLOATING_TEXT: "Suburb",
            STATE_HINT_TEXT: "Select State",
            STATE_FLOATING_TEXT: "State",
            POSTCODE_HINT_TEXT: "Postcode",
            POSTCODE_FLOATING_TEXT: "Postcode",
            BTN_SEARCH_LABEL: "Search",
            BTN_RESET_LABEL: "Reset",
            BTN_CLOSE_LABEL: "Close"
        },
        CRITERIA_REQUIRED: "Atleast one search value is required.",
        GRID_COLUMNS: {
            ACTION: "ACTION",
            COMPANY_NAME: "Company Name",
            CONTACT_NAME: "Contact Name",
            SUBURB: "Suburb",
            MOBILE: "Mobile",
            EMAIL: "Email"
        }
    }
};