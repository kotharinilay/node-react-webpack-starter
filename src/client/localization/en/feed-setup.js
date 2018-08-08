'use strict';

/*************************************
 * feed component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "FEED",
        CONTROLS: {
            NEW_LABEL: "New Feed",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Feed",
            MODIFY_LABEL: "Modify Feed"
        },
        HELP_LABEL: "Help",
        SUCCESS: 'Configuration updated successfully.',
        DELETE_VALIDATION_MESSAGE: "Please select record to delete.",
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        MODIFY_VALIDATION_MESSAGE: "Please select only one record to modify.",
        DELETE_SUCCESS: 'Feed record(s) deleted successfully.'
    },
    DETAIL: {
        ADD_TITLE: "ADD FEED",
        MODIFY_TITLE: "MODIFY FEED",
        FEED_TAB_LABEL: "Feed",
        STOCK_TAB_LABEL: "Stock",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text"
        },
        HELP_LABEL: "Help",
        FEED: {
            CONTROLS: {
                ADD_LABEL: "ADD",
                SAVE_LABEL: "SAVE",
                UPDATE_LABEL: "UPDATE",
                BACK_LABEL: "CANCEL",
                ADDNEW_LABEL: "New",
                HEADER_TEXT: "Some Text",
                NAME_LABEL: "Feed Name",
                NAME_PLACEHOLDER: "Enter Feed Name",
                NAME_REQ_MESSAGE: "Please enter Feed Name",
                TYPE_LABEL: "Composition Name",
                TYPE_PLACEHOLDER: "Enter Composition Name",
                TYPE_REQ_MESSAGE: "Please enter Composition Name",
                VALUE_LABEL: "Value (%)",
                VALUE_PLACEHOLDER: "Enter Value (%)",
                VALUE_REQ_MESSAGE: "Please enter Value",
                VALUE_EXCEEDED: "Maximum Value is 100%"
            },
            DUPLICATE_FEED_NAME: "Feed Name is already exist.",
            FEED_COMPOSITION_LABEL: "FEED COMPOSITION"
        },
        STOCK: {
            CONTROLS: {
                ADD_LABEL: "ADD",
                SAVE_LABEL: "SAVE",
                UPDATE_LABEL: "UPDATE",
                BACK_LABEL: "CANCEL",
                ADDNEW_LABEL: "New",
                HEADER_TEXT: "Some Text",
                DATE_LABEL: "Stock Date",
                DATE_PLACEHOLDER: "Enter Stock Date",
                DATE_REQ_MESSAGE: "Please enter Stock Date",
                ONHAND_LABEL: "Stock On Hand (Tonne)",
                ONHAND_PLACEHOLDER: "Enter Stock On Hand (Tonne)",
                ONHAND_REQ_MESSAGE: "Please enter Stock On Hand",
                COST_LABEL: "Stock Cost",
                COST_PLACEHOLDER: "Enter Stock Cost",
                COST_REQ_MESSAGE: "Please enter Stock Cost"
            },
            DELETE_STOCK_CONFIRMATION_MESSAGE: "Are you sure you want to delete stock?"
        },
        ADD_SUCCESS: 'Feed added successfully.',
        MODIFY_SUCCESS: 'Feed modified successfully.',
        VALIDATION: {
            1079: "Please enter Feed Name",
            1080: "Please select company for Feed",
            1082: "Feed Name should not exceed 50 characters."
        }
    }
};