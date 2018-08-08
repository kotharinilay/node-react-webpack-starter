'use strict';

/*************************************
 * setup maturity component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP MATURITY",
        CONTROLS: {
            NEW_LABEL: "New Maturity",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Maturity",
            MODIFY_LABEL: "Modify Maturity"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Maturity(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        TITLE: "SETUP MATURITY",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            MATURITY_LABEL: "Maturity",
            MATURITY_PLACEHOLDER: "Enter Maturity Name",
            MATURITY_REQ_MESSAGE: "Please enter Maturity Name",
            MATURITY_CODE_LABEL: "Maturity Code",
            MATURITY_CODE_PLACEHOLDER: "Enter Maturity Code",
            MATURITY_CODE_REQ_MESSAGE: "Please enter Maturity Code",
            SPECIES_PLACEHOLDER: "Select Species",
            SPECIES_REQ_MESSAGE: "Please select Species",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Maturity added successfully.',
        MODIFY_SUCCESS: 'Maturity modified successfully.',
        VALIDATION: {
            1034: "Please enter Maturity Name",
            1035: "Please enter Maturity Code",
            1036: "Maturity Name should not exceed 50 characters.",
            1037: "Maturity Code should not exceed 10 characters.",
            1038: "Please select Species."
        }
    }
};