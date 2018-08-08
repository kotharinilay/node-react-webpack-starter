'use strict';

/**************************
 * tab component for business unit add/update/delete
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Multipicker from '../../../../lib/core-components/Multipicker';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import Grid from '../../../../lib/core-components/Grid';
import CircularProgress from '../../../../lib/core-components/CircularProgress';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { bufferToUUID } from '../../../../../shared/uuid';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

import { getAllContact } from '../../../../services/private/contact';
import { getAllServiceTypes } from '../../../../services/private/setup';
import {
    saveBusinessUnit, getSubCompanyDetail, checkDupName, getAllRegion,
    deleteCompanyRecords
} from '../../../../services/private/company';

class BusinessUnitTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.business = {};
        this.businessId = null;
        this.contactData = [];
        this.regionData = [];
        this.serviceTypeData = [];
        
        this.businessCountryId = bufferToUUID(this.props.businessCountryId);
        this.postalCountryId = bufferToUUID(this.props.postalCountryId);

        this.businessTabSchema = ['region', 'serviceType', 'companyName', 'shortCode', 'email', 'mobile', 'telephone', 'fax', 'businessaddress', 'postaladdress',
            'website', 'abn', 'acn', 'manager', 'asstManager'];

        this.state = {
            addMode: false,
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'business Id' },
                { field: 'AuditLogId', isSort: false, displayName: 'Audit Id' },
                { field: 'Name', displayName: 'Business', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Manager', displayName: 'Manager', visible: true },
                { field: 'PICCount', displayName: 'PIC(s)', visible: true },
                { field: 'UserCount', displayName: 'Aglive User(s)', visible: true },
            ],
            functionName: 'business/getdataset',
            filterObj: this.props.detail
        }

        this.getBusinessDetails = this.getBusinessDetails.bind(this);
        this.changeManager = this.changeManager.bind(this);
        this.changeAsstManager = this.changeAsstManager.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.modifyBusiness = this.modifyBusiness.bind(this);
        this.deleteBusinessClick = this.deleteBusinessClick.bind(this);
        this.deleteBusiness = this.deleteBusiness.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.saveBusinessDetail = this.saveBusinessDetail.bind(this);
        this.checkDupBusiness = this.checkDupBusiness.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
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

    // get initial details for business detail tab
    getBusinessDetails() {
        let _this = this;
        return Promise.all([
            getAllContact(_this.props.detail).then(function (res) {
                if (res.success) {
                    _this.contactData = res.data;
                }
            }),
            getAllRegion(_this.props.detail).then(function (res) {
                if (res.success) {
                    _this.regionData = res.data;
                }
            }),
            getAllServiceTypes().then(function (res) {
                if (res.success) {
                    _this.serviceTypeData = res.data;
                }
            })
        ]).then(function () {
            if (_this.businessId) {
                return getSubCompanyDetail(_this.businessId, 'B').then(function (res) {
                    if (res.success) {

                        _this.business = res.data.companyData[0];

                        _this.business.BusinessSuburbId = _this.business.BusinessSuburbId ?
                            bufferToUUID(_this.business.BusinessSuburbId) : '';
                        _this.business.PostalSuburbId = _this.business.PostalSuburbId ?
                            bufferToUUID(_this.business.PostalSuburbId) : '';

                        let serviceType = [];
                        res.data.serviceType.forEach((st) => {
                            serviceType.push(bufferToUUID(st.ServiceTypeId));
                        });
                        _this.business.serviceType = serviceType;
                        _this.business.ManagerId = _this.business.ManagerId ?
                            bufferToUUID(_this.business.ManagerId) : '';
                        _this.business.AsstManagerId = _this.business.AsstManagerId ?
                            bufferToUUID(_this.business.AsstManagerId) : '';
                        _this.business.RegionId = _this.business.RegionId ?
                            bufferToUUID(_this.business.RegionId) : '';
                    }
                    else if (res.badRequest) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                    }
                    _this.stateSet({
                        addMode: true,
                        isClicked: false
                    });
                });
            }
            else {
                _this.stateSet({
                    addMode: true,
                    isClicked: false
                });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Validate manager and asst manager with each other on manager change
    changeManager(value, text) {
        let Manager = this.refs.manager;
        let AsstManager = this.refs.asstManager;

        if (value == AsstManager.fieldStatus.value)
            Manager.updateDropdownStatus(this.strings.SAME_BUSINESS_MANAGER_ERROR);
        else
            AsstManager.updateDropdownStatus();
    }

    // Validate manager and asst manager with each other on asst manager change
    changeAsstManager(value, text) {
        let Manager = this.refs.manager;
        let AsstManager = this.refs.asstManager;

        if (value == Manager.fieldStatus.value)
            AsstManager.updateDropdownStatus(this.strings.SAME_ASST_BUSINESS_MANAGER_ERROR);
        else
            Manager.updateDropdownStatus();
    }

    // Clear grid selection
    clearSelection() {
        this.refs.businessGrid.cleanSelected();
    }

    // check if business with same name exist in company
    checkDupBusiness(value) {
        let _this = this;
        return checkDupName(value, this.props.detail, 'R', this.businessId).then(function (res) {
            if (res.success) {

                if (res.data) {
                    _this.refs.companyName.updateInputStatus(_this.strings.DUPLICATE_BUSINESS_VALIDATION);
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_BUSINESS_VALIDATION });
                }
                else {
                    _this.refs.companyName.updateInputStatus();
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Perform delete operation for selected business
    deleteBusiness() {
        this.props.hideConfirmPopup();

        let selectedRows = this.refs.businessGrid.selectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteCompanyRecords(uuids, auditLogIds, 'B').then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_BUSINESS_SUCCESS });
                _this.refs.businessGrid.refreshDatasource();
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Open delete business confirmation popup
    deleteBusinessClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.businessGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteBusiness
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected business
    modifyBusiness() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.businessGrid.selectedRows.length, true, true)) {
            this.businessId = this.refs.businessGrid.selectedRows[0].Id;
            this.getBusinessDetails();
        }
    }

    saveClick(e) {
        e.preventDefault();
        this.saveBusinessDetail();
    }

    // Handle save button click
    saveBusinessDetail() {
        return new Promise((res, rej) => {
            let isFormValid = isValidForm(this.businessTabSchema, this.refs);
            if (!isFormValid) {
                if (!this.state.isClicked)
                    this.setState({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
                rej(false);
                return false;
            }

            let businessObj = getForm(this.businessTabSchema, this.refs);
            let businessSuburb = { businessSuburb: this.refs.businessSuburb.state };
            let postalSuburb = { postalSuburb: this.refs.postalSuburb.state };
            if (!businessSuburb.businessSuburb.isValid || !postalSuburb.postalSuburb.isValid) {
                if (!this.state.isClicked)
                    this.setState({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.INVALID_DETAILS });
                rej(false);
                return false;
            }

            // merge all objects into formObj
            Object.assign(businessObj, businessSuburb, postalSuburb);
            businessObj.companyId = this.props.detail;
            if (this.businessId) {
                businessObj.Id = this.businessId;
                businessObj.AuditLogId = this.business.AuditLogId;
            }
            res(this.handleAddEdit(businessObj));
        });
    }

    handleAddEdit(obj) {
        let _this = this;
        return saveBusinessUnit(obj).then(function (res) {
            if (res.success) {
                _this.business = {};
                _this.businessId = null;
                _this.stateSet({ addMode: false });
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                return false;
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR, { strings: _this.strings });
                return false;
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    cancelClick() {
        this.businessId = null;
        this.business = {};
        this.setState({ addMode: false })
    }

    renderForm() {
        return (
            <form className="form-cover" onSubmit={this.saveClick}>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'companyName',
                                hintText: this.strings.CONTROLS.BUSINESS_NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BUSINESS_NAME_LABEL
                            }}
                                onBlurInput={this.checkDupBusiness}
                                maxLength={250} initialValue={this.business.Name || ''}
                                eReq={this.strings.CONTROLS.BUSINESS_NAME_REQ_MESSAGE}
                                isClicked={this.state.isClicked} ref="companyName" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'shortCode',
                                hintText: this.strings.CONTROLS.BUSINESS_SHORTCODE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BUSINESS_SHORTCODE_LABEL
                            }}
                                eReq={this.strings.CONTROLS.BUSINESS_SHORTCODE_REQ_MESSAGE}
                                maxLength={20} initialValue={this.business.ShortCode || ''}
                                isClicked={this.state.isClicked} ref="shortCode" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'region',
                                hintText: this.strings.CONTROLS.BUSINESS_REGION_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BUSINESS_REGION_LABEL,
                                value: this.business.RegionId || null
                            }}
                                eReq={this.strings.CONTROLS.BUSINESS_REGION_REQ_MESSAGE}
                                textField="Name" valueField="Id" dataSource={this.regionData}
                                isClicked={this.state.isClicked} ref="region" />
                        </div>
                        <div className="col-md-6">
                            <Multipicker inputProps={{
                                name: 'serviceType',
                                placeholder: this.strings.CONTROLS.COMPANY_SERVICE_TYPE_PLACEHOLDER,
                                label: this.strings.CONTROLS.COMPANY_SERVICE_TYPE_LABEL,
                                defaultValue: this.business.serviceType || []
                            }}
                                eReq={this.strings.CONTROLS.COMPANY_SERVICE_TYPE_REQ_MESSAGE}
                                textField="NameCode" valueField="Id"
                                dataSource={this.serviceTypeData}
                                isClicked={this.state.isClicked} ref="serviceType" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'email',
                                hintText: this.strings.CONTROLS.COMPANY_EMAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_EMAIL_LABEL
                            }}
                                onBlurInput={this.checkDupEmail}
                                maxLength={100} initialValue={this.business.Email || ''}
                                eReq={this.strings.CONTROLS.COMPANY_EMAIL_REQ_MESSAGE}
                                isClicked={this.state.isClicked} ref="email" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'mobile',
                                hintText: this.strings.CONTROLS.COMPANY_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_MOBILE_LABEL
                            }}
                                maxLength={20} initialValue={this.business.Mobile || ''}
                                isClicked={this.state.isClicked} ref="mobile" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'telephone',
                                hintText: this.strings.CONTROLS.COMPANY_TELEPHONE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_TELEPHONE_LABEL
                            }}
                                maxLength={20} initialValue={this.business.Telephone || ''}
                                isClicked={this.state.isClicked} ref="telephone" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'website',
                                hintText: this.strings.CONTROLS.COMPANY_WEBSITE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_WEBSITE_LABEL
                            }}
                                maxLength={512} initialValue={this.business.Website || ''}
                                isClicked={this.state.isClicked} ref="website" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'fax',
                                hintText: this.strings.CONTROLS.COMPANY_FAX_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_FAX_LABEL
                            }}
                                maxLength={20} initialValue={this.business.Fax || ''}
                                isClicked={this.state.isClicked} ref="fax" />
                        </div>
                        <div className="col-md-6">

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'businessaddress',
                                hintText: this.strings.CONTROLS.COMPANY_ADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ADDRESS_LABEL
                            }}
                                eReq={this.strings.CONTROLS.COMPANY_ADDRESS_REQ_MESSAGE}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.business.BusinessAddress || ''}
                                isClicked={this.state.isClicked} ref="businessaddress" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'postaladdress',
                                hintText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_LABEL
                            }}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.business.PostalAddress || ''}
                                isClicked={this.state.isClicked} ref="postaladdress" />
                        </div>
                    </div>
                    <div className="row">
                        <SuburbAutoComplete suburbName='suburb' componentClass='col-md-6' ref='businessSuburb'
                            countryId={this.businessCountryId}
                            suburbHintText={this.strings.CONTROLS.COMPANY_SUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_SUBURB_LABEL}
                            suburbSearchText={this.business.BusinessSuburb ? this.business.BusinessSuburb : ''}
                            suburbSelectedValue={this.business.Id ? this.business.BusinessSuburbId : null}
                            isClicked={this.state.isClicked}
                            stateHintText={this.strings.CONTROLS.COMPANY_STATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.COMPANY_STATE_LABEL}
                            stateDefaultValue={this.business.BusinessStateName ? this.business.BusinessStateName : ''}
                            stateDefaultId={this.business.BusinessStateId ? this.business.BusinessStateId : null}
                            postcodeHintText={this.strings.CONTROLS.COMPANY_POSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTCODE_LABEL}
                            postcodeDefaultValue={this.business.BusinessPostCode ? this.business.BusinessPostCode : ''} />
                        <SuburbAutoComplete suburbName='postalsuburb' componentClass='col-md-6' ref='postalSuburb'
                            countryId={this.postalCountryId}
                            suburbHintText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_LABEL}
                            suburbSearchText={this.business.PostalSuburb ? this.business.PostalSuburb : ''}
                            suburbSelectedValue={this.business.Id ? this.business.PostalSuburbId : null}
                            isClicked={this.state.isClicked}
                            stateHintText={this.strings.CONTROLS.COMPANY_POSTALSTATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSTATE_LABEL}
                            stateDefaultValue={this.business.PostalStateName ? this.business.PostalStateName : ''}
                            stateDefaultId={this.business.PostalStateId ? this.business.PostalStateId : null}
                            postcodeHintText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_LABEL}
                            postcodeDefaultValue={this.business.PostalPostCode ? this.business.PostalPostCode : ''} />
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'abn',
                                hintText: this.strings.CONTROLS.COMPANY_ABN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ABN_LABEL
                            }}
                                maxLength={50} initialValue={this.business.ABN || ''}
                                isClicked={this.state.isClicked} ref="abn" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'acn',
                                hintText: this.strings.CONTROLS.COMPANY_ACN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ACN_LABEL
                            }}
                                maxLength={50} initialValue={this.business.ACN || ''}
                                isClicked={this.state.isClicked} ref="acn" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'manager',
                                hintText: this.strings.CONTROLS.COMPANY_BUSINESS_MANAGER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_BUSINESS_MANAGER_LABEL,
                                value: this.business.ManagerId || null
                            }}
                                onSelectionChange={this.changeManager}
                                textField="Name" valueField="Id" dataSource={this.contactData}
                                isClicked={this.state.isClicked} ref="manager" />
                        </div>
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'asstManager',
                                hintText: this.strings.CONTROLS.COMPANY_ASST_BUSINESS_MANAGER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ASST_BUSINESS_MANAGER_LABEL,
                                value: this.business.AsstManagerId || null
                            }}
                                onSelectionChange={this.changeAsstManager}
                                textField="Name" valueField="Id" dataSource={this.contactData}
                                isClicked={this.state.isClicked} ref="asstManager" />
                        </div>
                    </div>
                    <div className="row pull-right">
                        <Button
                            inputProps={{
                                name: 'btnBack',
                                label: 'Cancel',
                                className: 'button1Style button30Style mr10'
                            }}
                            onClick={this.cancelClick} ></Button>
                        <Button
                            inputProps={{
                                name: 'btnSave',
                                label: this.strings.CONTROLS.SAVE_LABEL,
                                className: 'button2Style button30Style upoload-button-width'
                            }}
                            onClick={this.saveClick} ></Button>
                    </div>
                </div>
            </form>
        );
    }

    renderGrid() {
        return (
            <div>
                <div className="l-stock-top-btn setup-top">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnClear',
                                    label: this.strings.CONTROLS.CLEAR_LABEL,
                                    className: 'button3Style button30Style',
                                }}
                                onClick={this.clearSelection}
                            ></Button>
                        </li>
                        <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                            <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                            <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                <li>
                                    <ul>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.getBusinessDetails}>
                                                {this.strings.CONTROLS.ADD_BUSINESS_LABEL}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.modifyBusiness}>
                                                {this.strings.CONTROLS.MODIFY_BUSINESS_LABEL}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.deleteBusinessClick}>
                                                {this.strings.CONTROLS.DELETE_BUSINESS_LABEL}
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </div>
                <div className="clear"></div>
                <div className="mt5">
                    <Grid ref="businessGrid" {...this.state} />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="col-md-12">
                {this.state.addMode ? this.renderForm() : this.renderGrid()}
            </div>
        );
    }
}

export default BusinessUnitTab;