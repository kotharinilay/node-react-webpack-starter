'use strict';

/*************************************
 * setup chemical product component consisting 
 * display grid, details (add new / edit)
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "SETUP CHEMICAL PRODUCT",
        CONTROLS: {
            NEW_LABEL: "New Chemical Product",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            DELETE_LABEL: "Delete Chemical Product",
            MODIFY_LABEL: "Modify Chemical Product"
        },
        HELP_LABEL: "Help",
        DESCRIPTION: 'Manage Chemical Product that will be available to all users',
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        DELETE_SUCCESS: 'Chemical Product {{deletedCount}} out of {{totalCount}} record(s) deleted successfully.'
    },
    DETAIL: {
        ADD_TITLE: "ADD CHEMICAL PRODUCT",
        MODIFY_TITLE: "MODIFY CHEMICAL PRODUCT",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "CANCEL",
            HEADER_TEXT: "Some Text",
            CHEMICALPRODUCT_LABEL: "Chemical Product Name",
            CHEMICALPRODUCT_PLACEHOLDER: "Enter Chemical Product Name",
            CHEMICALPRODUCT_REQ_MESSAGE: "Please enter Chemical Product Name",
            CHEMICALPRODUCT_CODE_LABEL: "Chemical Product Code",
            CHEMICALPRODUCT_CODE_PLACEHOLDER: "Enter Chemical Product Code",
            CHEMICALPRODUCT_CODE_REQ_MESSAGE: "Please enter Chemical Product Code",
            CHEMICALPRODUCT_DISPOSALNOTES_PLACEHOLDER: "Enter Disposal Note",
            CHEMICALPRODUCT_DISPOSALNOTES_LABEL: "Disposal Note",
            CHEMICALPRODUCT_CHEMICALCATEGORY_PLACEHOLDER: "Select Chemical Category",
            CHEMICALPRODUCT_SPECIES_PLACEHOLDER: "Select Species",
        },
        ESI: {
            CONTROLS: {
                SAVE_LABEL: "Add",
                BACK_LABEL: "CANCEL",
                NEW_LABEL: "New",
                ESI_COUNTRY_PLACEHOLDER: "Select Country",
                ESI_COUNTRY_REQ_MESSAGE: "Please select Country",
                ESI_SPECIES_PLACEHOLDER: "Select Species",
                ESI_SPECIES_REQ_MESSAGE: "Please select Species",
                ESI_DAYS_LABEL: "Number of Days",
                ESI_DAYS_PLACEHOLDER: "Enter Number of Days",
                ESI_DAYS_REQ_MESSAGE: "Please Enter Number of Days"
            }
        },
        WHP: {
            CONTROLS: {
                SAVE_LABEL: "Add",
                BACK_LABEL: "CANCEL",
                NEW_LABEL: "New",
                WHP_ACTIVITY_PLACEHOLDER: "Select Chemical Product Activity",
                WHP_ACTIVITY_REQ_MESSAGE: "Please select Chemical Product Activity",
                WHP_SPECIES_PLACEHOLDER: "Select Species",
                WHP_SPECIES_REQ_MESSAGE: "Please select Species",
                WHP_DAYS_LABEL: "Number of Days",
                WHP_DAYS_PLACEHOLDER: "Enter Number of Days",
                WHP_DAYS_REQ_MESSAGE: "Please Enter Number of Days"
            }
        },
        STOCK: {
            CONTROLS: {
                SAVE_LABEL: "Add",
                BACK_LABEL: "CANCEL",
                NEW_LABEL: "New",
                FILTERNEXT: "Next",
                FILTERPREV: "Previous",
                STOCK_FILTERDROPDOWN_PLACEHOLDER: "MMM-YYYY",
                STOCK_STOCKONHAND_LABEL: "Stock on hand",
                STOCK_STOCKONHAND_PLACEHOLDER: "Enter Stock on Hand",
                STOCK_STOCKONHAND_REQ_MESSAGE: "Please Enter Stock on Hand",
                STOCK_SOHUOM_PLACEHOLDER: "Select Unit of Measure",
                STOCK_SOHUOM_REQ_MESSAGE: "Please select Unit of Measure",
                STOCK_STOCKDATE_PLACEHOLDER: "Select Stock Date",
                STOCK_STOCKDATE_LABEL: "Stock Date",
                STOCK_COST_PLACEHOLDER: "Enter Cost",
                STOCK_COST_LABEL: "Cost",
                STOCK_BATCHNO_PLACEHOLDER: "Enter Batch Number",
                STOCK_BATCHNO_LABEL: "Batch Number",
                STOCK_BATCHNO_REQ_MESSAGE: "Please enter Batch Number",
                STOCK_MANUFACTUREDATE_PLACEHOLDER: "Select Date of Manufacturing",
                STOCK_MANUFACTUREDATE_LABEL: "Date of Manufacturing",
                STOCK_USEBYDATE_PLACEHOLDER: "Select Use by Date",
                STOCK_USEBYDATE_LABEL: "Use by Date",
                STOCK_SUPPLIER_PLACEHOLDER: "Enter Supplier",
                STOCK_SUPPLIER_LABEL: "Supplier",
                STOCK_STORAGEPIC_PLACEHOLDER: "Storage PIC"
            },
            STOCK_DUPLICATE_BATCHNUMBER: "Duplicate Batch Number is not allowed.",
            STOCK_EXPIRYDATE_VALIDATION: "Manufacturing date cannot be after Expiry date."
        },
        CHEMICAL_PRODUCT_TAB_LABEL: 'Chemical Product',
        STOCK_TAB_LABEL: 'Stock',
        ESI_TAB_LABEL: 'ESI',
        WHP_TAB_LABEL: 'WHP',
        DESCRIPTION: 'Update Chemical Product Type Program details',
        HELP_LABEL: "Help",
        ADD_SUCCESS: 'Chemical Product added successfully.',
        MODIFY_SUCCESS: 'Chemical Product modified successfully.',
        VALIDATION: {
            1083: "Please enter Chemical Product Name.",
            1084: "Please enter Chemical Product Code.",
            1085: "Please select Species.",
            1086: "Chemical Product Name should not exceed 50 characters.",
            1087: "Chemical Product Code should not exceed 20 characters.",
            1088: "Please select Country.",
            1089: "Please enter Number of Days.",
            1090: "Please select Chemical Activity.",
            1091: "Please enter Stock On Hand.",
            1092: "Please select Unit of Measure.",
            1093: "Please enter Batch Number.",
            1094: "Batch Number should not exceed 20 characters."
        }
    }
};