'use strict';

/*************************************
 * setup gender component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP GENDER",
        CONTROLS: {
            NEW_LABEL: "New Gender",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Gender",
            MODIFY_LABEL: "Modify Gender"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Gender that will be available to all users',
        DELETE_SUCCESS: 'Gender(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD GENDER",
        MODIFY_TITLE: "MODIFY GENDER",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            GENDER_LABEL: "Gender Name",
            GENDER_PLACEHOLDER: "Enter Gender Name",
            GENDER_REQ_MESSAGE: "Please enter Gender Name",
            GENDER_CODE_LABEL: "Gender Code",
            GENDER_CODE_PLACEHOLDER: "Enter Gender Code",
            GENDER_CODE_REQ_MESSAGE: "Please enter Gender Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Update Gender Program details',
        ADD_SUCCESS: 'Gender saved successfully.',
        MODIFY_SUCCESS: 'Gender modified successfully.',
        VALIDATION: {
            1022: "Please enter Gender Name",
            1023: "Please enter Gender Code",
            1024: "Gender Name should not exceed 50 characters.",
            1025: "Gender Code should not exceed 10 characters."
        }
    }
};