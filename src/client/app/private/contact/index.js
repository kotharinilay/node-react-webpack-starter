'use strict';

/******************************************
 * Map all actions and props to user profile
 ******************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';

import EditProfile from './components/detail';
import ContactDisplay from './components/display';

import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { notifyToaster, openConfirmPopup, hideConfirmPopup, } from '../../common/actions';
import { isUUID } from '../../../../shared/format/string';

class Contact extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { strings } = this.props;
        let component = null;
        
        let hierarchyProps = {
            companyId: this.props.companyId,
            companyName: this.props.companyName,
            isSiteAdmin: this.props.isSiteAdmin,
            isSuperUser: this.props.isSuperUser
        }

        return (
            ((this.props.params.detail && (isUUID(this.props.params.detail) || this.props.params.detail == 'new')) ||
                this.props.location.pathname.indexOf('editprofile') != -1
            ) ?
                <EditProfile notifyToaster={this.props.notifyToaster} detail={this.props.params.detail}
                    strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} /> :
                <ContactDisplay notifyToaster={this.props.notifyToaster} searchText={this.props.searchText}
                    strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }}
                    hierarchyProps={{ ...hierarchyProps }}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup} />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        searchText: state.header.searchText,
        companyId: state.authUser.CompanyId,
        companyName: state.authUser.CompanyName,
        isSiteAdmin: state.authUser.IsSiteAdministrator,
        isSuperUser: state.authUser.IsSuperUser,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        },
        openConfirmPopup: (info) => {
            dispatch(openConfirmPopup(info))
        },
        hideConfirmPopup: (info) => {
            dispatch(hideConfirmPopup(info))
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('Contact', Contact));