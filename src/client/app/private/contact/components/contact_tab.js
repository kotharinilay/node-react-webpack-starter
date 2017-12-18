'use strict';

/**************************
 * sub tab for WHP records
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import AutoComplete from '../../../../lib/core-components/AutoComplete';
import CheckBox from '../../../../lib/core-components/CheckBox';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { deleteFile, uploadFile } from '../../../../services/private/common';
import { checkDupEmail } from '../../../../services/private/contact';

class ContactTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.contact = this.props.contact;
        this.emailValue = this.contact.Email || '';

        this.LanguageDDValues = [{ value: "en", text: "English" }, { value: "zh", text: "Chinese" }]

        this.state = {
            error: null
        }
        this.checkDupEmail = this.checkDupEmail.bind(this);
        this.blurEmail = this.blurEmail.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    blurEmail(emailValue) {
        this.emailValue = emailValue;
    }

    // check if username already exists
    checkDupEmail(value) {
        let _this = this;
        return checkDupEmail(value).then(function (res) {
            if (res.success) {

                if (res.data) {
                    _this.refs.username.updateInputStatus(_this.strings.DUPLICATE_EMAIL_VALIDATION);
                    _this.stateSet({ error: _this.strings.DUPLICATE_EMAIL_VALIDATION });
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_EMAIL_VALIDATION });
                }
                else {
                    _this.refs.username.updateInputStatus();
                    _this.stateSet({ error: null });
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    render() {
        return (
            <div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'email',
                                hintText: this.strings.CONTROLS.CONTACT_EMAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_EMAIL_LABEL
                            }}
                                maxLength={100} initialValue={this.contact.Email || ''}
                                eReq={this.strings.CONTROLS.CONTACT_EMAIL_REQ_MESSAGE}
                                isClicked={this.props.isClicked} ref="email" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'mobile',
                                hintText: this.strings.CONTROLS.CONTACT_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_MOBILE_LABEL
                            }}
                                onBlurInput={this.blurEmail}
                                maxLength={20} initialValue={this.contact.Mobile || ''}
                                isClicked={this.props.isClicked} ref="mobile" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'address',
                                hintText: this.strings.CONTROLS.CONTACT_ADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_ADDRESS_LABEL
                            }}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.contact.BusinessAddress || ''}
                                isClicked={this.props.isClicked} ref="address" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'preferredLanguage',
                                hintText: this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_PLACEHOLDER,
                                value: this.contact.Id ? this.contact.PreferredLanguage : 'en'
                            }}
                                textField="text" valueField="value" dataSource={this.LanguageDDValues}
                                eReq={this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_REQ_MESSAGE}
                                isClicked={this.props.isClicked} ref="preferredLanguage" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ContactTab;