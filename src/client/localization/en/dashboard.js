'use strict';

/*************************************
 * Dashboard component consisting 
 * WidgetScreen, Configure
 * *************************************/

module.exports = {
    CONFIGURE: {
        TITLE: "CONFIGURE DASHBOARD",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL"
        },
        WIDGETS: {
            Livestock: 'Livestock',
            NVD: 'eNVDs',
            PIC: 'PIC Detail',
            Business: 'Business Stats',
            Report: 'Report'
        },
        SUCCESS: 'Configuration updated successfully.'
    },
    NOTIFICATION_BOARD: {
        TITLE: "Your Notification",
        ALL_TAB_LABEL: "All",
        UNREAD_TAB_LABEL: "Unread",
        CONTROLS: {
            FILTER_LABEL: "Filter",
            MARK_AS_READ_LABEL: "Mark as Read",
            SEARCH_PLACEHOLDER: "Type to Search",
            DELETE_LABEL: "Delete",
            SELECTALL_LABEL: "Select All",
            CLEAR_LABEL: "Clear",
            APPLY_FILTER_LABEL: "Apply",
            CLEAR_FILTER_LABEL: "Clear",
            RECEIVED_FROMDATE_PLACEHOLDER: "Recieved From Date",
            RECEIVED_TODATE_PLACEHOLDER: "Recieved To Date"
        },
        DELETE_WARNING: "Please select notification.",
        DELETE_SUCCESS: "Notification(s) deleted successfully",
        SEARCH_WARNING: "Please specify atleast one search criteria.",
        DATE_VALIDATION: "To Date must be greater than or equals to From Date."
    },
    WIDGETSCREEN: {

    }
};