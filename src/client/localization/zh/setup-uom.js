'use strict';

/*************************************
 * setup unit of measure component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP UNIT OF MEASURE",
        CONTROLS: {
            NEW_LABEL: "New Unit",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Unit",
            MODIFY_LABEL: "Modify Unit"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Unit of Measure {{deletedCount}} out of {{totalCount}} record(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD UNIT OF MEASURE",
        MODIFY_TITLE: "MODIFY UNIT OF MEASURE",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            UOM_LABEL: "Unit Name",
            UOM_PLACEHOLDER: "Enter Unit Name",
            UOM_REQ_MESSAGE: "Please enter Unit Name",
            UOM_CODE_LABEL: "Unit Code",
            UOM_CODE_PLACEHOLDER: "Enter Unit Code",
            UOM_CODE_REQ_MESSAGE: "Please enter Unit Code",
            UOM_TYPE_PLACEHOLDER: "Select UoM Type",
            UOM_TYPE_REQ_MESSAGE: "Please select UoM Type",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code",
            SYSTEM_CODE_REQ_MESSAGE: "Please enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Unit of Measure added successfully.',
        MODIFY_SUCCESS: 'Unit of Measure modified successfully.',
        VALIDATION: {
            1064: "Please enter Unit Name",
            1065: "Please enter Unit Code",
            1078: "Please select UoM Type",
            1066: "Unit Name should not exceed 50 characters.",
            1067: "Unit Code should not exceed 10 characters."
        }
    }
};