'use strict';

/*************************************
 * setup species type component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP SPECIES TYPE",
        CONTROLS: {
            NEW_LABEL: "New Species Type",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Species Type",
            MODIFY_LABEL: "Modify Species Type"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Species Type(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        TITLE: "SETUP SPECIES TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            SPECIESTYPE_LABEL: "Species Type Name",
            SPECIESTYPE_PLACEHOLDER: "Enter Species Type Name",
            SPECIESTYPE_REQ_MESSAGE: "Please enter Species Type Name",
            SPECIESTYPE_CODE_LABEL: "Species Type Code",
            SPECIESTYPE_CODE_PLACEHOLDER: "Enter Species Type Code",
            SPECIESTYPE_CODE_REQ_MESSAGE: "Please enter Species Type Code",
            SPECIES_PLACEHOLDER: "Select Species",
            SPECIES_REQ_MESSAGE: "Please select Species",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Species Type added successfully.',
        MODIFY_SUCCESS: 'Species Type modified successfully.',
        VALIDATION: {
            1051: "Please enter Species Type Name",
            1052: "Please enter Species Type Code",
            1053: "Species Type Name should not exceed 50 characters.",
            1054: "Species Type Code should not exceed 10 characters.",
            1055: "Please select Species."
        }
    }
};