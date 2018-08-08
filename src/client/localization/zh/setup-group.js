'use strict';

/*************************************
 * setup group component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP GROUP",
        CONTROLS: {
            NEW_LABEL: "New Group",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Group",
            MODIFY_LABEL: "Modify Group"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Group(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        TITLE: "SETUP GROUP",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            GROUP_LABEL: "Group Name",
            GROUP_PLACEHOLDER: "Enter Group Name",
            GROUP_REQ_MESSAGE: "Please enter Group Name",
            GROUP_CODE_LABEL: "Group Code",
            GROUP_CODE_PLACEHOLDER: "Enter Group Code",
            GROUP_CODE_REQ_MESSAGE: "Please enter Group Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Group added successfully.',
        MODIFY_SUCCESS: 'Group modified successfully.',
        VALIDATION: {
            1026: "Please enter Group Name",
            1027: "Please enter Group Code",
            1028: "Group Name should not exceed 50 characters.",
            1029: "Group Code should not exceed 10 characters."
        }
    }
};