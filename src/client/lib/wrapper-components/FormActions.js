'use strict';

/*************************************
 * List of function that will be used for input forms
 * such as signup form, login form etc...
 * *************************************/

import { assign, pickBy } from 'lodash';
import { randomInteger } from '../../../shared/random';
import { NOTIFY_WARNING } from '../../app/common/actiontypes';

module.exports = {
    initForm: initForm,
    setFormValue: setFormValue,
    isValidForm: isValidForm,
    getForm: getForm,
    resetForm: resetForm,
    gridActionNotify: gridActionNotify,
    loadRecaptchaScript: loadRecaptchaScript
}

// Init form object
function initForm(fields, extraObj = {}) {

    const arrayObj = fields.map(function (el) {
        return {
            [el]: {
                value: '',
                isValid: false,
                isDirty: false
            }
        };
    });
    const obj1 = Object.assign({}, ...arrayObj);
    const obj2 = { formId: randomInteger(), is_validForm: false };

    return assign(obj1, obj2, extraObj);
}

// Update form value in store
function setFormValue(state, action) {
    state[action.key]['value'] = action.value;
    state[action.key]['isValid'] = action.isValid;
    state[action.key]['isDirty'] = action.isDirty;
    state['is_validForm'] = isValidForm(state);
    return state;
}

// Check form is valid
function isValidForm(state, refs) {
    let is_validForm = !has(state, refs);
    return is_validForm;
}

function has(obj, refs) {
    if (refs) {
        for (var formField in obj) {
            if (refs[obj[formField]].fieldStatus['valid'] == false) {
                return true;
            }
        }
        return false;
    }
    else {
        for (var id in obj) {
            if (obj[id]['isValid'] == false) {
                return true;
            }
        }
        return false;
    }
}

// Return form object
function getForm(state, refs) {
    let obj = {};
    if (refs) {
        for (var formField in state) {
            let key = state[formField];
            let value = refs[key].fieldStatus['value'] ? refs[key].fieldStatus['value'] : null;
            obj = Object.assign({}, obj, { [key]: value });
        }
    }
    else {
        pickBy(state, (val, key) => {
            if (val['value'] != undefined)
                obj = Object.assign({}, obj, { [key]: val['value'] });
        });
    }
    return obj;
}

// Reset all controls inside the form
function resetForm(init) {
    return Object.assign({}, init, init.formId = randomInteger());
}

/*************************************
 * For delete -> atLeastOne = true, onlyOne = false
 * For edit -> atLeastOne = true, onlyOne = true
 * *************************************/
function gridActionNotify(strings, notify, selectedRows, atLeastOne = false, onlyOne = false) {
    if (atLeastOne && selectedRows == 0) {
        notify(NOTIFY_WARNING, { message: strings.COMMON.SELECT_AT_LEAST_ONE });
        return false;
    }
    else if (onlyOne && selectedRows != 1) {
        notify(NOTIFY_WARNING, { message: strings.COMMON.SELECT_ONLY_ONE });
        return false;
    }
    else {
        return true;
    }
}

// Load recaptcha script to page
function loadRecaptchaScript() {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
}