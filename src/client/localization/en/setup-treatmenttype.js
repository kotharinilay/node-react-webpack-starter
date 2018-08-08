'use strict';

/*************************************
 * setup Treatment Type component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP TREATMENT TYPE",
        CONTROLS: {
            NEW_LABEL: "New Treatment Type",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Treatment Type",
            MODIFY_LABEL: "Modify Treatment Type"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Treatment Type that will be available to all users',
        DELETE_SUCCESS: 'Treatment Type(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD TREATMENT TYPE",
        MODIFY_TITLE: "MODIFY TREATMENT TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            TREATMENTTYPE_LABEL: "Treatment Type Name",
            TREATMENTTYPE_PLACEHOLDER: "Enter Treatment Type Name",
            TREATMENTTYPE_REQ_MESSAGE: "Please enter Treatment Type Name",
            TREATMENTTYPE_CODE_LABEL: "Treatment Type Code",
            TREATMENTTYPE_CODE_PLACEHOLDER: "Enter Treatment Type Code",
            TREATMENTTYPE_CODE_REQ_MESSAGE: "Please enter Treatment Type Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Update Treatment Type Program details',
        ADD_SUCCESS: 'Treatment Type added successfully.',
        MODIFY_SUCCESS: 'Treatment Type modified successfully.',
        VALIDATION: {
            1060: "Please enter Treatment Type Name",
            1061: "Please enter Treatment Type Code",
            1062: "Treatment Type Name should not exceed 50 characters.",
            1063: "Treatment Type Code should not exceed 10 characters."
        }
    }
};