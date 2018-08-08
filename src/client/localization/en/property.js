'use strict';

/*************************************
 * property component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "PROPERTY",
        CONTROLS: {
            FILTER_LABEL: "Filter",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            SET_PASSWORD_LABEL: "Set Password",
            ADD_PROPERTY: "Add Property",
            MODIFY_PROPERTY: "Modify Property",
            DELETE_PROPERTY: "Delete Property",
            RECORD_ENCLOSURE_SPRAY: "Record Enclosure Spray",
            SHOW_ENCLOSURE_SPRAY: "Show Enclosure Spray",
            RECORD_PASTURE_COMPOSITION: "Record Pasture Composition",
            SHOW_PASTURE_COMPOSITION: "Show Pasture Composition",
            VIEW_PASTURE_COMPOSITION: "View Pasture Composition",
            FILTER_PROPERTY_TYPE_LABEL: "Property Type",
            FILTER_PROPERTY_TYPE_PLACEHOLDER: "Select Property Type",
            FILTER_STATE_PLACEHOLDER: "State",
            FILTER_STATE_LABEL: "Select State",
            APPLY_FILTER_LABEL: "Apply",
            CLEAR_FILTER_LABEL: "Clear"
        },
        HELP_LABEL: 'Help',
        DESCRIPTION: 'Manage Properties that will be available across application.',
        SEARCH_WARNING: "Please specify atleast one search criteria.",
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        DELETE_SUCCESS: 'Property {{deletedCount}} out of {{totalCount}} record(s) deleted successfully.'

    },
    DETAIL: {
        ADD_TITLE: "Add Property",
        MODIFY_TITLE: "Modify Property",
        ADD_SUCCESS: 'Property added successfully.',
        MODIFY_SUCCESS: 'Property modified successfully.',
        INVALID_NLIS: 'Invalid NLIS username or password.',

        HELP_LABEL: 'Help',
        DESCRIPTION: 'Update property details.',

        PIC_TAB_LABEL: "PIC",
        ACCREDITATION_TAB_LABEL: "Accreditation",
        ENCLOSURE_TAB_LABEL: "Enclosure",
        MAP_TAB_LABEL: "Map",
        ACCESS_TAB_LABEL: "Access",

        ACCRED_PROGRAM_SAVE_CONFIRM: "Accreditation program changed by admin. do you want to continue with changes?",
        POPUP_CONTINUE: "Continue",
        POPUP_CANCEL: "Cancel",

        CONTROLS: {
            SAVE_LABEL: "Save",
            BACK_LABEL: "Cancel",


            PROPERTY_TYPE_PLACEHOLDER: "Property Type",
            PROPERTY_TYPE_LABEL: "Select Property Type",
            PROPERTY_TYPE_REQ_MESSAGE: "Please select Property Type",
            PIC_PLACEHOLDER: "Enter PIC",
            PIC_LABEL: "PIC",
            PIC_REQ_MESSAGE: "Please enter PIC",
            PROPERTY_PLACEHOLDER: "Enter Property Name",
            PROPERTY_LABEL: "Property Name",
            PROPERTY_REQ_MESSAGE: "Please enter Property Name",
        },
        TAB_PIC: {
            ADDRESS_PLACEHOLDER: "Enter Address",
            ADDRESS_LABEL: "Address",
            PM_PLACEHOLDER: "Select Property Manager",
            PM_LABEL: "Property Manager",
            PM_REQ_MESSAGE: "Please select Property Manager",
            APM_PLACEHOLDER: "Select Asst. Property Manager",
            APM_LABEL: "Asst. Property Manager",
            APM_REQ_MESSAGE: "Please select Asst. Property Manager",
            NLIS_PASSWORD_PLACEHOLDER: "Enter NLIS Password",
            NLIS_PASSWORD_LABEL: "NLIS Password",
            NLIS_PASSWORD_REQ_MESSAGE: "Please enter NLIS Password",
            NLIS_USERNAME_PLACEHOLDER: "Enter NLIS Username",
            NLIS_USERNAME_LABEL: "NLIS Username",
            NLIS_USERNAME_REQ_MESSAGE: "Please enter NLIS Username",
            LIVESTOCK_IDENTIFIER_PLACEHOLDER: "Select Livestock Identifier",
            LIVESTOCK_IDENTIFIER_LABEL: "Livestock Identifier",
            LIVESTOCK_IDENTIFIER_REQ_MESSAGE: "Please select Livestock Identifier",
            EXPORT_ELIGIBILITY_PLACEHOLDER: "Select Country",
            EXPORT_ELIGIBILITY_LABEL: "Export Eligibility",
            BRAND_PLACEHOLDER: "Enter Brand",
            BRAND_LABEL: "Brand",
            EARMARK_PLACEHOLDER: "Enter Earmark",
            EARMARK_LABEL: "Earmark",

            BRAND_PIC_LABEL: "Brand Picture",
            BRAND_PIC_DELETE_SUCCESS: "Brand Picture deleted successfully.",
            EARMARK_PIC_LABEL: "Logo",
            EARMARK_PIC_DELETE_SUCCESS: "Brand Picture deleted successfully.",

            SAME_MANAGER_ERROR: "Property Manager can not be same as Asst. Property Manager.",
            SAME_ASST_MANAGER_ERROR: "Asst. Property Manager can not be same as Property Manager.",
        },
        TAB_ACCREDITATION: {
            LICENSE_NUMBER_PLACEHOLDER: "Enter License Number",
            LICENSE_NUMBER_LABEL: "License Number",
            STATUS_LABEL: "Status",
            STATE_PLACEHOLDER: "Enter States",
            STATE_LABEL: "Valid for States",
            EXPIRY_DATE_PLACEHOLDER: "Enter Expiry Date",
            EXPIRY_DATE_LABEL: "Expiry Date",
            DESCRIPTION_PLACEHOLDER: "Enter Description",
            DESCRIPTION_LABEL: "Description"
        },
        TAB_ENCLOSURE: {
            ADD_LABEL: "ADD",
            SAVE_LABEL: "SAVE",
            UPDATE_LABEL: "UPDATE",
            BACK_LABEL: "CANCEL",
            ADDNEW_LABEL: "New",
            ENCLOSURE_TYPE_PLACEHOLDER: "Select Enclosure Type",
            ENCLOSURE_TYPE_LABEL: "Enclosure Type",
            ENCLOSURE_TYPE_REQ_MESSAGE: "Please select Enclosure Type",
            ENCLOSURE_NAME_PLACEHOLDER: "Enter Enclosure Name",
            ENCLOSURE_NAME_LABEL: "Enclosure Name",
            ENCLOSURE_NAME_REQ_MESSAGE: "Please enter Enclosure Name",
            DSE_PLACEHOLDER: "Enter DSE",
            DSE_LABEL: "DSE",
            DELETE_ENCLOSURE_CONFIRMATION_MESSAGE: "Are you sure you want to delete enclosure?",
            DUPLICATE_ENCLOSURE_NAME: "Enclosure Name is already exist."
        },
        TAB_MAP: {
            FULL_SCREEN_LABEL: "FULL SCREEN VIEW",
            DEFAULT_SCREEN_LABEL: "DEFAULT SCREEN VIEW",
            ACTION_LABEL: "ACTIONS",
            CHANGE_PROPERTY: "Change Property Fence",
            CHANGE_ENCLOSURE: "Change Enclosure Fence",
            MODIFY_RISK: "Modify Risk Profile",
            CANCEL_LABEL: "Cancel",
            SAVE_LABEL: "Update Fence",
            ADD_ENCLOSURE_LABEL: "ADD ENCLOSURE",
            ENCLOSURE_LABEL: "Enclosure",
            INVALID_MARKER: "Invalid marker added for area.",
            INVALID_POLYGON: "Area is not valid.",
            PROPERTY_NOT_AVAILABLE: "Property fence is not available to draw enclosure.",
            INVALID_POLYGON_TO_DELETE: "Marker can not be delete because of invalid area.",
            DELETE_ENCLOSURE_MAP_CONFIRMATION: "Are you sure you want to clear enclosure map?",
            ENCLOSURE_NOT_AVAILABLE: "Enclosure not available to draw map."
        },
        TAB_ACCESS: {

        },
        VALIDATION: {
            1105: "Please enter Name.",
            1106: "Please select Property Type.",
            1107: "Please enter NLIS Username.",
            1108: "Please enter NLIS Password.",
            1109: "Please select Livestock Identifier.",
            1111: "Please enter Enclosure Name.",
            1112: "Please select Enclosure Type.",
            1113: "Please assign users to property access.",
            1114: "Property Name should not exceed 250 characters.",
            1115: "Address should not exceed 300 characters.",
            1116: "Brand should not exceed 50 characters.",
            1117: "Earmark should not exceed 50 characters.",
            1118: "NLIS Username should not exceed 100 characters.",
            1119: "NLIS Password should not exceed 100 characters.",
            1120: "Enclosure Name should not exceed 100 characters.",
            1121: "DSE should not exceed 21 characters."
        }
    }
};