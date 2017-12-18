'use strict';

/**************************
 * contact detail part of contact (contact form)
 * **************************** */

import React, { Component } from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import ContactTab from './contact_tab';

import { getUserDetails, saveContact, superuserPerCompany } from '../../../../services/private/contact';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import CheckBox from '../../../../lib/core-components/CheckBox';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import CircularProgress from '../../../../lib/core-components/CircularProgress';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getCompanyHierarchy } from '../../../../services/private/common';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import { getCompanyDetail } from '../../../../services/private/company';

class ContactDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.contact = {};
        this.company = {};
        this.state = {
            isClicked: false,
            error: null,
            tabKey: 'tabContact',
            dataFatch: false,
            companyData: [],
            companyId: null
        }
        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.contactTabSchema = ['email', 'mobile', 'address'];
        this.formSchema = ['firstName', 'lastName'];
        this.saveUserProfile = this.saveUserProfile.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.onReset = this.onReset.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Get data to load components
    componentWillMount() {
        this.mounted = true;
        this.getUserDetails();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // handle tab change event
    tabChanged(key) {
        if ((this.refs.contactTab.refs.username && this.refs.contactTab.refs.password
            && this.refs.contactTab.refs.password.fieldStatus.value
            && this.refs.contactTab.refs.username.fieldStatus.value) || this.contact.UserName) {
            this.setState({ tabKey: key });
        }
        else {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.ROLE_ACCESS_DENIED });
        }
    }

    // handle reset event
    onReset() {
        this.setState({ dataFatch: false });
        this.getUserDetails();
    }

    // get user details from id
    getUserDetails() {
        let _this = this;
        if (!this.addMode) {
            return getUserDetails(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.contact = res.data[0];
                }
                else if (res.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
                _this.stateSet({ dataFatch: true });
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // Handle save button click
    saveUserProfile() {
        // this.props.hideConfirmPopup();
        return new Promise((resolve, rej) => {
            debugger;
            let isTabFormValid = isValidForm(this.contactTabSchema, this.refs.contactTab.refs);
            let isFormValid = isValidForm(this.formSchema, this.refs);
            if (!isFormValid || !isTabFormValid) {
                if (!this.state.isClicked)
                    this.setState({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
                rej(false);
                return false;
            }
            if (this.refs.contactTab.state.error) {
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.DUPLICATE_EMAIL_VALIDATION });
                rej(false);
                return false;
            }

            let tabObj = getForm(this.contactTabSchema, this.refs.contactTab.refs);
            let formObj = getForm(this.formSchema, this.refs);

            // merge all objects into formObj
            Object.assign(formObj, tabObj);

            resolve(this.handleAddEdit(formObj));
            return true;
        });
    }

    handleAddEdit(formObj) {
        if (this.addMode) {
            formObj.isNew = true;
        }
        let _this = this;
        return saveContact(formObj).then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.MODIFY_SUCCESS });
                }
                //resolve(true);
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                //rej(false);
                return false;
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    renderForm() {
        if (this.state.dataFatch) {
            return (
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span>{this.strings.DESCRIPTION}</span>
                                <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col-md-6">
                                        <Input inputProps={{
                                            name: 'firstName',
                                            hintText: this.strings.CONTROLS.CONTACT_FIRSTNAME_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.CONTACT_FIRSTNAME_LABEL
                                        }}
                                            maxLength={50} initialValue={this.contact.FirstName || ''}
                                            eReq={this.strings.CONTROLS.CONTACT_FIRSTNAME_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="firstName" />
                                    </div>
                                    <div className="col-md-6">
                                        <Input inputProps={{
                                            name: 'lastName',
                                            hintText: this.strings.CONTROLS.CONTACT_LASTNAME_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.CONTACT_LASTNAME_LABEL
                                        }}
                                            maxLength={50} initialValue={this.contact.LastName || ''}
                                            eReq={this.strings.CONTROLS.CONTACT_LASTNAME_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="lastName" />

                                    </div>
                                </div>
                            </div>
                            <div className="clear"></div>
                            <Tabs
                                activeKey={this.state.tabKey}
                                onChange={this.tabChanged}
                                renderTabBar={() => <ScrollableInkTabBar />}
                                renderTabContent={() => <TabContent animated={false} />} >
                                <TabPane tab='Contact' key="tabContact">
                                    <ContactTab strings={this.strings}
                                        isClicked={this.state.isClicked} notifyToaster={this.props.notifyToaster}
                                        ref='contactTab' contact={this.contact} />
                                    <div className="clearfix">
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                    <div className="clear"></div>
                </div>
            );
        }
        else {
            return (<div>
                <CircularProgress inputProps={{ size: 20, thickness: 3, className: 'mr5' }} /> Loading...
                </div>);
        }
    }

    render() {
        return (
            this.renderForm()
        );

    }
}

export default ContactDetail;