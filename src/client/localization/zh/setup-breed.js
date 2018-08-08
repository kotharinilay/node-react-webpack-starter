'use strict';

/*************************************
 * setup breed component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP BREED",
        CONTROLS: {
            NEW_LABEL: "New Breed",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Breed",
            MODIFY_LABEL: "Modify Breed"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Breed(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD BREED",
        MODIFY_TITLE: "MODIFY BREED",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            BREED_LABEL: "Breed Name",
            BREED_PLACEHOLDER: "Enter Breed Name",
            BREED_REQ_MESSAGE: "Please enter Breed Name",
            BREED_CODE_LABEL: "Breed Code",
            BREED_CODE_PLACEHOLDER: "Enter Breed Code",
            BREED_CODE_REQ_MESSAGE: "Please enter Breed Code",
            SPECIES_PLACEHOLDER: "Select Species",
            SPECIES_REQ_MESSAGE: "Please select Species",
            BREEDTYPE_PLACEHOLDER: "Select Breed Type",
            BREEDTYPE_REQ_MESSAGE: "Please select Breed Type",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Breed added successfully.',
        MODIFY_SUCCESS: 'Breed modified successfully.',
        VALIDATION: {
            1000: "Please enter Breed Name",
            1001: "Please enter Breed Code",
            1002: "Please select Species",
            1003: "Breed Name should not exceed 50 characters.",
            1004: "Breed Code should not exceed 10 characters."
        }
    }
};