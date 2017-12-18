'use strict';

/**************************
 * Map all actions and props to login component
 * such as login email and password and locale.
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { setUserInfo } from './actions';
import Login from './components/Login';
import { notifyToaster } from '../../common/actions';
import { setTopPIC } from '../../private/header/actions';

const mapDispatchToProps = (dispatch) => {
    return {
        setUserInfo: (userInfo) => {
            dispatch(setUserInfo(userInfo))
        },
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        },
        setTopPIC: (payload) => {
            dispatch(setTopPIC(payload))
        }
    }
}

const mapStateToProps = (state) => {
    return {
        loginuser: state.loginuser
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('Login', Login))