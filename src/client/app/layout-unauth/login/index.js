'use strict';

/**************************
 * Map all actions and props to login component
 * such as login email and password and locale.
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Login from './components/login';
import { loginFormSetValue } from './actions'

import { withTranslate } from 'react-redux-multilingual'

const mapDispatchToProps = (dispatch) => {
    return {
        loginFormSetValue: (key, value, isValid, isDirty = true) => {
            dispatch(loginFormSetValue(key, value, isValid, isDirty))
        },
        saveDetails: () => {
            dispatch(saveDetails());
        }
    }
}

const mapStateToProps = (state) => {
    return {
        login: state.login
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslate(Login))