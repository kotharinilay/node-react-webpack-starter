'use strict';

/**************************
 * Navigation actions will be listed at here
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import Translate from '../../../lib/wrapper-components/Translate';
import Navigation from './components/SideBar';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { setModule } from '../header/actions';
import { notifyToaster } from '../../common/actions';

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        },
        setModule: (moduleId, controlMenuId, setupMenuKey) => {
            dispatch(setModule(moduleId, controlMenuId, setupMenuKey));
        }
    }
}

const mapStateToProps = (state) => {
    return {
        moduleId: state.header.moduleId,
        controlMenuId: state.header.controlMenuId,
        locale: state.Intl.locale
    }
}

export default connect(mapStateToProps, mapDispatchToProps)
    (Decorator('SideBar', Navigation));