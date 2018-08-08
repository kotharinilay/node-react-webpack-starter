'use strict';

/*************************************
 * setup service type component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP SERVICE TYPE",
        CONTROLS: {
            NEW_LABEL: "New Service Type",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Service Type",
            MODIFY_LABEL: "Modify Service Type"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Service Type(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD SERVICE TYPE",
        MODIFY_TITLE: "MODIFY SERVICE TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            SERVICETYPE_LABEL: "Service Type Name",
            SERVICETYPE_PLACEHOLDER: "Enter Service Type Name",
            SERVICETYPE_REQ_MESSAGE: "Please enter Service Type Name",
            SERVICETYPE_CODE_LABEL: "Service Type Code",
            SERVICETYPE_CODE_PLACEHOLDER: "Enter Service Type Code",
            SERVICETYPE_CODE_REQ_MESSAGE: "Please enter Service Type Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Service Type added successfully.',
        MODIFY_SUCCESS: 'Service Type modified successfully.',
        VALIDATION: {
            1043: "Please enter Service Type Name",
            1044: "Please enter Service Type Code",
            1045: "Service Type Name should not exceed 50 characters.",
            1046: "Service Type Code should not exceed 10 characters."
        }
    }
};