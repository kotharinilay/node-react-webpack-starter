'use strict';

/******************************************
 * Map all actions and props to company related components
 ******************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';

import CompanyDetails from './components/detail';
import CompanyDisplay from './components/display';

import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { notifyToaster, openConfirmPopup, hideConfirmPopup, } from '../../common/actions';

class Company extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { strings } = this.props;
        let popupProps = {
            hideConfirmPopup: this.props.hideConfirmPopup,
            openConfirmPopup: this.props.openConfirmPopup
        }
        let detail = this.props.params.detail;
        if (this.props.isSiteAdmin == 0)
            detail = this.props.companyId;

        let hierarchyProps = {
            companyId: this.props.companyId,
            companyName: this.props.companyName,
            isSiteAdmin: this.props.isSiteAdmin,
            isSuperUser: this.props.isSuperUser
        }

        return (
            ((this.props.params && detail) || this.props.isSiteAdmin == 0) ?
                <CompanyDetails notifyToaster={this.props.notifyToaster} detail={detail}
                    strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} {...popupProps} hierarchyProps={{ ...hierarchyProps }} /> :

                <CompanyDisplay notifyToaster={this.props.notifyToaster} topSearch={this.props.topSearch}
                    strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} {...popupProps} />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        topSearch: state.header.topSearch,
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
)(Decorator('Company', Company));