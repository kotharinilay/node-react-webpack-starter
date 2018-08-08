'use strict';

/******************************************
 * Map all actions and props to feed component 
 ******************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Detail from './detail';
import Display from './display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import { openConfirmPopup, hideConfirmPopup, notifyToaster } from '../../../common/actions';

class FeedSetup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { strings } = this.props;
        let component = null;

        let defaultProps = {
            notifyToaster: this.props.notifyToaster,
            openConfirmPopup: this.props.openConfirmPopup,
            hideConfirmPopup: this.props.hideConfirmPopup
        }

        let hierarchyProps = {
            companyId: this.props.companyId,
            companyName: this.props.companyName,
            isSiteAdmin: this.props.isSiteAdmin,
            isSuperUser: this.props.isSuperUser
        }

        if (this.props.params && this.props.params.detail) {
            component = <Detail {...defaultProps}
                detail={this.props.params.detail}
                hierarchyProps={{ ...hierarchyProps }}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            component = <Display
                {...defaultProps}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
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
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('SetupFeed', FeedSetup));