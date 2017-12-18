'use strict';

/*************************************
 * load data files based on languague provided 
 * from respective folder
 * *************************************/

module.exports = (lang) => {

        var params = {
                DOCUMENT_TITLE_PREFIX: "Aglive v3 - "
        };

        // Load common languague file
        var langCommon = require('./' + lang + '/common');

        // Load languages base on file name and params
        function loadLang(name, params = null) {
                let langFile = null;
                if (!params)
                        langFile = require('./' + lang + '/' + name);
                else
                        langFile = require('./' + lang + '/' + name)(params);
                return Object.assign(langFile, langCommon);
        }

        return {
                Dashboard: loadLang('dashboard'),
                Header: loadLang('header'),
                Footer: loadLang('footer'),
                SideBar: loadLang('sidebar'),
                Login: loadLang('login', params),
                ChangePassword: loadLang('popup-changepassword'),
                ForgotPassword: loadLang('forgotpassword', params),
                CheckEmail: loadLang('checkemail'),
                ResetPassword: loadLang('resetpassword'),
                Lib: loadLang('lib'),
                PrivateLayout: loadLang('private-layout'),
                Contact: loadLang('contact'),
                Common: loadLang('common')
        };
};
