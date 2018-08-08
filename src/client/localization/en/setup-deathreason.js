'use strict';

/*************************************
 * setup Death Reason component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP DEATH REASON",
        CONTROLS: {
            NEW_LABEL: "New Death Reason",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Death Reason",
            MODIFY_LABEL: "Modify Death Reason"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Death Reason that will be available to all users',
        DELETE_SUCCESS: 'Death Reason(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD DEATH REASON",
        MODIFY_TITLE: "MODIFY DEATH REASON",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            DEATHREASON_LABEL: "Death Reason Name",
            DEATHREASON_PLACEHOLDER: "Enter Death Reason Name",
            DEATHREASON_REQ_MESSAGE: "Please enter Death Reason Name",
            DEATHREASON_CODE_LABEL: "Death Reason Code",
            DEATHREASON_CODE_PLACEHOLDER: "Enter Death Reason Code",
            DEATHREASON_CODE_REQ_MESSAGE: "Please enter Death Reason Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Update Death Reason Type Program details',
        ADD_SUCCESS: 'Death Reason added successfully.',
        MODIFY_SUCCESS: 'Death Reason modified successfully.',
        VALIDATION: {
            1013: "Please enter Death Reason Name",
            1014: "Please enter Death Reason Code",
            1015: "Death Reason Name should not exceed 50 characters.",
            1016: "Death Reason Code should not exceed 10 characters."
        }
    }
};