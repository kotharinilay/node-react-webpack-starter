'use strict';

/*************************************
 * livestock sub pages
 * *************************************/

module.exports = {
    'SHOW-TAGS': {
        CONTROLS: {
            ACTIVATE_LABEL: "Activate Tags",
            FILTER_LABEL: "Filter",
            APPLY_FILTER_LABEL: "Apply",
            CLEAR_FILTER_LABEL: "Clear",
            SEARCH_PLACEHOLDER: "Type to search",
            ISSUE_FROMDATE_PLACEHOLDER: "Issue From Date",
            ISSUE_TODATE_PLACEHOLDER: "Issue To Date",
            TAGYEAR_MUST_CHAR_MESSAGE: "Tag Year must be 4 characters."
        },
        TITLE: "Show tags",
        DESCRIPTION: "Your tag inventory. You can start activating tags through induction process.",
        HELP_LABEL: "Help",
        SEARCH_WARNING: "Please specify atleast one search criteria.",
        FILTER_CORRECT_MESSAGE: "Please correct the errors.",
        SAME_SPECIES_VALIDATION_MESSAGE: "Please select tags with same species to activate.",
        INVALID_STATUS_MESSAGE: "Please select tags with Pending status.",
        SELECT_TAG_VALIDATION_MESSAGE: "Please select atleast one tag to activate."

    },
    'ACTIVATE-TAGS': {
        TITLE: 'Activate Tags',
        PRIMARY_TAB_TITLE: 'Induction Attributes',
        OTHER_TAB_TITLE: 'Other Attributes',
        CONTROLS: {

        },
        TABS: require('./induction-tabs'),
        ACTIVATE_SUCCESS: 'Tag(s) activated successfully.'
    },
    'RECORD-DECEASED': {
        TITLE: 'Record Deceased',
        DESCRIPTION: 'Allow to record deceased livestock or mob.',
        HELP_LABEL: 'Help',
        CONTROLS: {
            RESET_LABEL: 'Reset',
            CANCEL_LABEL: 'Cancel',
            SAVE_LABEL: 'Save',
            SAVE_NLIS_LABEL: 'Save & Update to NLIS',
            DECEASED_DATE_LABEL: 'Date of Deceased',
            DECEASED_DATE_REQ_MESSAGE: 'Date of Deceased is required.',
            DISPOSAL_METHOD_REQ_MESSAGE: 'Disposal Method is required.',
            DISPOSAL_METHOD_LABEL: 'Disposal Method',
            DISPOSAL_METHOD_PLACEHOLDER: 'Select Disposal Method',
            NUMBER_OF_LIVESTOCK_HINT: 'Livestock Count',
            NUMBER_OF_LIVESTOCK_FLOATING: 'Livestock Count',
            NUMBER_OF_LIVESTOCK_REQ_MESSAGE: 'Livestock Count is required.',
            DEATH_REASON_HINT: 'Death Reason',
            DEATH_REASON_FLOATING: 'Death Reason',
            EVENTGPS_PLACEHOLDER: 'Event At Gps',
            EVENTGPS_LABEL: 'Event At Gps'
        },
        CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation'),
        POST_NLIS_CONFIRMATION_MESSAGE: '{X} out of {T} does not have EID which will be ignored for posting. Are you sure to continue?',
        ZERO_LIVESTOCK_COUNT: 'Atleast one livestock count is required.',
        MORE_LIVESTOCK_COUNT: 'Livestock Count cannot be greater than actual count.',
        SUCCESS_MESSAGE: 'Livestocks updated successfully to deceased.'
    },
    'SHOW-FEED-HISTORY': {
        TITLE: 'Feed History',
        DESCRIPTION: 'Shows livestock’s fed from birth to till date.',
        HELP_LABEL: 'Help',
        CONTROLS: {
            EID_HINT: 'EID',
            NLISID_HINT: 'NLIS ID',
            VISUALTAG_HINT: 'Visual Tag',
            SOCIETYID_HINT: 'Society Id',
            MOB_HINT: 'Mob Name',
            ENCLOSURE_HINT: 'Enclosure',
            SPECIES_HINT: 'Species',
            CANCEL_LABEL: 'Cancel',
            VIEW_LABEL: 'View',
            EXPORT_LABEL: 'Export to CSV'
        },
        NO_HISTORY_MESSAGE: 'No Feed history found to export.'
    },
    'SHOW-TREAT-HISTORY': {
        TITLE: 'Treat History',
        DESCRIPTION: 'Shows all treatment of livestock from birth to till date.',
        HELP_LABEL: 'Help',
    },
    'SHOW-WEIGHT-HISTORY': {
        TITLE: 'Weight History',
        DESCRIPTION: 'Shows weigh history starting from birth to till date.',
        HELP_LABEL: 'Help',
        CONTROLS: {
            EID_HINT: 'EID',
            NLISID_HINT: 'NLIS ID',
            VISUALTAG_HINT: 'Visual Tag',
            SOCIETYID_HINT: 'Society Id',
            MOB_HINT: 'Mob Name',
            ENCLOSURE_HINT: 'Enclosure',
            SPECIES_HINT: 'Species',
            BIRTHWEIGHT_HINT: 'Birth Weight',
            CURRENTWEIGHT_HINT: 'Current Weight',
            GAIN_HINT: 'Gain since Birth',
            ENTRYWEIGHT_HINT: 'Weight on Entry',
            ENTRYGAIN_HINT: 'Gain since Entry',
            EXITWEIGHT_HINT: 'Weight on Exit',
            EXITGAIN_HINT: 'Gain on Exit',
            ENTRYDATE_HINT: 'Date of Entry',
            EXITDATE_HINT: 'Date of Exit',
            CANCEL_LABEL: 'Cancel'
        }
    },
    'SHOW-TRACEBILITY': {
        TITLE: 'Tracebility',
        DESCRIPTION: 'Shows all events that livestock gone through from birth till death or kill. ',
        HELP_LABEL: 'Help',
        CONTROLS: {
            EID_HINT: 'EID',
            NLISID_HINT: 'NLIS ID',
            VISUALTAG_HINT: 'Visual Tag',
            SOCIETYID_HINT: 'Society Id',
            MOB_HINT: 'Mob Name',
            ENCLOSURE_HINT: 'Enclosure',
            SPECIES_HINT: 'Species',
            SIRE_HINT: 'Sire',
            DAM_HINT: 'Dam',
            CANCEL_LABEL: 'Cancel',
            VIEW_LABEL: 'View',
            EXPORT_LABEL: 'Export to CSV'
        },
        NO_HISTORY_MESSAGE: 'No Tracebility history found to export.'
    },
    'RECORD-SCAN': {
        TITLE: 'Scan',
        DESCRIPTION: 'Allows to record result of scanning session.',
        HELP_LABEL: 'Help',
        CONTROLS: {
            RESET_LABEL: 'Reset',
            SAVE_LABEL: 'Save',
            CANCEL_LABEL: 'Cancel',
            RESULT_TAB_TITLE: 'Scan Result',
            LIVESTOCK_TAB_TITLE: 'Livestock'
        },
        RESULT_TAB_TITLE: 'Scan Result',
        LIVESTOCK_TAB_TITLE: 'Livestock',
        SUCCESS_MESSAGE: 'Scan result recorded successfully.',
        SCAN_PIC_REQUIRE_MSG: 'Scan On PIC is required.',
        TABS: {
            'RESULT-TAB': {
                PROPERTY_BAR: {
                    NA123456: 'NA123456',
                    PROPERTY_NAME_TEXT: 'Demo property',
                    PRODUCER_TEXT: 'Demo Producer Property, Tyab, VIC',
                    SEARCH_BUTTON_LABEL: 'Advance search',
                    PIC_SERACH_PLACE_HOLDER: 'Type PIC and Search',
                    NO_PROPERTY: 'No Property Available'
                },
                CONTROLS: {
                    SCANPURPOSE_PLACEHOLDER: "Select Scan Purpose",
                    SCANPURPOSE_LABEL: 'Scan Purpose',
                    SCAN_DATE: 'Date of Scan',
                    SCAN_DATE_REQ_MESSAGE: 'Date of Scan is required.',
                    LACTATION_LABEL: 'Lactation',
                    LACTATION_PLACEHOLDER: 'Select Lactation',
                    PREGNANCY_RESULT_HINT: 'Pregnancy Result',
                    PREGNANCY_RESULT_FLOATING: 'Pregnancy Result',
                    PREGNANCY_DAYS_HINT: 'Pregnancy Due (in days)',
                    PREGNANCY_DAYS_FLOATING: 'Pregnancy Due (in days)',
                    EXP_PREG_DATE: 'Expected Pregnancy Date',
                    CONCEPTION_METHOD_PLACEHOLDER: 'Select Conception Method',
                    CONCEPTION_METHOD_LABEL: 'Conception Method',
                    CONDITION_SCORE_PLACEHOLDER: 'Select Condition Score',
                    CONDITION_SCORE_LABEL: 'Condition Score',
                    DENTITION_PLACEHOLDER: 'Select Dentition',
                    DENTITION_LABEL: 'Dentition',
                    DECISION_HINT: 'Decision',
                    DECISION_FLOATING: 'Decision',
                    PROCESSING_SESSION_HINT: 'Processing Session',
                    PROCESSING_SESSION_FLOATING: 'Processing Session',
                    WEIGHING_CATEGORY_HINT: 'Weighing Category',
                    WEIGHING_CATEGORY_FLOATING: 'Weighing Category',
                    DISEASE_HINT: 'Disease',
                    DISEASE_FLOATING: 'Disease',
                    WEIGHT_HINT: 'Weight (KG)',
                    WEIGHT_FLOATING: 'Weight (KG)',
                    APPRAISAL_HINT: 'Appraisal',
                    APPRAISAL_FLOATING: 'Appraisal',
                    STOMUCH_CONTENT_HINT: 'Stomach Content',
                    STOMUCH_CONTENT_FLOATING: 'Stomach Content',
                    SCAN_COST_HINT: 'Scan Cost ($)',
                    SCAN_COST_FLOATING: 'Scan Cost ($)',
                    PIC_PLACEHOLDER: 'Type to search PIC',
                    PIC_FLOATING: 'Scan on PIC',
                    COMPANYNAME_PLACEHOLDER: 'Type to search Company',
                    COMPANYNAME_FLOATING: 'Scan By Company',
                    SCANPERSON_PLACEHOLDER: 'Select Person',
                    SCANPERSON_LABEL: 'Scan By Person',
                    SCANPERSON_REQ_MESSAGE: 'Scan By Person is required.',
                    ADMINISTER_PERSON_HINT: 'Administer By Person',
                    ADMINISTER_PERSON_FLOATING: 'Administer By Person',
                    MATURITY_PLACEHOLDER: 'Select Maturity',
                    MATURITY_LABEL: 'Maturity',
                    EVENTGPS_PLACEHOLDER: 'Event At Gps',
                    EVENTGPS_LABEL: 'Event At Gps'
                }
            },
            'LIVESTOCK-TAB': {
                CONTROLS: {
                    CURRENT_WEIGHT_FLOATING: 'Current Weight (KG)',
                    CURRENT_WEIGHT_HINT: 'Current Weight (KG)',
                    NUMBER_OF_MOB_HINT: 'Number Of Mob(s)',
                    NUMBER_OF_MOB_FLOATING: 'Number Of Mob(s)',
                    NUMBER_OF_LIVESTOCK_HINT: 'Number Of Livestock',
                    NUMBER_OF_LIVESTOCK_FLOATING: 'Number Of Livestock'
                }
            }
        }
    },
    'MOVE-TO-ENCLOSURE': {
        TITLE: 'Move to Enclosure',
        DESCRIPTION: 'Allows selected livestock or mob to move into enclosure.',
        HELP_LABEL: 'Help',
        CONTROLS: {
            NUMBER_OF_LIVESTOCK: 'Number of Livestock',
            NUMBER_OF_MOB: 'Number of Mob(s)',
            WEIGHT: 'Total Current Weight',
            MOVEMENT_DATE: 'Date of Movement',
            RESET_LABEL: 'Reset',
            SAVE_LABEL: 'Save',
            CANCEL_LABEL: 'Cancel',
            ENCLOSURE_TYPE_PLACEHOLDER: 'Select Enclosure Type',
            ENCLOSURE_TYPE_LABEL: 'Enclosure Type',
            ENCLOSURE_NAME_PLACEHOLDER: 'Select Enclosure Name',
            ENCLOSURE_NAME_LABEL: 'Enclosure Name',
            MOVEMENT_DATE_REQ_MESSAGE: 'Date of Movement is required.',
            ENCLOSURE_TYPE_REQ_MESSAGE: 'Enclosure Type is required.',
            ENCLOSURE_NAME_REQ_MESSAGE: 'Enclosure Name is required.',
            EVENTGPS_PLACEHOLDER: 'Event At Gps',
            EVENTGPS_LABEL: 'Event At Gps'
        },
        NO_LIVESTOCK_AVAILABLE: "No livestock is availble to perform movement.",
        SUCCESS_MESSAGE: 'Enclosure Movement updated successfully.'
    },
    'DISPLAY': {
        CONTROLS: {
            SELECTALL_LABEL: "Select All",
            CLEAR_LABEL: "Clear",
            ACTIVATE_LABEL: "Activity",
            FILTER_LABEL: "Filter",
            ACTIONS_LABEL: "Livestock",
            APPLY_FILTER_LABEL: "Apply",
            CLEAR_FILTER_LABEL: "Clear",
            CLEAR_FILTER_LABEL1: "Clear Filter",

            ACTIVITY_STATUS_TEXT: "Activity Status",
            ACTIVITY_STATUS_PLACEHOLDER: "Select Activity Status",
            SPECIES_TEXT: "Species",
            SPECIES_PLACEHOLDER: "Select Species",
            BREED_TEXT: "Breed",
            BREED_PLACEHOLDER: "Select Breed",
            SPECIES_TYPE_TEXT: "Species Type",
            SPECIES_TYPE_PLACEHOLDER: "Select Species Type",
            MATURITY_TEXT: "Maturity",
            MATURITY_PLACEHOLDER: "Select Maturity",
            GENDER_TEXT: "Gender",
            GENDER_PLACEHOLDER: "Select Gender",
            CATEGORY_TEXT: "Category",
            CATEGORY_PLACEHOLDER: "Select Category",
            ENCLOSURE_TEXT: "Enclosure",
            ENCLOSURE_PLACEHOLDER: "Select Enclosure",
            LIVESTOCK_ORIGIN_TEXT: "Livestock Origin",
            LIVESTOCK_ORIGIN_PLACEHOLDER: "Select Livestock Origin",
            FINANCIER_OWNED_LABEL: "Financier Owned Livestock",
            DROP_BIRTH_YEAR_TEXT: "Drop/Birth Year",
            DROP_BIRTH_YEAR_PLACEHOLDER: "Enter Drop/Birth Year",
            LT_STATUS_TEXT: "LT Status",
            EU_STATUS_TEXT: "EU Status",
            YEAR_MUST_CHAR_MESSAGE: "Year must be 4 characters."
        },
        TITLE: "Livestock",
        DESCRIPTION: "Displays your livestock for selected PIC. Choose one or more livestock to perform common activities.",
        HELP_LABEL: "Help",
        SEARCH_WARNING: "Please specify atleast one search criteria.",
        FILTER_CORRECT_MESSAGE: "Please correct the errors.",
        MAP_NOT_EXIST: "Livestock location is not exist.",
        SELECT_MOB_TO_SPLIT: "Select only mob to split.",
        INVALID_MOB_TO_SPLIT: "Selected mob is not valid to split.",
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        DELETE_SUCCESS: 'Livestock {{deletedCount}} out of {{totalCount}} record(s) deleted successfully.',
        INVALID_RECORD_LOST_STATUS: 'Record lost action cannot apply to deceased/killed/lost livestock.',
        ALLOW_ONLY_AVAILABLE_STATUS: 'Please select available livestock(s).',
        INVALID_RECORD_CARCASS_STATUS: 'Record lost action cannot apply to deceased/killed livestock.',
        'RECORD-LOST-TAGS': {
            TITLE: 'Record Lost Tags',
            CONTROLS: {
                NUMBER_OF_LIVESTOCK: 'Number of Livestock',
                NUMBER_OF_MOB: 'Number of Mob(s)',
                CANCEL_LABEL: 'Cancel',
                SAVE_LABEL: 'Save',
                LOST_DATE_PLACEHOLDER: 'Select Lost Date',
                LOST_DATE_LABEL: 'Lost Date',
                LOST_DATE_REQ_MESSAGE: 'Please select Lost Date',
                LOST_REASON_PLACEHOLDER: 'Enter Lost Reason',
                LOST_REASON_LABEL: 'Lost Reason',
                LOST_REASON_REQ_MESSAGE: 'Please enter lost reason'
            },
            SUCCESS_MESSAGE: 'Record lost tags successfully.'
        },
        'RECORD-TAG-REPLACEMENT': {
            TITLE: 'Record Tag Replacement',
            CONTROLS: {
                CANCEL_LABEL: 'Close',
                SAVE_LABEL: 'Save',
                SAVE_NLIS_LABEL: 'Save & Submit to NLIS',
                REPLACE_DATE_PLACEHOLDER: 'Replacement Date',
                REPLACE_DATE_LABEL: 'Replacement Date',
                REPLACE_DATE_REQ_MESSAGE: 'Please select Replacement Date',
                REPLACE_REASON_PLACEHOLDER: 'Enter Replacement Reason',
                REPLACE_REASON_LABEL: 'Replacement Reason',
                REPLACE_REASON_REQ_MESSAGE: 'Please enter Replacement Reason',
                LIVESTOCKIDENTIFIER_PLACEHOLDER: "Select Livestock Identifier",
                LIVESTOCKIDENTIFIER_LABEL: "Livestock Identifier",
                LIVESTOCKIDENTIFIER_REQ_MESSAGE: "Please select Livestock Identifier",
                IDENTIFIER_PLACEHOLDER: 'Enter ',
                IDENTIFIER_REQ_MESSAGE: 'Please Enter ',
                INVALID_EID: 'Please enter valid EID',
                INVALID_NLISID: 'Please enter valid NLIS ID'
            },
            INVALID_IDENTIFIER_VALUE: 'Tag already assigned to other livestock.',
            SUCCESS_MESSAGE: 'Record tag replacement successfully.'
        }
    },
    'EXPORT-LIVESTOCK': {
        CONTROLS: {
            EXPORT_LABEL: "Export",
            CANCEL_LABEL: "Cancel",
            RESET_LABEL: "Reset"
        },
        TITLE: "Export Livestock",
        SUCCESS: "Livestock exported successfully."
    },
    'LIVESTOCK-DETAIL': {
        ADD_TITLE: "New Livestock",
        MODIFY_TITLE: "Modify Livestock",
        PRIMARY_TAB_TITLE: 'Induction Attributes',
        OTHER_TAB_TITLE: 'Other Attributes',
        TABS: require('./induction-tabs'),
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            CANCEL_LABEL: "Cancel",
            RESET_LABEL: "Reset",
            INDIVIDUAL_LIVESTOCK_LABEL: 'Individual Livestock',
            MOB_LABEL: 'Mob'
        },
        SAME_PIC_VALIDATION_MESSAGE: 'This livestock already exists on your PIC. You cannot create new livestock with this identity .',
        SAVE_SUCCESS_MESSAGE: 'Livestock saved successfully.',
        DUPLICATE_EID: {
            TITLE: 'EID already activate',
            CONTROLS: {
                YES_LABEL: 'Yes, this is on my PIC',
                CANCEL_LABEL: 'No, this is mistake',
                SUBMIT_LABEL: "Save",
                NVD_NUMBER_LABEL: 'Enter NVD Number',
                NVD_NUMBER_PLACEHOLDER: 'NVD Number',
                NVD_NUMBER_REQ_MESSAGE: 'Please enter NVD Number',
                TRANSACTION_DATE_PLACEHOLDER: 'Select Date of Transaction',
                TRANSACTION_DATE_LABEL: 'Date of Transaction',
                TRANSACTION_DATE_REQ_MESSAGE: 'Please enter Transaction Date'
            },
            SUCCESS_MESSAGE: 'Livestock transfer successfully from PIC {{origin}} to PIC {{destination}}.'
        },
        VALIDATION: {
            1132: "Invalid activity status code.",

        }
    },
    'SPLIT-MOB': {
        CONTROLS: {
            ADD_MOB_TO_SPLIT_LABEL: "Add Mob to Split",
            REMOVE_SPLIT_LABEL: "Remove Split",
            SAVE_LABEL: "Save",
            RESET_LABEL: "Reset",
            CANCEL_LABEL: "Cancel",

            MOB_PLACEHOLDER: 'Mob',
            MOB_LABEL: 'Selected Mob for Split',
            LIVESTOCKQUANTITY_PLACEHOLDER: 'Enter Livestock Quantity',
            LIVESTOCKQUANTITY_LABEL: 'Livestock Quantity',
            LIVESTOCK_WEIGHT_PLACEHOLDER: 'Enter Livestock Weight',
            LIVESTOCK_WEIGHT_LABEL: 'Livestock Weight (KG)',
            SPLIT_DATE_PLACEHOLDER: 'Select Date of Split',
            SPLIT_DATE_LABEL: 'Date of Split',
            INDUCTIONGPS_PLACEHOLDER: 'Enter Induction GPS',
            INDUCTIONGPS_LABEL: 'Induction GPS',

            NEW_MOB_PLACEHOLDER: 'Enter Mob Name',
            NEW_MOB_LABEL: 'New Mob Name',

            ENCLOSURE_TYPE_PLACEHOLDER: 'Select Enclosure Type',
            ENCLOSURE_TYPE_LABEL: 'Enclosure Type',
            ENCLOSURE_NAME_PLACEHOLDER: 'Select Enclosure Name',
            ENCLOSURE_NAME_LABEL: 'Enclosure Name',

            MOB_REQ_MESSAGE: 'Please enter Mob Name',
            REQ_QUANTITY: 'Please enter Livestock Quantity',
            INVALID_QUANTITY: 'Invalid Livestock Quantity',
            EXCEEDED_QUANTITY: 'Livestock Quantity exceeded'
        },
        TITLE: "Split Mob",
        DESCRIPTION: "Allows to split existing mob into two.",
        HELP_LABEL: "Help",
        RESULT_MOB_LABEL: "Result Mob",
        EXCEEDED_SPLIT_MOB: 'Split Mob limit exceeded.',
        LIVESTOCK_QTY_NOT_MATCH: 'Total of Livestock Quantity is not match.',
        SUCCESS: "Mob splitted successfully."
    },
    'MERGE-MOB': {
        CONTROLS: {
            SAVE_LABEL: "Save",
            RESET_LABEL: "Reset",
            CANCEL_LABEL: "Cancel",

            SPLIT_DATE_PLACEHOLDER: 'Select Date of Split',
            SPLIT_DATE_LABEL: 'Date of Split',

            ENCLOSURE_TYPE_PLACEHOLDER: 'Select Enclosure Type',
            ENCLOSURE_TYPE_LABEL: 'Enclosure Type',
            ENCLOSURE_NAME_PLACEHOLDER: 'Select Enclosure Name',
            ENCLOSURE_NAME_LABEL: 'Enclosure Name',

            MOB_REQ_MESSAGE: 'Please enter Mob Name'
        },
        TAB_SELECTED_MOB: {
            MOB_PLACEHOLDER: 'Enter Mob',
            MOB_LABEL: 'Mob',
            QUANTITY_PLACEHOLDER: 'Enter Quantity',
            QUANTITY_LABEL: 'Quantity',
            WEIGHT_PLACEHOLDER: 'Enter Weight',
            WEIGHT_LABEL: 'Weight (KG)',
            UNSELECT_LABEL: 'Unselect Mob',
            REQ_AT_LEAST_TWO: 'At least two records required for merge.'
        },
        TAB_RESULT_MOB: {
            MOB_PLACEHOLDER: 'Enter Result Mob',
            MOB_LABEL: 'Result Mob',
            MOB_REQ_MESSAGE: "Please enter Result Mob",
            QUANTITY_PLACEHOLDER: 'Result Quantity',
            QUANTITY_LABEL: 'Quantity',
            WEIGHT_PLACEHOLDER: 'Result Weight',
            WEIGHT_LABEL: 'Weight (KG)',
            MERGE_DATE_PLACEHOLDER: 'Select Date of Merge',
            MERGE_DATE_LABEL: 'Date of Merge',
            ENCLOSURE_TYPE_PLACEHOLDER: 'Select Enclosure Type',
            ENCLOSURE_TYPE_LABEL: 'Enclosure Type',
            ENCLOSURE_NAME_PLACEHOLDER: 'Select Enclosure Name',
            ENCLOSURE_NAME_LABEL: 'Enclosure Name'
        },
        TAB_RESULT_MOB_ATTR: {
            PRIMARY_TAB_TITLE: 'Primary Attributes',
            OTHER_TAB_TITLE: 'Other Attributes'
        },
        TABS: require('./induction-tabs'),
        TAB_SELECTED_MOB_LABEL: "Selected Mob(s)",
        TAB_RESULT_MOB_LABEL: "Result Mob",
        TAB_RESULT_MOB_ATTR_LABEL: "Result Mob Attributes",

        TITLE: "Merge Mob",
        DESCRIPTION: "Allows to merge more than one mobs into one.",
        HELP_LABEL: "Help",
        SUCCESS: "Mob merged successfully.",
        VERIFY_ATTRIBUTES: "Please verify attributes before you proceed."
    },
    'RECORD-CARCASS': {
        TITLE: 'Record Carcass',
        CONTROLS: {
            SAVE_LABEL: 'Save',
            SAVE_NLIS_LABEL: 'Save & Submit to NLIS',
            CANCEL_LABEL: 'Cancel',
            RESET_LABEL: 'Reset',
            CARCASS_TAB_TITLE: 'Carcass',
            LIVESTOCK_TAB_TITLE: 'Livestock'
        },
        SUCCESS_MESSAGE: 'Carcass recorded successfully.',
        TABS: {
            'CARCASS-TAB': {
                CONTROLS: {
                    CHAINNUMBER_PLACEHOLDER: 'Enter Chain Number',
                    CHAINNUMBER_LABEL: 'Chain Number',
                    LIVESTOCKCOUNT_PLACEHOLDER: 'Enter Livestock Count',
                    LIVESTOCKCOUNT_LABEL: 'Livestock Count',
                    LIVESTOCKCOUNT_REQ_MESSAGE: 'Please enter Livestock Count',
                    BODYNUMBER_PLACEHOLDER: 'Enter Body Number',
                    BODYNUMBER_LABEL: 'Body Number',
                    FROMBODYNUMBER_PLACEHOLDER: 'Enter From Body Number',
                    FROMBODYNUMBER_LABEL: 'From Body Number',
                    TOBODYNUMBER_PLACEHOLDER: 'Enter To Body Number',
                    TOBODYNUMBER_LABEL: 'To Body Number',
                    OPERATORNUMBER_PLACEHOLDER: 'Enter Operator Number',
                    OPERATORNUMBER_LABEL: 'Operator Number',
                    LOTNUMBER_PLACEHOLDER: 'Enter Lot Number',
                    LOTNUMBER_LABEL: 'Lot Number',
                    FATTHICKNESS_PLACEHOLDER: 'Enter Fat Thickness',
                    FATTHICKNESS_LABEL: 'Fat Thickness',
                    RIBFATNESS_PLACEHOLDER: 'Enter RIB Fatness',
                    RIBFATNESS_LABEL: 'RIB Fatness',
                    RUMPFATTHICKNESS_PLACEHOLDER: 'Enter Rump Fat Thickness',
                    RUMPFATTHICKNESS_LABEL: 'Rump Fat Thickness',
                    DENTITION_PLACEHOLDER: 'Select Dentition',
                    DENTITION_LABEL: 'Dentition',
                    LIVECARCASSWEIGHT_PLACEHOLDER: 'Enter Live Carcass Weight',
                    LIVECARCASSWEIGHT_LABEL: 'Live Carcass Weight',
                    HOTSTANDARDCARCASSWEIGHT_PLACEHOLDER: 'Enter Host Standard Carcass Weight',
                    HOTSTANDARDCARCASSWEIGHT_LABEL: 'Host Standard Carcass Weight',
                    BRUISESCORE_PLACEHOLDER: 'Enter Bruise Score',
                    BRUISESCORE_LABEL: 'Bruise Score',
                    CARCASSCATEGORY_PLACEHOLDER: 'Select Carcass Category',
                    CARCASSCATEGORY_LABEL: 'Carcass Category',
                    BUTTSHAPE_PLACEHOLDER: 'Select Butt Shape',
                    BUTTSHAPE_LABEL: 'Butt Shape',
                    EQSREFERENCE_PLACEHOLDER: 'Enter EQS Reference',
                    EQSREFERENCE_LABEL: 'EQS Reference',
                    HUMPHEIGHT_PLACEHOLDER: 'Enter Hump Height',
                    HUMPHEIGHT_LABEL: 'Hump Height',
                    FEEDTYPE_PLACEHOLDER: 'Enter Feed Type',
                    FEEDTYPE_LABEL: 'Feed Type',
                    DISEASE_PLACEHOLDER: 'Enter Disease',
                    DISEASE_LABEL: 'Disease',
                    CARCASSWEIGHT_PLACEHOLDER: 'Enter Carcass Weight',
                    CARCASSWEIGHT_LABEL: 'Carcass Weight',
                    PROCESSEDPIC_PLACEHOLDER: 'Enter Processed PIC',
                    PROCESSEDPIC_LABEL: 'Processed PIC',
                    PROCESSEDPIC_REQ_MESSAGE: 'Please enter Processed PIC',
                    PRODUCERLICENSENUMBER_PLACEHOLDER: 'Enter Producer License Number',
                    PRODUCERLICENSENUMBER_LABEL: 'Producer License Number',
                    MSASTARTCODE_PLACEHOLDER: 'Enter MSA Start Code',
                    MSASTARTCODE_LABEL: 'MSA Start Code',
                    BONINGGROUP_PLACEHOLDER: 'Select Boning Group',
                    BONINGGROUP_LABEL: 'Boning Group',
                    MSAGRADER_PLACEHOLDER: 'Enter MSA Grader',
                    MSAGRADER_LABEL: 'MSA Grader',
                    GRADEDATE_PLACEHOLDER: 'Select Grade Date',
                    GRADEDATE_LABEL: 'Grade Date',
                    LEFTSIDESCANTIME_PLACEHOLDER: 'Enter Left Side Scan Time',
                    LEFTSIDESCANTIME_LABEL: 'Left Side Scan Time',
                    RIGHTSIDESCANTIME_PLACEHOLDER: 'Enter Right Side Scan Time',
                    RIGHTSIDESCANTIME_LABEL: 'Right Side Scan Time',
                    HANGMETHOD_PLACEHOLDER: 'Select Hang Method',
                    HANGMETHOD_LABEL: 'Hang Method',
                    HGP_PLACEHOLDER: 'Enter HGP',
                    HGP_LABEL: 'HGP',
                    LEFTSIDEHSCW_PLACEHOLDER: 'Enter Left Side SCW',
                    LEFTSIDEHSCW_LABEL: 'Left Side SCW',
                    RIGHTSIDEHSCW_PLACEHOLDER: 'Enter Right Side SCW',
                    RIGHTSIDEHSCW_LABEL: 'Right Side SCW',
                    BRAND_PLACEHOLDER: 'Enter Brand',
                    BRAND_LABEL: 'Brand',
                    PRICEKG_PLACEHOLDER: 'Enter Price KG',
                    PRICEKG_LABEL: 'Price KG',
                    DEST_PLACEHOLDER: 'Enter Dest',
                    DEST_LABEL: 'Dest',
                    VERSIONOFMSAMODEL_PLACEHOLDER: 'Enter Version Of MSA Model',
                    VERSIONOFMSAMODEL_LABEL: 'Version Of MSA Model',
                    ISMSASALEYARD_TEXT: 'Is MSA Saleyard',
                    DRESSINGPERCENTAGE_PLACEHOLDER: 'Enter Dressing Percentage',
                    DRESSINGPERCENTAGE_LABEL: 'Dressing Percentage',
                    GRADECODE_PLACEHOLDER: 'Select Grade Code',
                    GRADECODE_LABEL: 'Grade Code',
                    PROCESSEDDATE_PLACEHOLDER: 'Select Processed Date',
                    PROCESSEDDATE_LABEL: 'Processed Date',
                    PROCESSEDDATE_REQ_MESSAGE: 'Please select Processed Date',
                    PROCESSEDTIME_PLACEHOLDER: 'Enter Processed Time',
                    PROCESSEDTIME_LABEL: 'Processed Time',
                    PROCESSEDTIME_REQ_MESSAGE: 'Please enter Processed Time',
                    TROPICALBREEDCONTENT_PLACEHOLDER: 'Enter Tropical Breed Content',
                    TROPICALBREEDCONTENT_LABEL: 'Tropical Breed Content',
                    HUMPCOLD_PLACEHOLDER: 'Enter Hump Cold',
                    HUMPCOLD_LABEL: 'Hump Cold',
                    EYEMUSCLEAREA_PLACEHOLDER: 'Enter Eye Muscle Area',
                    EYEMUSCLEAREA_LABEL: 'Eye Muscle Area',
                    OSSIFICATION_PLACEHOLDER: 'Enter Ossification',
                    OSSIFICATION_LABEL: 'Ossification',
                    AUSMARBLING_PLACEHOLDER: 'Enter AUS Marbling',
                    AUSMARBLING_LABEL: 'AUS Marbling',
                    MSAMARBLING_PLACEHOLDER: 'Enter MSA Marbling',
                    MSAMARBLING_LABEL: 'MSA Marbling',
                    MEATCOLOUR_PLACEHOLDER: 'Select Meat Colour',
                    MEATCOLOUR_LABEL: 'Meat Colour',
                    FATMUSCLE_PLACEHOLDER: 'Enter Fat Muscle',
                    FATMUSCLE_LABEL: 'Fat Muscle',
                    FATCOLOUR_PLACEHOLDER: 'Select Fat Colour',
                    FATCOLOUR_LABEL: 'Fat Colour',
                    FATDEPTH_PLACEHOLDER: 'Enter Fat Depth',
                    FATDEPTH_LABEL: 'Fat Depth',
                    PH_PLACEHOLDER: 'Enter pH',
                    PH_LABEL: 'pH',
                    LOINTEMPERATURE_PLACEHOLDER: 'Enter Loin Temperature',
                    LOINTEMPERATURE_LABEL: 'Loin Temperature',
                    COST_PLACEHOLDER: 'Enter Cost',
                    COST_LABEL: 'Cost',
                    ISMILKFEDVEALER_TEXT: 'Is Milk Fed Vealer',
                    ISRINSE_TEXT: 'Is Rinse',
                    ISRIB_TEXT: 'Is RIB',
                    RETAILPRODUCTYIELD_PLACEHOLDER: 'Enter Retail Product Yield',
                    RETAILPRODUCTYIELD_LABEL: 'Retail Product Yield',
                    ISGRASSSEED_TEXT: 'Is Grass Seed',
                    ISARTHRITIS_TEXT: 'Is Arthritis',
                    GPS_PLACEHOLDER: 'Select GPS',
                    GPS_LABEL: 'GPS',
                    GPS_REQ_MESSAGE: 'Please select GPS'
                },
            },
            'LIVESTOCK-TAB': {
                CONTROLS: {
                    CURRENT_WEIGHT_FLOATING: 'Current Weight (KG)',
                    CURRENT_WEIGHT_HINT: 'Current Weight (KG)',
                    NUMBER_OF_LIVESTOCK_HINT: 'Number Of Livestock',
                    NUMBER_OF_LIVESTOCK_FLOATING: 'Number Of Livestock',
                    EID_HINT: 'EID',
                    EID_FLOATING: 'EID',
                    MOB_HINT: 'Mob Name',
                    MOB_FLOATING: 'Mob Name',
                    VISUALTAG_HINT: 'Visual Tag',
                    VISUALTAG_FLOATING: 'Visual Tag',
                    NLISID_HINT: 'NLIS ID',
                    NLISID_FLOATING: 'NLIS ID',
                    SOCIETYID_HINT: 'Society ID',
                    SOCIETYID_FLOATING: 'Society ID'
                }
            }
        },
        VALIDATION: {
            1133: 'Kill Date must be after induction date, scan date and entry date to PIC '
        }
    },
    'RECORD-TREATMENT': {

        TAB_SESSION: {
            DESCRIPTION: "Choose session & start treatment"
        },

        TAB_TREATMENT: {
            SERVICE_LABEL: "Service",

            CHEMICAL_PRODUCT_LABEL: "Chemical Product",
            CHEMICAL_PRODUCT_PLACEHOLDER: "Type to search Chemical Product",
            CHEMICAL_PRODUCT_REQ_MESSAGE: "Chemical Product is required.",

            BATCH_NUMBER_LABEL: "Batch Number",
            BATCH_NUMBER_PLACEHOLDER: "Type to search Batch Number",
            BATCH_NUMBER_REQ_MESSAGE: "Batch Number is required.",

            STOCK_ON_HAND_LABEL: "Stock on hand",
            STOCK_ON_HAND_PLACEHOLDER: "Enter Stock on hand",
            STOCK_ON_HAND_REQ_MESSAGE: "Stock on hand is required.",

            WHP_LABEL: "WHP",
            WHP_PLACEHOLDER: "Enter WHP",

            ESI_LABEL: "ESI",
            ESI_PLACEHOLDER: "Eenter ESI",

            STOCK_COST_LABEL: "Cost of stock on hand ($)",
            STOCK_COST_PLACEHOLDER: "Enter Cost of stock on hand",
            STOCK_COST_REQ_MESSAGE: "Cost of stock on hand is required.",

            DOSE_LABEL: "Dose",
            DOSE_PLACEHOLDER: "Enter Dose",
            DOSE_REQ_MESSAGE: "Dose is required.",

            TREATMENT_DATE_LABEL: "Date of Treatment",

            TREAT_BY_COMPANY_LABEL: "Treat by Contractor Company",
            TREAT_BY_COMPANY_PLACEHOLDER: "Select Company",
            TREAT_BY_COMPANY_REQ_MESSAGE: "Treat by Contractor Company is required.",

            CONTRACTOR_CHEMICAL_STOCK_LABEL: "Use contractor's chemical stock",

            AUTHORISED_PERSON_LABEL: "Treat Authorised by Person",
            AUTHORISED_PERSON_PLACEHOLDER: "Enter Authorised Person name",
            AUTHORISED_PERSON_REQ_MESSAGE: "Treat Authorised by Person is required.",

            ADMINISTER_PERSON_LABEL: "Administer by Person",
            ADMINISTER_PERSON_PLACEHOLDER: "Enter Administer Person name",

            PIC_LABEL: "Treat on PIC",
            PROPERTY_NAME_LABEL: "Name of Property",
            ADDRESS_LABEL: "Address",

            TREAT_NAME_PLACEHOLDER: "Enter Name of Treat",
            TREAT_NAME_LABEL: "Name of Treat",
            TREAT_NAME_REQ_MESSAGE: "Name of Treat is required.",

            SESSION_NAME_LABEL: "Name Session of Treatment",
            SESSION_NAME_PLACEHOLDER: "Enter session name",
            SESSION_NAME_REQ_MESSAGE: "Name Session of Treatment is required.",

            DISEASE_LABEL: "Disease",
            DISEASE_PLACEHOLDER: "Enter Disease",

            CHEMICAL_PRODUCT_IN_SESSION_LABEL: "Chemical Product(s) in Session",

            ADD_CHEMICAL_LABEL: "Add Chemical",
            UPDATE_CHEMICAL_LABEL: "Update Chemical",
            NEW_CHEMICAL_LABEL: "New Chemical",
            DUPLICATE_CHEMICAL_FOUND: "Chemical Product with same Batch Number already exist.",
            DUPLICATE_TREAT_NAME_FOUND: "Name of Treat already exist.",
            ADD_CHEMICAL_SUCCESS: "Chemical Product added successfully in Session.",
            UPDATE_CHEMICAL_SUCCESS: "Chemical Product updated successfully in Session.",

            DELETE_STOCK_CONFIRMATION_MESSAGE: "Are you sure you want to delete chemical product?",
            CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation')

        },

        TAB_LIVESTOCK: {
            LIVESTOCK_COUNT_LABEL: "Number of Livestock in Treatment",
            MOB_COUNT_LABEL: "Number of Mob(s) in Treatment",
            MOB_LABEL: "Name of Mob",
            WEIGHT_LABEL: "Current Weight in Total (KG)"
        },

        SAVE_LABEL: "Save",
        CANCEL_LABEL: "Cancel",
        SAVE_AND_APPLY_LABEL: "Save & Apply",
        SAVE_SESSION_LABEL: "Save Session",
        NEW_SESSION_LABEL: "New Session",
        MODIFY_SESSION_LABEL: "Modify Session",
        APPLY_TREATMENT_LABEL: "Apply Treatment",

        TAB_TREATMENT_LABEL: "Treatment",
        TAB_LIVESTOCK_LABEL: "Livestock",

        TITLE: "Record Treatment",
        SESSION_SAVE_SUCCESS: "Session saved successfully.",
        SAVE_APPLY_SUCCESS: "Session saved and Record treatment perform successfully.",
        SUCCESS: "Record treatment perform successfully."
    }
}

