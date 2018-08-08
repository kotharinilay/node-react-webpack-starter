'use strict';

/*************************************
 * edit user profile
 * *************************************/

module.exports = {
    DISPLAY: {
        TITLE: "CONTACT",
        CONTROLS: {
            FILTER_LABEL: "Filter",
            CLEAR_LABEL: "Clear",
            ACTION_LABEL: "Actions",
            SET_PASSWORD_LABEL: "Set Password",
            NEW_CONTACT: "Add Contact",
            MODIFY_CONTACT: "Modify Contact",
            DELETE_CONTACT: "Delete Contact",
            FILTER_PRIVATE_LABEL: "Private",
            FILTER_ACTIVE_LABEL: "Active",
            FILTER_STATE_PLACEHOLDER: "State",
            FILTER_STATE_LABEL: "Select State",
            APPLY_FILTER_LABEL: "Apply Filter",
            CLEAR_FILTER_LABEL: "Clear Filter"
        },
        DELETE_CONFIRMATION_MESSAGE: "Are you sure you want to delete?",
        DELETE_SUCCESS: 'Contact(s) deleted successfully.',
        SET_PASSWORD: {
            PASSWORD_SET_SUCCESS: "Password set successfully",
            TITLE: "SET PASSWORD",
            CONTROLS: {
                LOGGEDIN_PASSWORD_LABEL: "Your Current Password",
                LOGGEDIN_PASSWORD_PLACE_HOLDER: "Your Current Password",
                LOGGEDIN_PASSWORD_REQ_MESSAGE: "Please enter Your Current Password",
                NEW_PASSWORD_PLACE_HOLDER: "New Password",
                NEW_PASSWORD_LABEL: "New Password",
                CONFIRM_PASSWORD_PLACE_HOLDER: "Re-enter New Password",
                CONFIRM_PASSWORD_LABEL: "Re-enter New Password",
                MUST_CHAR_REQ_MESSAGE: "New Password must be at least 8 characters",
                NEW_PASSWORD_REQ_MESSAGE: "Please enter New Password",
                CONFIRM_PASSWORD_REQ_MESSAGE: "Please confirm New Password",
                CONFIRM_PASSWORD_VALIDATE_MESSAGE: "Password Not Match",
                SUBMIT_LABEL: "Save",
                CLOSE_LABEL: "Close"
            },
            ERROR_PASS_IS_EMAIL: "Password must be different from email address",
            NEW_OLD_PASSWORDS_SAME: "New Password should not be same as Existing Password",
            EXISTING_PASSWORD_NOT_MATCH: 'Existing password not match.'
        }
    },
    DETAIL: {
        TITLE: "EDIT PROFILE",
        ADD_TITLE: "ADD CONTACT",
        MODIFY_TITLE: "MODIFY CONTACT",
        CONTROLS: {
            SAVE_LABEL: "SAVE",
            BACK_LABEL: "Reset",
            UPLOAD_LABEL: "Upload",
            DELETE_LABEL: "Delete",
            CONTACT_FIRSTNAME_PLACEHOLDER: "Enter First Name",
            CONTACT_FIRSTNAME_LABEL: "First Name",
            CONTACT_FIRSTNAME_REQ_MESSAGE: "Please enter First Name",
            CONTACT_COMPANYNAME_PLACEHOLDER: "Enter Company Name",
            CONTACT_COMPANYNAME_LABEL: "Company Name",
            CONTACT_COMPANYNAME_REQ_MESSAGE: "Please enter Company Name",
            CONTACT_LASTNAME_PLACEHOLDER: "Enter Last Name",
            CONTACT_LASTNAME_REQ_MESSAGE: "Please enter Last Name",
            CONTACT_LASTNAME_LABEL: "Last Name",
            CONTACT_SHORT_CODE_PLACEHOLDER: "Enter Short Code",
            CONTACT_SHORT_CODE_LABEL: "Short Code",
            CONTACT_EMAIL_PLACEHOLDER: "Enter Email",
            CONTACT_EMAIL_LABEL: "Email",
            CONTACT_EMAIL_REQ_MESSAGE: "Please enter Email",
            CONTACT_MOBILE_PLACEHOLDER: "Enter Mobile Number",
            CONTACT_MOBILE_LABEL: "Mobile Number",
            CONTACT_TELEPHONE_PLACEHOLDER: "Enter Telephone Number",
            CONTACT_TELEPHONE_LABEL: "Telephone Number",
            CONTACT_FAX_PLACEHOLDER: "Enter Fax Number",
            CONTACT_FAX_LABEL: "Fax Number",
            CONTACT_ADDRESS_PLACEHOLDER: "Enter Business Address",
            CONTACT_ADDRESS_LABEL: "Business Address",
            CONTACT_POSTALADDRESS_PLACEHOLDER: "Enter Postal Address",
            CONTACT_POSTALADDRESS_LABEL: "Postal Address",
            CONTACT_SUBURB_PLACEHOLDER: "Enter Suburb",
            CONTACT_SUBURB_LABEL: "Suburb",
            CONTACT_POSTALSUBURB_PLACEHOLDER: "Enter Suburb",
            CONTACT_POSTALSUBURB_LABEL: "Suburb",
            CONTACT_STATE_PLACEHOLDER: "Enter State",
            CONTACT_STATE_LABEL: "State",
            CONTACT_POSTALSTATE_PLACEHOLDER: "Enter State",
            CONTACT_POSTALSTATE_LABEL: "State",
            CONTACT_POSTCODE_PLACEHOLDER: "Enter Post Code",
            CONTACT_POSTCODE_LABEL: "Post Code",
            CONTACT_POSTALPOSTCODE_PLACEHOLDER: "Enter Post Code",
            CONTACT_POSTALPOSTCODE_LABEL: "Post Code",
            CONTACT_VEHICLEREGO_PLACEHOLDER: "Enter Vehicle Rego Number",
            CONTACT_VEHICLEREGO_LABEL: "Vehicle Rego Number",
            CONTACT_SALEAGENTCODE_PLACEHOLDER: "Enter Sale Agent Code",
            CONTACT_SALEAGENTCODE_LABEL: "Sale Agent Code",
            CONTACT_NVDSIGNATUREALLOWED_LABEL: "Authorized to use digital signature during process of eNVD within Aglive apps",
            CONTACT_PREFERREDLANGUAGE_PLACEHOLDER: "Preferred Language",
            CONTACT_PREFERREDLANGUAGE_REQ_MESSAGE: "Please select Preferred Language",
            CONTACT_COMPANY_PLACEHOLDER: "Select Company",
            CONTACT_COMPANY_LABEL: "Company",
            CONTACT_COMPANY_REQ_MESSAGE: "Please select Company",
            CONTACT_ISPRIVATE_LABEL: "Private Contact?",
            CONTACT_ISACTIVE_LABEL: "Active User?",
            CONTACT_PASSWORD_PLACEHOLDER: "Enter Password",
            CONTACT_PASSWORD_LABEL: "Password",
            CONTACT_PASSWORD_REQ_MESSAGE: "Please enter Password",
            CONTACT_USERNAME_PLACEHOLDER: "Email",
            CONTACT_USERNAME_LABEL: "Username",
            CONTACT_USERNAME_REQ_MESSAGE: "Please enter email",
            EMAIL_VALIDATE_MESSAGE: 'Invalid email address',
        },
        ROLE: {
            CONTROLS: {
                CONTACT_AGLIVEUSER_LABEL: "Username",
                CONTACT_SUPERUSER_LABEL: "Super User",
                NO_ACCESS_LABEL: "No Access"
            }
        },
        ACCESSPIC: {

        },
        AVATAR_LABEL: "Avatar",
        SIGNATURE_PIC_LABEL: "Signature",
        PICTURE_DELETE_SUCCESS: "Picture deleted successfully.",
        ADD_SUCCESS: 'Contact added successfully.',
        MODIFY_SUCCESS: 'Contact modified successfully.',
        SUCCESS: 'User Profile saved successfully.',
        DUPLICATE_EMAIL_VALIDATION: "Username already exist.",
        ROLE_ACCESS_DENIED: "Please assign username and password to assign role",
        VALIDATION: {
            1095: "Please enter First Name.",
            1096: "Please enter Last Name.",
            1097: "Please enter email.",
            1098: "First Name should not exceed 50 characters.",
            1099: "Last Name should not exceed 50 characters.",
            1100: "Email should not exceed 100 characters.",
            1101: "Please select Company."
        }
    }
};