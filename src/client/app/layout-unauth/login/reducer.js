'use strict';

import { SAVEDETAILS, LOGIN_FORM_SET_VALUE } from './actiontypes';
import * as _form from '../../../lib/wrapper-components/FormActions'
import lodash from 'lodash';

function loginReducer(state = initStore(), action) {
    var newState = Object.assign({}, state);
    switch (action.type) {
        case LOGIN_FORM_SET_VALUE:
            newState = _form.setFormValue(newState, action);
            return newState;
        case SAVEDETAILS:
            newState.isClicked = true;
            return submitForm(newState);
        default:
            return newState;
    }
}

function initStore() {
    let init = _form.initForm(['Email', 'Password', 'RememberMe'], { isClicked: false });
    return init;
}

function submitForm(newState) {
    //console.log('click...!');
    let isValid = _form.isValidForm(newState);
    if (isValid) {
        let obj = _form.getForm(newState);
        console.log(obj);
        newState = initStore();
        return newState;
    }
    else {
        return newState;
    }
}

export default loginReducer