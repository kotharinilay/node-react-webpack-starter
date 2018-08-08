'use strict';

/**************************
 * expose Livestock page
 * Displays livestock from selected PIC from PIC Menu.
 * Shows all actions that can be performed irrespective of livestock selection
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { openConfirmPopup, hideConfirmPopup, notifyToaster, openFindPIC, openFindCompany, openFindContact } from '../../common/actions';
import { setSelectedTags } from './actions';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import BreederComposition from '../../../lib/wrapper-components/BreederComposition/BreederComposition';

class Livestock extends Component {

    constructor(props) {
        super(props);
        this.loadComponent = null;
        this.requireComponent = this.requireComponent.bind(this);
    }

    componentWillMount() {
        this.requireComponent(this.props);
    }

    componentWillReceiveProps(nextProps) {
        
        if ((this.props.topPIC == null || this.props.topPIC == undefined) && nextProps.topPIC) {
            browserHistory.replace('/livestock');
            return;
        }
        if (this.props.topPIC.PropertyId != nextProps.topPIC.PropertyId) {
            browserHistory.replace('/livestock');
            return;
        }        
        this.requireComponent(nextProps);
    }

    requireComponent(props) {
        if (props.params && props.params.detail) {
            // Load component based on url
            this.loadComponent = require('./components/' + props.params.detail).default;
        }
        else {
            // Default load livestock display page
            this.loadComponent = require('./components/display').default;
        }
    }

    render() {
        let props = this.props;                
        return (
            <div className="dash-right">
                <div className='col-md-12'>
                    {this.loadComponent != null ?
                        <this.loadComponent
                            {...props}
                            params={props.params}
                            strings={{
                                ...props.strings[props.params.detail ?
                                    props.params.detail.toUpperCase() : 'DISPLAY'], COMMON: props.strings.COMMON
                            }} /> : null
                    }
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        openFindPIC: (payload) => {
            dispatch(openFindPIC(payload))
        },
        openFindCompany: (payload) => {
            dispatch(openFindCompany(payload))
        },
        openFindContact: (payload) => {
            dispatch(openFindContact(payload))
        },
        openConfirmPopup: (info) => {
            dispatch(openConfirmPopup(info))
        },
        hideConfirmPopup: (info) => {
            dispatch(hideConfirmPopup(info))
        },
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        },
        setSelectedTags: (type, options) => {
            dispatch(setSelectedTags(type, options))
        }
    }
}

const mapStateToProps = (state) => {
    return {
        topSearch: state.header.topSearch,
        authUser: state.authUser,
        topPIC: state.header.topPIC,
        selectedTags: state.livestock.selectedTags,
        findPIC: state.common.findPIC,
        findCompany: state.common.findCompany,
        findContact: state.common.findContact
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Decorator('Livestock', Livestock));