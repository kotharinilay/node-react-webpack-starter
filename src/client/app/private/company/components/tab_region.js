'use strict';

/**************************
 * tab component for region add/update/delete
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../lib/core-components/Dropdown';
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
import {
    saveRegion, getSubCompanyDetail, checkDupName,
    deleteCompanyRecords
} from '../../../../services/private/company';

class RegionTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;
        
        this.strings = this.props.strings;
        this.region = {};
        this.regionId = null;
        this.contactData = [];
        this.businessCountryId = bufferToUUID(this.props.businessCountryId);
        this.postalCountryId = bufferToUUID(this.props.postalCountryId);

        this.regionTabSchema = ['companyName', 'shortCode', 'email', 'mobile', 'telephone', 'fax', 'businessaddress', 'postaladdress',
            'website', 'abn', 'acn', 'manager', 'asstManager'];

        this.state = {
            addMode: false,
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Region Id' },
                { field: 'AuditLogId', isSort: false, displayName: 'Audit Id' },
                { field: 'Name', displayName: 'Region', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Manager', displayName: 'Manager', visible: true },
                { field: 'PICCount', displayName: 'PIC(s)', visible: true },
                { field: 'UserCount', displayName: 'Aglive User(s)', visible: true },
            ],
            functionName: 'region/getdataset',
            filterObj: this.props.detail
        }

        this.getRegionDetails = this.getRegionDetails.bind(this);
        this.changeManager = this.changeManager.bind(this);
        this.changeAsstManager = this.changeAsstManager.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.modifyRegion = this.modifyRegion.bind(this);
        this.deleteRegionClick = this.deleteRegionClick.bind(this);
        this.deleteRegion = this.deleteRegion.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.saveRegionDetail = this.saveRegionDetail.bind(this);
        this.checkDupRegion = this.checkDupRegion.bind(this);
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

    // get initial details for region detail tab
    getRegionDetails() {
        let _this = this;
        return Promise.all([
            getAllContact(_this.props.detail).then(function (res) {
                if (res.success) {
                    _this.contactData = res.data;
                }
            })
        ]).then(function () {
            if (_this.regionId) {
                return getSubCompanyDetail(_this.regionId, 'R').then(function (res) {
                    if (res.success) {
                        _this.region = res.data.companyData;

                        _this.region.BusinessSuburbId = _this.region.BusinessSuburbId ?
                            bufferToUUID(_this.region.BusinessSuburbId) : '';
                        _this.region.PostalSuburbId = _this.region.PostalSuburbId ?
                            bufferToUUID(_this.region.PostalSuburbId) : '';
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
        });;
    }

    // Validate manager and asst manager with each other on manager change
    changeManager(value, text) {
        let Manager = this.refs.manager;
        let AsstManager = this.refs.asstManager;

        if (value == AsstManager.fieldStatus.value)
            Manager.updateDropdownStatus(this.strings.SAME_REGION_MANAGER_ERROR);
        else
            AsstManager.updateDropdownStatus();
    }

    // Validate manager and asst manager with each other on asst manager change
    changeAsstManager(value, text) {
        let Manager = this.refs.manager;
        let AsstManager = this.refs.asstManager;

        if (value == Manager.fieldStatus.value)
            AsstManager.updateDropdownStatus(this.strings.SAME_ASST_REGION_MANAGER_ERROR);
        else
            Manager.updateDropdownStatus();
    }

    // Clear grid selection
    clearSelection() {
        this.refs.regionGrid.cleanSelected();
    }

    // check if region with same name exist in company
    checkDupRegion(value) {
        let _this = this;
        return checkDupName(value, this.props.detail, 'R', this.regionId).then(function (res) {
            if (res.success) {

                if (res.data) {
                    _this.refs.companyName.updateInputStatus(_this.strings.DUPLICATE_REGION_VALIDATION);
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_REGION_VALIDATION });
                }
                else {
                    _this.refs.companyName.updateInputStatus();
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Perform delete operation for selected region
    deleteRegion() {
        this.props.hideConfirmPopup();
        let selectedRows = this.refs.regionGrid.selectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteCompanyRecords(uuids, auditLogIds, 'R').then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_REGION_SUCCESS });
                _this.refs.regionGrid.refreshDatasource();
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Open delete region confirmation popup
    deleteRegionClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.regionGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteRegion
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected region
    modifyRegion() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.regionGrid.selectedRows.length, true, true)) {
            this.regionId = this.refs.regionGrid.selectedRows[0].Id;
            this.getRegionDetails();
        }
    }

    saveClick(e) {
        e.preventDefault();
        this.saveRegionDetail();
    }

    // Handle save button click
    saveRegionDetail() {
        return new Promise((res, rej) => {
            let isFormValid = isValidForm(this.regionTabSchema, this.refs);
            if (!isFormValid) {
                if (!this.state.isClicked)
                    this.stateSet({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
                rej(false);
                return false;
            }

            let regionObj = getForm(this.regionTabSchema, this.refs);
            let businessSuburb = { businessSuburb: this.refs.businessSuburb.state };
            let postalSuburb = { postalSuburb: this.refs.postalSuburb.state };
            if (!businessSuburb.businessSuburb.isValid || !postalSuburb.postalSuburb.isValid) {
                if (!this.state.isClicked)
                    this.stateSet({ isClicked: true });
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.INVALID_DETAILS });
                rej(false);
                return false;
            }

            // merge all objects into formObj
            Object.assign(regionObj, businessSuburb, postalSuburb);
            regionObj.companyId = this.props.detail;
            if (this.regionId) {
                regionObj.Id = this.regionId;
                regionObj.AuditLogId = this.region.AuditLogId;
            }
            res(this.handleAddEdit(regionObj));
        });
    }

    handleAddEdit(obj) {
        let _this = this;
        return saveRegion(obj).then(function (res) {
            if (res.success) {
                _this.region = {};
                _this.regionId = null;
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
        this.region = {};
        this.regionId = null;
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
                                hintText: this.strings.CONTROLS.REGION_NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REGION_NAME_LABEL
                            }}
                                onBlurInput={this.checkDupRegion}
                                maxLength={250} initialValue={this.region.Name || ''}
                                eReq={this.strings.CONTROLS.REGION_NAME_REQ_MESSAGE}
                                isClicked={this.state.isClicked} ref="companyName" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'shortCode',
                                hintText: this.strings.CONTROLS.REGION_SHORTCODE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REGION_SHORTCODE_LABEL
                            }}
                                eReq={this.strings.CONTROLS.REGION_SHORTCODE_REQ_MESSAGE}
                                maxLength={20} initialValue={this.region.ShortCode || ''}
                                isClicked={this.state.isClicked} ref="shortCode" />
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
                                maxLength={100} initialValue={this.region.Email || ''}
                                eReq={this.strings.CONTROLS.COMPANY_EMAIL_REQ_MESSAGE}
                                isClicked={this.state.isClicked} ref="email" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'mobile',
                                hintText: this.strings.CONTROLS.COMPANY_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_MOBILE_LABEL
                            }}
                                maxLength={20} initialValue={this.region.Mobile || ''}
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
                                maxLength={20} initialValue={this.region.Telephone || ''}
                                isClicked={this.state.isClicked} ref="telephone" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'website',
                                hintText: this.strings.CONTROLS.COMPANY_WEBSITE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_WEBSITE_LABEL
                            }}
                                maxLength={512} initialValue={this.region.Website || ''}
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
                                maxLength={20} initialValue={this.region.Fax || ''}
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
                                initialValue={this.region.BusinessAddress || ''}
                                isClicked={this.state.isClicked} ref="businessaddress" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'postaladdress',
                                hintText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_LABEL
                            }}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.region.PostalAddress || ''}
                                isClicked={this.state.isClicked} ref="postaladdress" />
                        </div>
                    </div>
                    <div className="row">
                        <SuburbAutoComplete suburbName='suburb' componentClass='col-md-6' ref='businessSuburb'
                            countryId={this.businessCountryId}
                            suburbHintText={this.strings.CONTROLS.COMPANY_SUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_SUBURB_LABEL}
                            suburbSearchText={this.region.BusinessSuburb ? this.region.BusinessSuburb : ''}
                            suburbSelectedValue={this.region.Id ? this.region.BusinessSuburbId : null}
                            isClicked={this.state.isClicked}
                            stateHintText={this.strings.CONTROLS.COMPANY_STATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.COMPANY_STATE_LABEL}
                            stateDefaultValue={this.region.BusinessStateName ? this.region.BusinessStateName : ''}
                            stateDefaultId={this.region.BusinessStateId ? this.region.BusinessStateId : null}
                            postcodeHintText={this.strings.CONTROLS.COMPANY_POSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTCODE_LABEL}
                            postcodeDefaultValue={this.region.BusinessPostCode ? this.region.BusinessPostCode : ''} />
                        <SuburbAutoComplete suburbName='postalsuburb' componentClass='col-md-6' ref='postalSuburb'
                            countryId={this.postalCountryId}
                            suburbHintText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_LABEL}
                            suburbSearchText={this.region.PostalSuburb ? this.region.PostalSuburb : ''}
                            suburbSelectedValue={this.region.Id ? this.region.PostalSuburbId : null}
                            isClicked={this.state.isClicked}
                            stateHintText={this.strings.CONTROLS.COMPANY_POSTALSTATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSTATE_LABEL}
                            stateDefaultValue={this.region.PostalStateName ? this.region.PostalStateName : ''}
                            stateDefaultId={this.region.PostalStateId ? this.region.PostalStateId : null}
                            postcodeHintText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_LABEL}
                            postcodeDefaultValue={this.region.PostalPostCode ? this.region.PostalPostCode : ''} />
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'abn',
                                hintText: this.strings.CONTROLS.COMPANY_ABN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ABN_LABEL
                            }}
                                maxLength={50} initialValue={this.region.ABN || ''}
                                isClicked={this.state.isClicked} ref="abn" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'acn',
                                hintText: this.strings.CONTROLS.COMPANY_ACN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ACN_LABEL
                            }}
                                maxLength={50} initialValue={this.region.ACN || ''}
                                isClicked={this.state.isClicked} ref="acn" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'manager',
                                hintText: this.strings.CONTROLS.COMPANY_REGION_MANAGER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_REGION_MANAGER_LABEL,
                                value: this.region.ManagerId || null
                            }}
                                onSelectionChange={this.changeManager}
                                textField="Name" valueField="Id" dataSource={this.contactData}
                                isClicked={this.state.isClicked} ref="manager" />
                        </div>
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'asstManager',
                                hintText: this.strings.CONTROLS.COMPANY_ASST_REGION_MANAGER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.COMPANY_ASST_REGION_MANAGER_LABEL,
                                value: this.region.AsstManagerId || null
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
                                            <a href="javascript:void(0)" onClick={this.getRegionDetails}>
                                                {this.strings.CONTROLS.ADD_REGION_LABEL}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.modifyRegion}>
                                                {this.strings.CONTROLS.MODIFY_REGION_LABEL}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.deleteRegionClick}>
                                                {this.strings.CONTROLS.DELETE_REGION_LABEL}
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
                    <Grid ref="regionGrid" {...this.state} />
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

export default RegionTab;