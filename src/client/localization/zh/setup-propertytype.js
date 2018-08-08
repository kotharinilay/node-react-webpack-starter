'use strict';

/*************************************
 * setup PropertyType component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP PROPERTY TYPE",
        CONTROLS: {
            NEW_LABEL: "New Property Type",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Property Type",
            MODIFY_LABEL: "Modify Property Type"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Property Type(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD PROPERTY TYPE",
        MODIFY_TITLE: "MODIFY PROPERTY TYPE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            PROPERTYTYPE_LABEL: "Property Type Name",
            PROPERTYTYPE_PLACEHOLDER: "Enter Property Type Name",
            PROPERTYTYPE_REQ_MESSAGE: "Please enter Property Type Name",
            PROPERTYTYPE_CODE_LABEL: "Property Type Code",
            PROPERTYTYPE_CODE_PLACEHOLDER: "Enter Property Type Code",
            PROPERTYTYPE_CODE_REQ_MESSAGE: "Please enter Property Type Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Property Type added successfully.',
        MODIFY_SUCCESS: 'Property Type modified successfully.',
        VALIDATION: {
            1039: "Please enter Property Type Name",
            1040: "Please enter Property Type Code",
            1041: "Property Type Name should not exceed 50 characters.",
            1042: "Property Type Code should not exceed 10 characters."
        }
    }
};