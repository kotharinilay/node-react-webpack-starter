'use strict';

/************************************
 * expose collapsible user component
 * Shows user avatar, name of user and service.
 * ********************************** */

import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import outSideClick from 'react-onclickoutside';

import { toEmptyStr } from '../../../../../shared/format/string';
import { getMenuIds } from '../../../../../shared/index';
import { clientLogout } from '../../../../services/public/login';

import { logout } from '../../../../services/private/header';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class UserMenu extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.logoutClick = this.logoutClick.bind(this);
        this.logout = this.logout.bind(this);
        this.editProfileClick = this.editProfileClick.bind(this);
        this.openChangePassword = this.openChangePassword.bind(this);
        this.state = {
            visible: false,
            fullName: this.props.authUser ? (toEmptyStr(this.props.authUser.FirstName) + ' ' + toEmptyStr(this.props.authUser.LastName)) : null
        }
        if (this.props.authUser) {
            //this.fullName = toEmptyStr(this.props.authUser.FirstName) + ' ' + toEmptyStr(this.props.authUser.LastName);
            this.avatar = this.props.authUser.AvatarField ? this.props.authUser.AvatarField
                : this.siteURL + "/static/images/user-icon2.png";
        }

    }


    componentWillReceiveProps(nextProps) {
        if ((toEmptyStr(this.props.authUser.FirstName) + ' ' + toEmptyStr(this.props.authUser.LastName)) != (toEmptyStr(nextProps.authUser.FirstName) + ' ' + toEmptyStr(nextProps.authUser.LastName))) {
            this.setState({ fullName: (toEmptyStr(nextProps.authUser.FirstName) + ' ' + toEmptyStr(nextProps.authUser.LastName)) });
        }
    }

    // Handle outside click event for user dropdown menu
    handleClickOutside(event) {
        if (this.state.visible) {
            this.setState({ visible: false });
            this.props.disableOnClickOutside();
        }
        else {
            this.props.enableOnClickOutside();
        }
    }

    // Handle inner click for user menu
    innerClick(e) {
        e.stopPropagation();
    }

    openChangePassword() {
        this.setState({ visible: !this.state.visible });
        this.props.toggleChangePassword(true);
    }

    // Open popup for user menu dropdown
    openPopup() {
        this.setState({ visible: !this.state.visible });
        if (!this.state.visible)
            this.props.enableOnClickOutside();
    }

    // Open logout confirmation popup
    logoutClick() {
        let { strings } = this.props;
        // pass custom payload with popup
        let payload = {
            confirmText: 'Are you sure you want to sign out?',
            strings: strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: this.logout,
            redirectUrlOnSuccess: '/login'
        };
        this.props.openConfirmPopup(payload);

        this.setState({ visible: false });
        this.props.disableOnClickOutside();
    }

    // Handle user logout event
    logout() {
        let _this = this;
        let menuIds = getMenuIds(null, null, [], [], false);
        this.props.setModule(menuIds.moduleId, menuIds.controlMenuId);
        return logout().then(function (res) {
            clientLogout();
            return true;
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    editProfileClick() {
        this.setState({ visible: false });
        this.props.disableOnClickOutside();
        this.props.setModule(this.props.moduleId);
        browserHistory.push('/editprofile');
    }

    // Render user menu content and related popup
    render() {
        let { strings } = this.props;
        return (
            <div className={'top-user ' + (this.state.visible ? 'active' : '')} >
                <div ref="clickEvent" onClick={this.openPopup} >
                    <span><img className="profile-icon animated-img-bg" src={this.avatar} alt="user-icon" /></span>
                    <h6 className="top-main-name">{this.state.fullName}<b>{strings.PRODUCER_NAME}</b></h6>
                    <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                        <div className="top-dropdown">
                            <div className="u-profile">
                                <img className="profile-icon1 animated-img-bg" src={this.avatar} alt="user-icon" />
                                <span>{this.state.fullName}<b>{strings.PRODUCER_ATTRIBUTES}</b></span>
                            </div>
                            <div className="expire-on">
                                <span>{strings.EXPIRES_DATE}</span>
                            </div>
                            <div className="edit-pro">
                                <ul>
                                    <li><a onClick={this.editProfileClick}>{strings.EDIT_PROFILE_BUTTON_LABEL}</a></li>
                                    <li><a onClick={this.openChangePassword}>{strings.CHANGEPASSWORD_BUTTON_LABEL}</a></li>
                                    <li><a onClick={this.logoutClick}>{strings.SIGNOUT_BUTTON_LABEL}</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default outSideClick(UserMenu);