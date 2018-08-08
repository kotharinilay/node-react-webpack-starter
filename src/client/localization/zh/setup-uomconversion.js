'use strict';

/*************************************
 * setup unit of measure component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP UNIT OF MEASURE CONVERSION",
        CONTROLS: {
            NEW_LABEL: "New Unit Coversion",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Unit Coversion",
            MODIFY_LABEL: "Modify Unit Coversion"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'UoM Conversion(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
          ADD_TITLE: "ADD UNIT CONVERSION",
        MODIFY_TITLE: "MODIFY UNIT CONVERSION",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            FROMUOM_PLACEHOLDER: "Select From Unit",
            FROMUOM_REQ_MESSAGE: "Please select From Unit",
            FROMUOM_VALUE_LABEL: "From Unit",
            FROMUOM_VALUE_PLACEHOLDER: "Enter From Unit Value",
            FROMUOM_VALUE_REQ_MESSAGE: "Please enter From Unit Value",
            TOUOM_PLACEHOLDER: "Select Target Unit",
            TOUOM_REQ_MESSAGE: "Please select Target Unit",
            TOUOM_VALUE_LABEL: "Target Unit Value",
            TOUOM_VALUE_PLACEHOLDER: "Enter Target Unit Value",
            TOUOM_VALUE_REQ_MESSAGE: "Please enter Target Unit Value"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'UoM Conversion added successfully.',
        MODIFY_SUCCESS: 'UoM Conversion modified successfully.',
        SAME_CONVERSION_UOM_ERROR: 'From UoM and Target UoM cannot be same.',
        VALIDATION: {
            1068: "Please select From Unit.",
            1069: "Please enter From Unit value.",
            1070: "Please select Target Unit.",
            1071: "Please enter Target Unit value.",
            1072: "Please enter valid From Unit value.",
            1073: "Please enter valid Target Unit value."
        }
    }
};