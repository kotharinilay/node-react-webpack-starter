'use strict';

/*************************************
 * setup Treatment Method component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP TREATMENT METHOD",
        CONTROLS: {
            NEW_LABEL: "New Treatment Method",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Treatment Method",
            MODIFY_LABEL: "Modify Treatment Method"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Treatment Method that will be available to all users',
        DELETE_SUCCESS: 'Treatment Method(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD TREATMENT METHOD",
        MODIFY_TITLE: "MODIFY TREATMENT METHOD",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            TREATMENTMETHOD_LABEL: "Treatment Method Name",
            TREATMENTMETHOD_PLACEHOLDER: "Enter Treatment Method Name",
            TREATMENTMETHOD_REQ_MESSAGE: "Please enter Treatment Method Name",
            TREATMENTMETHOD_CODE_LABEL: "Treatment Method Code",
            TREATMENTMETHOD_CODE_PLACEHOLDER: "Enter Treatment Method Code",
            TREATMENTMETHOD_CODE_REQ_MESSAGE: "Please enter Treatment Method Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Update Treatment Method Program details',
        ADD_SUCCESS: 'Treatment Method added successfully.',
        MODIFY_SUCCESS: 'Treatment Method modified successfully.',
        VALIDATION: {
            1056: "Please enter Treatment Method Name",
            1057: "Please enter Treatment Method Code",
            1058: "Treatment Method Name should not exceed 50 characters.",
            1059: "Treatment Method Code should not exceed 10 characters."
        }
    }
};