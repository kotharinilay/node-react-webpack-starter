'use strict';

/*************************************
 * To translate page content in different languages based on selection
 * List of function that help us to translate page content
 * Reference link : https://www.npmjs.com/package/react-redux-multilingual
 * *************************************/

import {values} from 'lodash';
import { injectAsyncReducer } from '../redux-store/index';
import { IntlReducer as Intl } from 'react-redux-multilingual';
import translate from './translations';

// Check user selected lang at initial time and set the locale in redux store
function checkLanguage(store) {
    injectAsyncReducer(store, 'Intl', Intl);
    var lang = getLanguage();
    if (lang.indexOf("zh") != -1) {
        store.dispatch({ type: 'SET_LOCALE', locale: 'zh' });
    }
}

// Get selected language from localStorage or DB
function getLanguage() {
    var lang = 'en';
    if (typeof (Storage) !== 'undefined') {
        if (localStorage.getItem('lang') != null)
            lang = localStorage.getItem('lang');
        localStorage.setItem('lang', lang);
    }
    loadTranslate(lang);
    return lang;
}

// Load selected language file to translate content
function loadTranslate(lang) {
    translate[lang].messages = require('./locale')(lang);
}

// Change language and load related settings such as numeral, datetime format etc...
function loadLanguageSettings(lang) {
    if (typeof (Storage) !== 'undefined') {
        localStorage.setItem('lang', lang);
    }
    loadTranslate(lang);    
}

// Change the language of array list and return the converted object data
function convertData(arrayData, valueField, textField, name, translate) {
    let obj = {};
    values(arrayData).map((element, index) => {
        element[textField] = translate(name + '.' + element[valueField]);
        obj[index] = element
    })
    return obj;
}

module.exports = {
    checkLanguage: checkLanguage,
    convertData: convertData,
    getLanguage: getLanguage,
    loadLanguageSettings: loadLanguageSettings
}