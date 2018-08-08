'use strict';

/*************************************
 * setup accreditation program component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP ACCREDITATION PROGRAM",
        CONTROLS: {
            NEW_LABEL: "New Program",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Program",
            MODIFY_LABEL: "Modify Program"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Accreditation Program(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD ACCREDITATION PROGRAM",
        MODIFY_TITLE: "MODIFY ACCREDITATION PROGRAM",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            ACCREDITATIONPROGRAM_LABEL: "Program Name",
            ACCREDITATIONPROGRAM_PLACEHOLDER: "Enter Program Name",
            ACCREDITATIONPROGRAM_REQ_MESSAGE: "Please enter Program Name",
            ACCREDITATIONPROGRAM_CODE_LABEL: "Program Code",
            ACCREDITATIONPROGRAM_CODE_PLACEHOLDER: "Enter Program Code",
            ACCREDITATIONPROGRAM_CODE_REQ_MESSAGE: "Please enter Program Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Accreditation Program added successfully.',
        MODIFY_SUCCESS: 'Accreditation Program modified successfully.',
        VALIDATION: {
            1074: "Please enter Accreditation Program Name",
            1075: "Please enter Accreditation Program Code",
            1076: "Accreditation Program Name should not exceed 50 characters.",
            1077: "Accreditation Program Code should not exceed 10 characters."
        }
    }
};