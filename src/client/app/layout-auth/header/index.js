'use strict';

/**************************
 * Map all actions and props to header component
 * such as search, setlocale actions and state of searchkey and locale.
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from './components/header';
import { search } from './actions';

import { withTranslate, IntlActions } from 'react-redux-multilingual'

const mapDispatchToProps = (dispatch) => {
    return {
        search: () => {
            dispatch(search());
        },
        setLocale: (lan) => {
            dispatch(IntlActions.setLocale(lan))
        }
    }
}

const mapStateToProps = (state) => {
    return {
        searchKey: state.header,
        locale: state.Intl.locale
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslate(Header))