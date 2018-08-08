'use strict';

/*************************************
 * setup breed type component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP BREED TYPE",
        CONTROLS: {
            NEW_LABEL: "Add New",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Breed Type",
            MODIFY_LABEL: "Modify Breed Type"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: '{{deletedCount}} out of {{totalCount}} record(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD BREED TYPE",
        MODIFY_TITLE: "MODIFY BREED TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            BREEDTYPE_LABEL: "Type Name",
            BREEDTYPE_PLACEHOLDER: "Enter Type Name",
            BREEDTYPE_REQ_MESSAGE: "Please enter Type Name",
            BREEDTYPE_CODE_LABEL: "Type Code",
            BREEDTYPE_CODE_PLACEHOLDER: "Breed Type Code",
            BREEDTYPE_CODE_REQ_MESSAGE: "Please enter Type Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Breed Type added successfully.',
        MODIFY_SUCCESS: 'Breed Type modified successfully.',
        VALIDATION: {
            1005: "Please enter Type Name",
            1006: "Please enter Type Code",
            1007: "Type Name should not exceed 50 characters.",
            1008: "Type Code should not exceed 10 characters."
        }
    }
};