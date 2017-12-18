'use strict';

/*************************************
 * Login screen
 * *************************************/

module.exports = (params) => {
    return {
        DOCUMENT_TITLE: params.DOCUMENT_TITLE_PREFIX + "Login",
        TITLE: 'SIGN IN TO YOUR ACCOUNT',
        CONTROLS: {
            EMAIL_LABEL: 'EMAIL',
            PASSWORD_LABEL: 'PASSWORD',
            REMEMBERME_LABEL: 'Remember Me',
            FORGOTPASSWORD_LABEL: 'Forgot Password?',
            SIGNIN_LABEL: 'SIGN IN',
            EMAIL_PLACE_HOLDER: 'Enter email address',
            EMAIL_REQ_MESSAGE: 'Please enter Email',
            EMAIL_VALIDATE_MESSAGE: 'Invalid email address',
            PASSWORD_PLACE_HOLDER: 'Enter Password',
            PASSWORD_REQ_MESSAGE: 'Please enter Password',
            SIGNUPNOW_LABEL: 'SIGNUP NOW'
        },
        FOOTER_TEXT: 'If you need help please call our friendly Australian based support team on 1-300-893-473',
        CREATE_AGLIVE_ACCOUNT: 'CREATE YOUR AGLIVE ACCOUNT',
        DESCRIPTION_LINE1: 'Join Aglive\'s revolutionary evidence-based tracking and authentication-enabled technology allowing food to be tracked from \"paddock to plate\" through the food production value chain.',
        DESCRIPTION_LINE2: 'Real-time digitized NVD solutions that provide complete traceabiliy of livestock through farm to saleyards, processors and beyond.',
        AGLIVE_ENVD_LABEL: 'Aglive eNVD',
        FREE_MOB_ENVD_LABEL: 'Free Mob eNVD',
        AGLIVE_PRO_LABEL: 'Aglive Pro',
        FULLFARM_MANAGEMENT_LABEL: 'Full Farm Management'
    };
};