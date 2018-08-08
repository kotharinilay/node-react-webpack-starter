'use strict';

/*************************************
 * setup chemical category component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP CHEMICAL CATEGORY",
        CONTROLS: {
            NEW_LABEL: "Add New",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Chemical Category",
            MODIFY_LABEL: "Modify Chemical Category"
        },
        HELP_LABEL: "Help",
        DELETE_SUCCESS: 'Chemical Category(s) deleted successfully.',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?"
    },
    DETAIL: {
        ADD_TITLE: "ADD CHEMICAL CATEGORY",
        MODIFY_TITLE: "MODIFY CHEMICAL CATEGORY",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            CHEMICALCATEGORY_LABEL: "Category Name",
            CHEMICALCATEGORY_PLACEHOLDER: "Enter Category Name",
            CHEMICALCATEGORY_REQ_MESSAGE: "Please enter Category Name",
            CHEMICALCATEGORY_CODE_LABEL: "Category Code",
            CHEMICALCATEGORY_CODE_PLACEHOLDER: "Enter Category Code",
            CHEMICALCATEGORY_CODE_REQ_MESSAGE: "Please enter Category Code",
            SYSTEM_CODE_LABEL: "System Code",
            SYSTEM_CODE_PLACEHOLDER: "Enter System Code"
        },
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Chemical Category added successfully.',
        MODIFY_SUCCESS: 'Chemical Category modified successfully.',
        VALIDATION: {
            1009: "Please enter Category Name",
            1010: "Please enter Category Code",
            1011: "Category Name should not exceed 50 characters.",
            1012: "Category Code should not exceed 10 characters."
        }
    }
};