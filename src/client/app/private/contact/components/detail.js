'use strict';

/**************************
 * Page for edit user profile
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import ContactDetail from './contact_detail';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import { isUUID } from '../../../../../shared/format/string';

class EditProfile extends Component {
    constructor(props) {
        super(props);

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.isProfile = this.props.detail && (isUUID(this.props.detail) || this.props.detail == 'new') ? false : true;
        this.saveUserProfile = this.saveUserProfile.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    onReset() {
        this.refs.detail.onReset();
    }

    saveUserProfile(e) {
        e.preventDefault();
        let _this = this;
        return this.refs.detail.saveUserProfile().then(function (res) {
            if (res) {
                if (_this.isProfile)
                    _this.props.updateContact({ FirstName: res.data.firstName, LastName: res.data.lastName });
                return true;
            }
            return res;
        }).catch(function (err) {
            return false;
        });
    }

    // Render header area of component
    renderHeader() {
        let title = this.strings.ADD_TITLE;
        if (!this.addMode) {
            title = this.strings.MODIFY_TITLE;
        }
        if (this.isProfile) {
            title = this.strings.TITLE;
        }
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{title}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnBack',
                                        label: this.strings.COMMON.CANCEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={() => { browserHistory.replace('/contact'); }} ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnReset',
                                        label: this.strings.COMMON.RESET,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.onReset} ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnSave',
                                        label: this.strings.COMMON.SAVE,
                                        className: 'button2Style button30Style'
                                    }}
                                    loaderHeight={25}
                                    redirectUrl={this.isProfile ? '/dashboard' : '/contact'}
                                    onClick={this.saveUserProfile} ></BusyButton>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>);
    }

    // Render components
    render() {
        return (
            <div className="dash-right">
                {this.renderHeader()}
                <div className="clear"></div>
                <ContactDetail notifyToaster={this.props.notifyToaster} detail={this.props.detail}
                    strings={{ ...this.strings }} ref='detail'
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup} />
                <div className="clear"></div>
            </div>
        );
    }
}

export default EditProfile;