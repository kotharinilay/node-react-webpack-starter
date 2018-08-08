'use strict';

/*************************************
 * setup species component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP SPECIES",
        CONTROLS: {
            NEW_LABEL: "New Species",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Species",
            MODIFY_LABEL: "Modify Species"
        },
        HELP_LABEL: "Help",
        SUCCESS: 'Configuration updated successfully.',
        DELETE_VALIDATION_MESSAGE: "Please select record to delete.",
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        MODIFY_VALIDATION_MESSAGE: "Please select only one record to modify.",
        DELETE_SUCCESS: 'Species {{deletedCount}} out of {{totalCount}} record(s) deleted successfully.'
    },
    DETAIL: {
        TITLE: "SETUP SPECIES",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            SPECIES_LABEL: "Species Name",
            SPECIES_PLACEHOLDER: "Enter Species Name",
            SPECIES_REQ_MESSAGE: "Please enter Species Name",
            SPECIES_CODE_LABEL: "Species Code",
            SPECIES_CODE_PLACEHOLDER: "Enter Species Code",
            SPECIES_CODE_REQ_MESSAGE: "Please enter Species Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code",
            UPLOAD_LABEL: "Upload",
            DELETE_LABEL: "Delete"
        },
        SPECIES_PICTURE_LABEL: "Species Icon",
        MOB_PICTURE_LABEL: "Mob Icon",
        INDIVIDUAL_PICTURE_LABEL: "Individual Icon",
        PICTURE_SIZE_LIMIT_TEXT: "Upload icon file upto 2 MB in size.",
        HELP_LABEL: "Help",
        SUCCESS: 'Species saved successfully.',
        ERROR: 'Error while saving Species.',
        PICTURE_SIZE_EXCESS_MESSAGE: "Please upload icon file upto 2 MB in size.",
        PICTURE_TYPE_VIOLATION_MESSAGE: "Please select image file only.",
        PICTURE_UPLOAD_ERROR: "Error while upload image.",
        PICTURE_DELETE_SUCCESS: "Picture deleted successfully.",
        VALIDATION: {
            1047: "Please enter Species Name",
            1048: "Please enter Species Code",
            1049: "Species Name should not exceed 50 characters.",
            1050: "Species Code should not exceed 10 characters."
        }
    }
};