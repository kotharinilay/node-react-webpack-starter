'use strict';

/*************************************
 * List of function that will be used for input forms
 * such as signup form, login form etc...
 * *************************************/

import lodash from 'lodash'
import uid from '../../../shared/uuid/index'

export function initForm(fields, extraObj = {}) {
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
    const obj2 = { formId: uid.newUUID(), is_validForm: false };
    return lodash.assign(obj1, obj2, extraObj);
}

export function setFormValue(state, action) {
    state[action.key]['value'] = action.value;
    state[action.key]['isValid'] = action.isValid;
    state[action.key]['isDirty'] = action.isDirty;
    state['is_validForm'] = isValidForm(state);
    return state;
}

export function isValidForm(state) {
    let is_validForm = !has(state, false);
    return is_validForm;
}

function has(obj, value) {
    for (var id in obj) {
        if (obj[id]['isValid'] == value) {
            return true;
        }
    }
    return false;
}

export function getForm(state) {
    let obj = {};
    lodash.pickBy(state, (val, key) => {
        if (val['value'] != undefined)
            obj = Object.assign({}, obj, { [key]: val['value'] });
    });
    return obj;
}

export function resetForm(init) {
    return Object.assign({}, init, init.formId = uid.newUUID());
}
