'use strict';

/*************************************
 * Reset password / Change password screen
 * Comes from forgot password screen
 * *************************************/

module.exports = {
    TITLE: "Change Password",
    CONTROLS: {
        PASSWORD_LABEL: 'New Password',
        PASSWORD_PLACE_HOLDER: 'Enter New Password',
        PASSWORD_REQ_MESSAGE: 'Please enter New Password',
        MUST_CHAR_REQ_MESSAGE: 'New Password must be at least 8 characters',

        CHANGE_PASS_LABEL: "CHANGE PASSWORD",
        BACK_LABEL: "BACK TO SIGN IN"
    },
    LINK_EXPIRED_LINE1: 'Your password reset link has expired.',
    LINK_EXPIRED_LINE2: 'You can request a new reset link from the Sign-in page.',

    PASS_REQUIREMENTS: "Password requirements:",
    MUST_CHAR: "must be at least 8 characters",
    DIFF_FROM_EMAIL: "must be different from email address",

    ERROR_PASS_IS_EMAIL: "Password must be different from email address",
    NEW_OLD_PASSWORDS_SAME: "New Password should not be same as Existing Password",
    
    INVALID_URL: "Requested URL is not valid. Please try again.",

    PASSWORD_UPDATED: "Congratulations, you have successfully changed your password.",
    ABOUT_LINE2: "If you need help please call our friendly Australian based support team on 1-300-893-473"
};