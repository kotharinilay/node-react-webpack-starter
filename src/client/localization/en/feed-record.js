'use strict';

/*************************************
 * record feed
 * *************************************/

module.exports = {
    TITLE: "Record Feed",
    DESCRIPTION: "Allow to record feed for selected livestock and mob.",
    CONTROLS: {
        SAVE_LABEL: "Save",
        CANCEL_LABEL: "Cancel",
        SETUP_FEED_LABEL: "Feed Setup",

        FEED_PLACEHOLDER: "Select Feed",
        FEED_LABEL: "Feed",
        FEED_REQ_MESSAGE: "Please select Feed",

        ENCLOSURE_PLACEHOLDER: "Select Enclosure",
        ENCLOSURE_LABEL: "Enclosure",
        ENCLOSURE_REQ_MESSAGE: "Please select Enclosure",

        FEED_DATE_PLACEHOLDER: "Enter Date of Feed",
        FEED_DATE_LABEL: "Date of Feed",
        FEED_DATE_REQ_MESSAGE: "Please enter Date of Feed",

        QUANTITY_PLACEHOLDER: "Enter Feed Quantity",
        QUANTITY_LABEL: "Feed Quantity (Tonne)",
        QUANTITY_REQ_MESSAGE: "Please enter Feed Quantity",
        QUANTITY_EXCEEDED: "Maximum Feed Quantity is 10 tonne",

        COST_PLACEHOLDER: "Enter Cost",
        COST_LABEL: "Cost Per Tonne ($)",
        COST_REQ_MESSAGE: "Please enter Cost",
        COST_LIMIT: "Cost should be greater than zero",

        CONTRACTOR_LABEL: "Contractor’s person",

        NEXT_LABEL: "Next",
        PREVIOUS_LABEL: "Previous",
        FILTER_DDL_PLACEHOLDER: "MMM-YYYY",
        FILTER_DDL_LABEL: "Month of Feed",
        FEED_CONTACT_PLACEHOLDER: "Type to search Contact",
        FEED_CONTACT_LABEL: "Feed by Contact",

        EMAIL: 'Email',
        MOBILE: 'Mobile'
    },
    HELP_LABEL: "Help",
    SUCCESS: 'Feed recorded successfully.',
    VALIDATION: {
        1134: "Please select Feed.",
        1135: "Please select Enclosure.",
        1136: "Please enter Date of Feed.",
        1137: "Maximum Feed Quantity is 10 tonne.",
        1138: "Cost should be greater than zero."
    }
};