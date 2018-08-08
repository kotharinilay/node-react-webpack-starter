'use strict';

/*************************************
 * Header component consisting Search, Module menu, 
 * Property auto-complete,Logout menu
 * *************************************/

module.exports = {
    LANGUAGE: {
        ENGLISH: 'English',
        CHINESE: 'Chinese'
    },
    SEARCH_BAR: {
        ADVANCE_SEARCH_LABEL: 'Advance search',
        SEARCH_NOW_LABEL: 'Search Now',
        TYPESEARCH_PLACE_HOLDER: 'Type and Search'
    },
    MODULE_BAR: {
        LIVESTOCK_TEXT: 'Livestock',
        GRAINFODDER_TEXT: 'Grain & Fodder',
        SECURITY_TEXT: 'Security',
        SETTINGSETUP_TEXT: 'Setting & Setup'
    },
    PROPERTY_BAR: {
        NA123456: 'NA123456',
        PROPERTY_NAME_TEXT: 'Demo property',
        PRODUCER_TEXT: 'Demo Producer Property, Tyab, VIC',
        SEARCH_BUTTON_LABEL: 'Advance search',
        PIC_SERACH_PLACE_HOLDER: 'Type PIC and Search',
        NO_PROPERTY: 'No Property Available'
    },
    USER_BAR: {
        PRODUCER_NAME: 'Producer',
        PRODUCER_ATTRIBUTES: 'Producer, Abattair, Sale Agent',
        EXPIRES_DATE: 'Expires on 31st December 2017',
        EDIT_PROFILE_BUTTON_LABEL: 'Edit Profile',
        CHANGEPASSWORD_BUTTON_LABEL: 'Change Password',
        SIGNOUT_BUTTON_LABEL: 'Sign out',
        CHANGE_PASSWORD_COMPONENT: require('./popup-changepassword'),
        CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation')
    }
};