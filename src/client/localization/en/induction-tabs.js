'use strict';

/*************************************
 * livestock induction primary and other tabs
 * *************************************/

module.exports = {
    'PRIMARY-TAB': {
        CONTROLS: {
            SPECIES_LABEL: "Species",
            SPECIES_PLACEHOLDER: "Select Species",
            SPECIES_REQ_MESSAGE: "Please select Species",
            LIVESTOCKIDENTIFIER_PLACEHOLDER: "Select Livestock Identifier",
            LIVESTOCKIDENTIFIER_LABEL: "Livestock Identifier",
            LIVESTOCKIDENTIFIER_REQ_MESSAGE: "Please select Livestock Identifier",
            ACTIVITY_STATUS_PLACEHOLDER: 'Select Activity Status',
            ACTIVITY_STATUS_LABEL: 'Activity Status',
            ACTIVITY_STATUS_REQ_MESSAGE: 'Please select Activity Status',
            MOB_PLACEHOLDER: 'Enter Mob Name',
            MOB_LABEL: 'Mob Name',
            MOB_REQ_MESSAGE: 'Please enter Mob Name.',
            IDENTIFIER_PLACEHOLDER: 'Enter ',
            IDENTIFIER_REQ_MESSAGE: 'Please Enter ',
            SPECIES_TYPE_LABEL: "Species Type",
            SPECIES_TYPE_PLACEHOLDER: "Select Species Type",
            SPECIES_TYPE_REQ_MESSAGE: "Please select Species Type",
            LIVESTOCKQUANTITY_PLACEHOLDER: 'Enter Livestock Quantity',
            LIVESTOCKQUANTITY_LABEL: 'Livestock Quantity',
            LIVESTOCKQUANTITY_REQ_MESSAGE: 'Please enter Livestock Quantity',
            ENCLOSURE_TYPE_PLACEHOLDER: 'Select Enclosure Type',
            ENCLOSURE_TYPE_LABEL: 'Enclosure Type',
            LIVESTOCK_WEIGHT_PLACEHOLDER: 'Enter Livestock Weight',
            LIVESTOCK_WEIGHT_LABEL: 'Livestock Weight',
            BIRTH_WEIGHT_PLACEHOLDER: 'Enter Birth Weight',
            BIRTH_WEIGHT_LABEL: 'Birth Weight',
            ENCLOSURE_NAME_PLACEHOLDER: 'Select Enclosure Name',
            ENCLOSURE_NAME_LABEL: 'Enclosure Name',
            BREED_TYPE_PLACEHOLDER: 'Select Breed Type',
            BREED_TYPE_LABEL: 'Breed Type',
            DATEOFBIRTH_PLACEHOLDER: 'Select Date of Birth',
            DATEOFBIRTH_LABEL: 'Date of Birth',
            EARTAG_PLACEHOLDER: 'Enter Eartag',
            EARTAG_LABEL: 'Eartag',
            MATURITY_PLACEHOLDER: 'Select Maturity',
            MATURITY_LABEL: 'Maturity',
            MATURITY_REQ_MESSAGE: 'Please select Maturity',
            DROP_PLACEHOLDER: 'Enter Drop',
            DROP_LABEL: 'Drop',
            DROP_REQ_MESSAGE: 'Please enter Drop',
            BRAND_PLACEHOLDER: 'Enter Brand',
            BRAND_LABEL: 'Brand',
            SEX_PLACEHOLDER: 'Select Sex',
            SEX_LABEL: 'Sex',
            SEX_REQ_MESSAGE: 'Please select Sex',
            BIRTHPIC_PLACEHOLDER: 'Enter Birth PIC',
            BIRTHPIC_LABEL: 'Birth PIC',
            LIVESTOCK_ORIGIN_PLACEHOLDER: 'Select Livestock Origin',
            LIVESTOCK_ORIGIN_LABEL: 'Livestock Origin',
            CATEGORY_PLACEHOLDER: 'Select Category',
            CATEGORY_LABEL: 'Category',
            SCANDATE_PLACEHOLDER: 'Select Scan Date',
            SCANDATE_LABEL: 'Scan Date',
            LIVESTOCK_ORIGIN_PIC_PLACEHOLDER: 'Enter Livestock Origin PIC',
            LIVESTOCK_ORIGIN_PIC_LABEL: 'Livestock Origin PIC',
            LIVESTOCK_ORIGIN_REF_PLACEHOLDER: 'Enter Livestock Origin Reference',
            LIVESTOCK_ORIGIN_REF_LABEL: 'Livestock Origin Reference',
            COLOUR_PLACEHOLDER: 'Select Colour',
            COLOUR_LABEL: 'Colour',
            INDUCTIONDATE_PLACEHOLDER: 'Select Induction Date',
            INDUCTIONDATE_LABEL: 'Induction Date',
            INDUCTIONDATE_REQ_MESSAGE: 'Please enter Induction date',
            INDUCTIONGPS_PLACEHOLDER: 'Enter Induction GPS',
            INDUCTIONGPS_LABEL: 'Induction GPS',
            MULTISIREGROUP_PLACEHOLDER: 'Select Multisire Group',
            MULTISIREGROUP_LABEL: 'Multisire Group',
            FINANCIER_NAME_PLACEHOLDER: 'Enter Financier Name',
            FINANCIER_NAME_LABEL: 'Financier Name',
            PPSR_LABEL: 'PPSR',
            FINANCIER_OWNED_LIVESTOCK_LABEL: 'Financier Owned Livestock',
            GENETIC_SIRE_PLACEHOLDER: 'Enter Genetic Sire',
            GENETIC_SIRE_LABEL: 'Genetic Sire',
            GENETIC_DAM_PLACEHOLDER: 'Enter Genetic Dam',
            GENETIC_DAM_LABEL: 'Genetic Dam',
            FOASTER_DAM_PLACEHOLDER: 'Enter Foaster Dam',
            FOASTER_DAM_LABEL: 'Foaster Dam',
            RECEIPIENT_DAM_PLACEHOLDER: 'Enter Receipient Dam',
            RECEIPIENT_DAM_LABEL: 'Receipient Dam',
            INVALID_EID: 'Please enter valid EID',
            INVALID_NLISID: 'Please enter valid NLIS ID'
        },
        INVALID_STATUS_MESSAGE: 'Invalid Activity Status selected.',
        CONFLICT_MESSAGE: ' has mixed value'
    },
    'OTHER-TAB': {
        CONTROLS: {
            MANAGEMENT_NUMBER_PLACEHOLDER: 'Enter Management Number',
            MANAGEMENT_NUMBER_LABEL: 'Management Numbers',
            MANAGEMENT_GROUP_PLACEHOLDER: 'Enter Management Group',
            MANAGEMENT_GROUP_LABEL: 'Management Group',
            NUMBER_IN_BIRTH_PLACEHOLDER: 'Enter Number in Birth',
            NUMBER_IN_BIRTH_LABEL: 'Number in Birth',
            DENTITION_PLACEHOLDER: 'Select Dentition',
            DENTITION_LABEL: 'Dentition',
            BIRTH_PRODUCTIVITY_PLACEHOLDER: 'Enter Birth Productivity',
            BIRTH_PRODUCTIVITY_LABEL: 'Birth Productivity',
            NUMBER_REARED_PLACEHOLDER: 'Enter Number Reared',
            NUMBER_REARED_LABEL: 'Number Reared',
            PROGENY_PLACEHOLDER: 'Enter Progeny',
            PROGENY_LABEL: 'Progeny',
            HGP_LABEL: 'HGP',
            BATCH_NUMBER_PLACEHOLDER: 'Enter Batch Number',
            BATCH_NUMBER_LABEL: 'Batch Number',
            LASTMONTH_OF_SHEARING_PLACEHOLDER: 'Select Last Month of Shearing',
            LASTMONTH_OF_SHEARING_LABEL: 'Last Month of Shearing',
            HGP_DETAIL_PLACEHOLDER: 'Enter HGP Reference Detail',
            HGP_DETAIL_LABEL: 'HGP Reference Detail',
            LAST_COMMENT_PLACEHOLDER: 'Enter Last Comment',
            LAST_COMMENT_LABEL: 'Last Comment',
            ADDITIONAL_TAG_PLACEHOLDER: 'Enter Additional Tag',
            ADDITIONAL_TAG_LABEL: 'Additional Tag',
            FEEDLOT_TAG_PLACEHOLDER: 'Enter Feedlot Tag',
            FEEDLOT_TAG_LABEL: 'Feedlot Tag',
            BREEDER_TAG_PLACEHOLDER: 'Enter Breeder Tag',
            BREEDER_TAG_LABEL: 'Breeder Tag',
            STUD_NAME_PLACEHOLDER: 'Enter Stud Name',
            STUD_NAME_LABEL: 'Stud Name',
            REGISTRATION_DETAIL_PLACEHOLDER: 'Enter Registration Detail',
            REGISTRATION_DETAIL_LABEL: 'Registration Detail',
            WEIGHBRIDGE_TICKET_PLACEHOLDER: 'Enter Weigh Bridge Ticket',
            WEIGHBRIDGE_TICKET_LABEL: 'Weigh Bridge Ticket',
            REFERENCE_ID_PLACEHOLDER: 'Enter Reference Id',
            REFERENCE_ID_LABEL: 'Reference Id',
            NAME_PLACEHOLDER: 'Enter Name',
            NAME_LABEL: 'Name',
            CONTEMPORARY_GROUP_PLACEHOLDER: 'Select Contemporary Group',
            CONTEMPORARY_GROUP_LABEL: 'Contemporary Group',
            GENETIC_STATUS_PLACEHOLDER: 'Select Genetic Status',
            GENETIC_STATUS_LABEL: 'Genetic Status',
            APPRIALSAL_PLACEHOLDER: 'Enter Appraisal',
            APPRIALSAL_LABEL: 'Appraisal',
            CONDITION_SCORE_PLACEHOLDER: 'Select Condition Score',
            CONDITION_SCORE_LABEL: 'Condition Score',
            GROUP_PLACEHOLDER: 'Select Group',
            GROUP_LABEL: 'Group',
            CLASSIFICATION_PLACEHOLDER: 'Select Classification',
            CLASSIFICATION_LABEL: 'Classification',
            SUPPLY_CHAIN_PLACEHOLDER: 'Enter Supply Chain',
            SUPPLY_CHAIN_LABEL: 'Supply Chain',
            FREEMARTIN_LABEL: 'Free-Martin',
            DRAFT_GROUP_PLACEHOLDER: 'Enter Draft Group',
            DRAFT_GROUP_LABEL: 'Draft Group',
            REMINDER_NOTE_PLACEHOLDER: 'Enter Reminder Note',
            REMINDER_NOTE_LABEL: 'Reminder Note',
            REMINDER_DATE_PLACEHOLDER: 'Select Reminder Date',
            REMINDER_DATE_LABEL: 'Reminder Date',
            BRREEDER_PIC_PLACEHOLDER: 'Enter Breeder PIC',
            BRREEDER_PIC_LABEL: 'Breeder PIC',
            BREEDER_CONTACT_PLACEHOLDER: 'Enter Breeder Contact',
            BREEDER_CONTACT_LABEL: 'Breeder Contact',
            BREEDER_CONTACT_MOBILE_PLACEHOLDER: 'Enter Breeder Contact Mobile',
            BREEDER_CONTACT_MOBILE_LABEL: 'Breeder Contact Mobile',
            BREEDER_CONTACT_EMAIL_PLACEHOLDER: 'Enter Breeder Contact Email',
            BREEDER_CONTACT_EMAIL_LABEL: 'Breeder Contact Email',
            TAG_PLACE_PLACEHOLDER: 'Select Tag Place',
            TAG_PLACE_LABEL: 'Tag Place'
        },
        CONFLICT_MESSAGE: ' has mixed value'
    }
}