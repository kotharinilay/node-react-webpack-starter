'use strict';

/*************************************
 * Common messages comes here...
 * *************************************/

module.exports = {
    COMMON: {
        SOMETHING_WRONG: 'Sorry, something went wrong. Please try again later.',
        UNAUTHORIZED: 'Un authorized user.',
        MANDATORY_DETAILS: 'Please fill all mandatory details.',
        INVALID_DETAILS: 'Invalid data value given.',
        EMAIL_FROM_REQ: 'Email from-address not specified.',
        EMAIL_TO_REQ: 'Email to-address not specified.',
        EMAIL_SUBJECT_REQ: 'Subject not specified.',
        EMAIL_MESSAG_EREQ: 'Message body not specified.',
        SELECT_ONLY_ONE: 'Please select only one record.',
        SELECT_AT_LEAST_ONE: 'Please select at least one record.',
        CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation'),

        COMPANY_PLACEHOLDER: 'Select Company',
        COMPANY_REQ_MESSAGE: 'Please select Company',
        COMPANY_LABEL: 'Company',

        REGION_PLACEHOLDER: 'Select Region',
        REGION_REQ_MESSAGE: 'Please select Region',
        REGION_LABEL: 'Region',

        BUSINESS_PLACEHOLDER: 'Select Business',
        BUSINESS_REQ_MESSAGE: 'Please select Business',
        BUSINESS_LABEL: 'Business',

        PROPERTY_PLACEHOLDER: 'Select Property',
        PROPERTY_REQ_MESSAGE: 'Please select Property',
        PROPERTY_LABEL: 'Property',

        FILTERS_LABEL: 'Filters'
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
            SUBURB:"Suburb"
        }
    }
};