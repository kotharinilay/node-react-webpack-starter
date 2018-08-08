'use strict';

/*************************************
 * setup livestock colour component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP LIVESTOCK COLOUR",
        CONTROLS: {
            NEW_LABEL: "New Colour",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Colour",
            MODIFY_LABEL: "Modify Colour"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Livestock Colour that will be available to all users',
        DELETE_SUCCESS: 'Livestock colour(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD LIVESTOCK COLOUR",
        MODIFY_TITLE: "MODIFY LIVESTOCK COLOUR",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            LIVESTOCKCOLOUR_LABEL: "Colour Name",
            LIVESTOCKCOLOUR_PLACEHOLDER: "Enter Colour Name",
            LIVESTOCKCOLOUR_REQ_MESSAGE: "Please enter Colour Name",
            LIVESTOCKCOLOUR_CODE_LABEL: "Colour Code",
            LIVESTOCKCOLOUR_CODE_PLACEHOLDER: "Enter Colour Code",
            LIVESTOCKCOLOUR_CODE_REQ_MESSAGE: "Please enter Colour Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Update Livestock Colour Program details',
        ADD_SUCCESS: 'Livestock colour added successfully.',
        MODIFY_SUCCESS: 'Livestock colour modified successfully.',
        VALIDATION: {
            1030: "Please enter Livestock Colour Name",
            1031: "Please enter Livestock Colour Code",
            1032: "Livestock Colour Name should not exceed 50 characters.",
            1033: "Livestock Colour Code should not exceed 10 characters."
        }
    }
};