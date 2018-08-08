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
import RoleTab from './role_tab';
import AccessiblePICsTab from './accessiblepic_tab';

import { getUserDetails, saveContact, superuserPerCompany } from '../../../../services/private/contact';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import CheckBox from '../../../../lib/core-components/CheckBox';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getCompanyHierarchy } from '../../../../services/private/common';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import { getCompanyDetail } from '../../../../services/private/company';
import { bufferToUUID } from '../../../../../shared/uuid';

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
            dataFetch: false,
            companyData: [],
            companyId: null
        }
        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.isProfile = this.props.detail && (isUUID(this.props.detail) || this.props.detail == 'new') ? false : true;
        this.contactTabSchema = ['email', 'mobile', 'telephone', 'fax', 'address', 'postaladdress',
            'vehicalrego', 'saleagentcode', 'preferredLanguage', 'isNvdSignatureAllowed',
            'contactCode', 'badgenumber'];
        this.formSchema = ['firstName', 'lastName', 'shortCode'];
        this.saveUserProfile = this.saveUserProfile.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.onReset = this.onReset.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
        this.companyChange = this.companyChange.bind(this);
        // this.privateConfirmation = this.privateConfirmation.bind(this);
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

    // handle company drop down change event
    companyChange(value, text) {
        if (this.company.companyId != value) {
            this.company.companyId = value;
            this.company.companyName = text;
            if (this.refs.roleTab) this.refs.roleTab.getGridData(value);
            let _this = this;
            return getCompanyDetail(value).then(function (res) {
                let countryId = bufferToUUID(res.data.BusinessCountryId);
                _this.refs.contactTab.setState({ countryId: countryId });
                _this.refs.shortCode.setState({ value: res.data.ShortCode || '' });
            })
                .catch(function (err) {
                    _this.props.notifyToaster(NOTIFY_ERROR);
                });
        }
    }

    // handle reset event
    onReset() {
        this.setState({ dataFetch: false });
        this.getUserDetails();
    }

    // get user details from id
    getUserDetails() {
        let _this = this;
        if (!this.addMode) {
            let id = this.isProfile ? null : this.props.detail;
            return getUserDetails(id).then(function (res) {
                if (res.success) {
                    _this.contact = res.data[0];

                    _this.contact.BusinessSuburbId = _this.contact.BusinessSuburbId ?
                        bufferToUUID(_this.contact.BusinessSuburbId) : '';
                    _this.contact.PostalSuburbId = _this.contact.PostalSuburbId ?
                        bufferToUUID(_this.contact.PostalSuburbId) : '';
                }
                else if (res.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
                _this.stateSet({ dataFetch: true });
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            return getCompanyHierarchy().then(function (compRes) {
                _this.stateSet({
                    dataFetch: true, companyData: compRes.company,
                    companyId: (_this.props.companyId || null)
                });
                if (_this.props.companyId)
                    _this.companyChange(_this.props.companyId);
                //_this.refs.shortCode.setState({ value: _this.props.shortCode || '' });
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // privateConfirmation() {
    //     return new Promise((resolve, rej) => {
    //         if (!this.isProfile && this.refs.contactTab.refs.isPrivateContact.fieldStatus.value &&
    //             !this.refs.contactTab.state.displayUserLink) {
    //             let payload = {
    //                 confirmText: this.strings.PRIVATE_CONTACT_CONFIRMATION_MESSAGE,
    //                 strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
    //                 onConfirm: () => { resolve(this.saveUserProfile()); },
    //                 onCancel: () => { this.props.hideConfirmPopup(); rej(false); }
    //             };
    //             this.props.openConfirmPopup(payload);
    //         }
    //         else {
    //             resolve(this.saveUserProfile());
    //         }
    //     });
    // }

    // Handle save button click
    saveUserProfile() {
        // this.props.hideConfirmPopup();
        return new Promise((resolve, rej) => {
            if (!this.isProfile) {
                this.contactTabSchema.push('isPrivateContact');
                this.contactTabSchema.push('isActiveContact');
                if (!this.contact.UserName && !this.refs.contactTab.state.displayUserLink) {
                    this.contactTabSchema.push('username');
                    this.contactTabSchema.push('password');
                }
            }

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
            let businessSuburb = { businessSuburb: this.refs.contactTab.refs.businessSuburb.state };
            let postalSuburb = { postalSuburb: this.refs.contactTab.refs.postalSuburb.state };
            if (!businessSuburb.businessSuburb.isValid || !postalSuburb.postalSuburb.isValid) {
                if (!this.state.isClicked)
                    this.setState({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.INVALID_DETAILS });
                return false;
            }
            let avatar = { avatarObj: this.refs.contactTab.refs.avtarFile.getValues() };
            let signaturePic = { signaturePicObj: this.refs.contactTab.refs.signaturePicFile.getValues() };

            let regionRoles = this.refs.roleTab ? this.refs.roleTab.refs.regionRoleGrid.props.gridData : [];
            let businessRoles = this.refs.roleTab ? this.refs.roleTab.refs.businessColumnsRoleGrid.props.gridData : [];

            let regionRolesChanged = true;
            let businessRolesChanged = true;
            let superUserChanged = true;
            if (this.refs.roleTab) {
                regionRolesChanged = (JSON.stringify(regionRoles) == JSON.stringify(this.refs.roleTab.initialRegionRoleData));
                businessRolesChanged = (JSON.stringify(businessRoles) == JSON.stringify(this.refs.roleTab.initialBusinessRoleData));
            }

            let assignedRegionRoles = [];
            regionRoles.map((role) => {
                assignedRegionRoles.push({
                    CompanyId: role.RegionCompanyId,
                    RoleName: role.RoleName
                });
            });
            let assignedBusinessRoles = [];
            businessRoles.map((role) => {
                assignedBusinessRoles.push({
                    CompanyId: role.BusinessCompanyId,
                    RoleName: role.RoleName
                });
            });

            // merge all objects into formObj
            Object.assign(formObj, tabObj, businessSuburb, postalSuburb, avatar, signaturePic, this.company,
                { assignedRegionRoles: assignedRegionRoles }, { assignedBusinessRoles: assignedBusinessRoles });

            formObj.companyId = this.company.companyId || this.contact.CompanyId;
            formObj.auditId = this.contact.AuditLogId;
            formObj.isSuperUser = this.refs.roleTab ? this.refs.roleTab.refs.isSuperUser.fieldStatus.value :
                this.contact.IsSuperUser;

            superUserChanged = (formObj.isSuperUser == this.contact.IsSuperUser);
            if (!superUserChanged || !regionRolesChanged || !businessRolesChanged) {
                formObj.assignProperty = true;
            }

            // check for atleast one super user for company
            if (!formObj.isSuperUser) {
                let _this = this;
                return superuserPerCompany(formObj.companyId, this.props.detail).then(function (res) {
                    if (res.data < 1) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.SUPER_USER_REQ_VALIDATION });
                        rej(false);
                        return false;
                    }
                    else {
                        resolve(_this.handleAddEdit(formObj));
                    }
                }).catch(function (err) {
                    _this.props.notifyToaster(NOTIFY_ERROR);
                    rej(false);
                    return false;
                });;
            }
            else {
                resolve(this.handleAddEdit(formObj));
                return true;
            }
        });
    }

    handleAddEdit(formObj) {
        if (!this.isProfile && !this.addMode) {
            formObj.Id = this.props.detail;
        }
        if (!formObj.username) {
            formObj.username = this.contact.UserName;
        }
        if (this.isProfile) {
            formObj.assignProperty = false;
        }
        if (this.addMode) {
            formObj.isNew = true;
            formObj.assignProperty = true;
        }
        let _this = this;
        return saveContact(formObj).then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                }
                else if (_this.isProfile) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.MODIFY_SUCCESS });
                }
                //resolve(true);
                return { success: true, data: { firstName: formObj.firstName, lastName: formObj.lastName } };
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
        if (this.state.dataFetch) {
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
                                        {(this.isProfile || !this.addMode) ?
                                            <Input inputProps={{
                                                name: 'companyName',
                                                hintText: this.strings.CONTROLS.CONTACT_COMPANYNAME_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.CONTACT_COMPANYNAME_LABEL,
                                                disabled: true
                                            }}
                                                maxLength={250} initialValue={this.contact.CompanyName || ''}
                                                isClicked={this.state.isClicked} ref="companyName" />
                                            :
                                            <Dropdown inputProps={{
                                                name: 'company',
                                                hintText: this.strings.CONTROLS.CONTACT_COMPANY_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.CONTACT_COMPANY_LABEL,
                                                value: this.state.companyId,
                                                disabled: this.props.companyId ? true : false
                                            }}
                                                onSelectionChange={this.companyChange}
                                                eReq={this.strings.CONTROLS.CONTACT_COMPANY_REQ_MESSAGE}
                                                textField="Name" valueField="UUID" dataSource={this.state.companyData}
                                                isClicked={this.state.isClicked} ref="company" />
                                        }
                                    </div>
                                    <div className="col-md-6">
                                        <Input inputProps={{
                                            name: 'shortCode',
                                            hintText: this.strings.CONTROLS.CONTACT_SHORT_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.CONTACT_SHORT_CODE_LABEL,
                                            disabled: true
                                        }}
                                            maxLength={20} initialValue={this.contact.ShortCode || ''}
                                            isClicked={this.state.isClicked} ref="shortCode" />
                                    </div>
                                </div>
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
                                    <ContactTab strings={this.strings} isProfile={this.isProfile}
                                        isClicked={this.state.isClicked} notifyToaster={this.props.notifyToaster}
                                        ref='contactTab' contact={this.contact} />
                                    <div className="clearfix">
                                    </div>
                                </TabPane>
                                <TabPane tab='Role' key="tabRole">
                                    <RoleTab strings={{ ...this.strings.ROLE, COMMON: this.strings.COMMON }}
                                        detail={this.contact.Id} notifyToaster={this.props.notifyToaster}
                                        contact={this.contact} ref="roleTab" isProfile={this.isProfile}
                                        companyId={this.company.companyId || this.contact.CompanyId}
                                        isClicked={this.state.isClicked} />
                                    <div className="clearfix">
                                    </div>
                                </TabPane>
                                <TabPane tab='Accessible PICs' key="tabAccessPIC">
                                    <AccessiblePICsTab strings={{ ...this.strings.ACCESSPIC, COMMON: this.strings.COMMON }}
                                        detail={this.contact.Id} notifyToaster={this.props.notifyToaster}
                                        ref="accessiblePICTab" />
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
            return <LoadingIndicator />;
        }
    }

    render() {
        return (
            this.renderForm()
        );
    }
}

export default ContactDetail;