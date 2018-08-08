'use strict';

/*************************************
 * setup enclosure type component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP ENCLOSURE TYPE",
        CONTROLS: {
            NEW_LABEL: "New Enclosure Type",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Enclosure Type",
            MODIFY_LABEL: "Modify Enclosure Type"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Enclosure Type(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD ENCLOSURE TYPE",
        MODIFY_TITLE: "MODIFY ENCLOSURE TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            ENCLOSURETYPE_LABEL: "Enclosure Type Name",
            ENCLOSURETYPE_PLACEHOLDER: "Enter Enclosure Type Name",
            ENCLOSURETYPE_REQ_MESSAGE: "Please enter Enclosure Type Name",
            ENCLOSURETYPE_CODE_LABEL: "Enclosure Type Code",
            ENCLOSURETYPE_CODE_PLACEHOLDER: "Enter Enclosure Type Code",
            ENCLOSURETYPE_CODE_REQ_MESSAGE: "Please enter Enclosure Type Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Enclosure Type added successfully.',
        MODIFY_SUCCESS: 'Enclosure Type modified successfully.',
        VALIDATION: {
            1018: "Please enter Enclosure Type Name",
            1019: "Please enter Enclosure Type Code",
            1020: "Enclosure Type Name should not exceed 50 characters.",
            1021: "Enclosure Type Code should not exceed 10 characters."
        }
    }
};