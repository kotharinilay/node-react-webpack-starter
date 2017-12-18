'use strict';

/*************************************
 * Header component consisting Search, Module menu, 
 * Property auto-complete,Logout menu
 * *************************************/

module.exports = {
    LANGUAGE: { ENGLISH: 'English1', CHINESE: 'Chinese1' },
    SEARCH_BAR: {
        ADVANCE_SEARCH_LABEL: '高级搜索',
        SEARCH_NOW_LABEL: '立即搜索',
        TYPESEARCH_PLACE_HOLDER: '类型和搜索'
    },
    MODULE_BAR: {
        LIVESTOCK_TEXT: '家畜',
        GRAINFODDER_TEXT: '粮食和饲料',
        SECURITY_TEXT: '安全',
        SETTINGSETUP_TEXT: '设置和设置'
    },
    PROPERTY_BAR: {
        NA123456: 'NA123456',
        PROPERTY_NAME_TEXT: '演示属性',
        PRODUCER_TEXT: '演示生产者属性',
        SEARCH_BUTTON_LABEL: '高级搜索',
        PIC_SERACH_PLACE_HOLDER: '键入和搜索',
        NO_PROPERTY: 'No Property Available'
    },
    USER_BAR: {
        PRODUCER_NAME: '生产者',
        PRODUCER_ATTRIBUTES: '监制，销售代理',
        EXPIRES_DATE: '将于2016年12月31日到期',
        EDIT_PROFILE_BUTTON_LABEL: '编辑个人资料',
        CHANGEPASSWORD_BUTTON_LABEL: '更改密码',
        SIGNOUT_BUTTON_LABEL: '退出',
        CHANGE_PASSWORD_COMPONENT: require('./popup-changepassword'),
        CONFIRMATION_POPUP_COMPONENT: require('./popup-confirmation')
    }
};