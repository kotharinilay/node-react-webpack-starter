'use strict';

/*************************************
 * Forgot Password screen
 * *************************************/

module.exports = (params) => {
    return {
        DOCUMENT_TITLE: params.DOCUMENT_TITLE_PREFIX + "Forgot Password",
        TITLE: "FORGOT YOUR PASSWORD?",
        CONTROLS: {
            EMAIL_PLACE_HOLDER: "Enter email address",
            EMAIL_REQ_MESSAGE: "Please enter Email",
            EMAIL_VALIDATE_MESSAGE: "Invalid email address",
            EMAIL_LABEL: "Email address",

            SUBMIT_LABEL: "SUBMIT",
            BACK_LABEL: "BACK TO SIGN IN"
        },
        EMAIL_NOT_REG_MESSAGE: "User is not registered with Aglive.",
        DUPLICATE_EMAIL_MESSAGE: "Duplicate email found!",
        RECAPTCHA_REQ_MESSAGE: "Recaptcha is required!",
        EMAIL_NOT_SENT: "Sorry, something went wrong: Please try again later.",

        ABOUT_LINE1: "To setup new password, enter your email address and we will send you an email with instructions to reset password.",
        ABOUT_LINE2: "If you need help please call our friendly Australian based support team on 1-300-893-473"
    };
};