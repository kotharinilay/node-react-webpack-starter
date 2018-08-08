'use strict';

/**************************
 * tab for company details add/edit
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton'
import Multipicker from '../../../../lib/core-components/Multipicker';
import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import { checkDupEmail } from '../../../../services/private/company';
import { isUUID } from '../../../../../shared/format/string';
import { bufferToUUID, uuidToBuffer } from '../../../../../shared/uuid';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

import { getAllCountry, getAllServiceTypes } from '../../../../services/private/setup';
import { getCompanyData, saveCompany } from '../../../../services/private/company';
import { omit } from 'lodash';

class CompanyTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.pictureMaxSize = 5 * 1024 * 1024;
        this.logo = null;
        this.company = {};
        this.companyObj = {};
        this.companyTabSchema = ['serviceType', 'email', 'mobile', 'telephone', 'fax', 'businessaddress', 'postaladdress',
            'website', 'abn', 'acn'];
        if (!this.props.detail) {
            this.companyTabSchema.push('businessCountry');
            this.companyTabSchema.push('postalCountry');
        }

        this.state = {
            isClicked: false,
            error: null,
            tabKey: 'tabCompanyDetail',
            dataFetch: false,
            countryData: [],
            serviceTypeData: [],
            businessCountryId: null,
            postalCountryId: null,
            addMode: this.props.detail ? false : true
        }

        this.checkDupEmail = this.checkDupEmail.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.saveCompanyDetail = this.saveCompanyDetail.bind(this);
        this.getInitDetails = this.getInitDetails.bind(this);
        this.onBusinessCountryChange = this.onBusinessCountryChange.bind(this);
        this.onPostalCountryChange = this.onPostalCountryChange.bind(this);

        this.checkSaveObj = this.checkSaveObj.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        this.getInitDetails();
    }

    componentWillUnmount() {
        this.mounted = false;
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
        });
    }

    // get initial details for company detail tab
    getInitDetails() {
        if (!this.state.addMode && !isUUID(this.props.detail)) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_UUID });
            return;
        }
        let _this = this;
        let objResponse = {};
        return Promise.all([
            getAllCountry().then(function (res) {
                if (res.success) {
                    objResponse.countryData = res.data;
                }
            }),
            getAllServiceTypes().then(function (res) {
                if (res.success) {
                    objResponse.serviceTypeData = res.data;
                }
            })
        ]).then(function () {
            if (!_this.state.addMode) {

                return getCompanyData(_this.props.detail).then(function (res) {
                    if (res.success) {
                        _this.company = res.data.companyData[0];
                        _this.company.BusinessSuburbId = _this.company.BusinessSuburbId ?
                            bufferToUUID(_this.company.BusinessSuburbId) : '';
                        _this.company.PostalSuburbId = _this.company.PostalSuburbId ?
                            bufferToUUID(_this.company.PostalSuburbId) : '';

                        let serviceType = [];
                        res.data.serviceType.forEach((st) => {
                            serviceType.push(bufferToUUID(st.ServiceTypeId));
                        });
                        _this.company.serviceType = serviceType;
                        _this.props.updateInitialValue(_this.company.CompanyName, _this.company.ShortCode)
                    }
                    else if (res.badRequest) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                    }
                    let businessCountryId = bufferToUUID(_this.company.BusinessCountryId);

                    _this.company.PostalCountryId = bufferToUUID(_this.company.PostalCountryId);
                    if (!_this.company.PostalCountryId) {
                        _this.companyTabSchema.push('postalCountry');
                    }

                    _this.company.logo = {
                        FileId: _this.company.LogoFileId || null,
                        FileName: _this.company.LogoName || '',
                        MimeType: _this.company.LogoType || '',
                        FilePath: _this.company.LogoPath || ''
                    }
                    _this.stateSet({
                        dataFetch: true,
                        countryData: objResponse.countryData,
                        serviceTypeData: objResponse.serviceTypeData,
                        businessCountryId: businessCountryId,
                        postalCountryId: _this.company.PostalCountryId
                    });
                });
            }
            else {
                _this.stateSet({
                    dataFetch: true,
                    countryData: objResponse.countryData,
                    serviceTypeData: objResponse.serviceTypeData
                });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    onBusinessCountryChange(value, text) {
        this.stateSet({
            businessCountryId: value
        });
    }

    onPostalCountryChange(value, text) {
        this.stateSet({
            postalCountryId: value
        });
    }

    saveClick(e) {
        e.preventDefault();
        return new Promise((res, rej) => {
            if (this.checkSaveObj()) {
                res(this.saveCompanyDetail());
            }
            rej();
        });
    }

    checkSaveObj() {

        let isFormValid = isValidForm(this.companyTabSchema, this.refs);
        let comp = this.props.getCompanyHeader();
        if (!isFormValid || !comp) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        this.companyObj = getForm(this.companyTabSchema, this.refs);
        let businessSuburb = { businessSuburb: this.refs.businessSuburb.state };
        let postalSuburb = { postalSuburb: this.refs.postalSuburb.state };
        if (!businessSuburb.businessSuburb.isValid || !postalSuburb.postalSuburb.isValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.INVALID_DETAILS });
            return false;
        }
        let logo = { logo: this.refs.logoFile.getValues() };

        // merge all objects into formObj
        Object.assign(this.companyObj, comp, businessSuburb, postalSuburb, logo);

        let companyObj = Object.assign({}, omit(this.companyObj, ['businessSuburb', 'logo', 'postalSuburb', 'serviceType']));
        companyObj.businessSuburbId = this.companyObj.businessSuburb.suburbId || '';
        companyObj.PostalSuburbId = this.companyObj.postalSuburb.suburbId || '';
        companyObj.LogoName = this.companyObj.logo.file ? this.companyObj.logo.file.name : undefined;
        companyObj = JSON.parse(JSON.stringify(companyObj).toLowerCase());

        let company = Object.assign({}, this.company);
        company = JSON.parse(JSON.stringify(company).toLowerCase());
        let isObjDiffer = false;
        for (var property in companyObj) {
            if (companyObj.hasOwnProperty(property)) {
                if (companyObj[property] != company[property]) {
                    isObjDiffer = true;
                    break;
                }
            }
        }
        if (!isObjDiffer) {
            if (!(this.company.serviceType.length == this.companyObj.serviceType.length &&
                this.companyObj.serviceType.every(el => this.company.serviceType.includes(el)))) {
                isObjDiffer = true;
            }
        }
        return isObjDiffer;
    }

    // Handle save button click
    saveCompanyDetail() {

        return new Promise((res, rej) => {
            if (!this.state.addMode) {
                this.companyObj.Id = this.company.Id;
                this.companyObj.AuditLogId = this.company.AuditLogId;
                this.companyObj.BusinessCountryId = this.company.BusinessCountryId
                this.companyObj.PostalCountryId = this.company.PostalCountryId
            }
            res(this.handleAddEdit(this.companyObj));
        });
    }

    handleAddEdit(obj) {

        let _this = this;
        return saveCompany(obj).then(function (res) {
            if (res.success) {

                _this.company = obj;
                _this.company.LogoName = obj.logo.file ? obj.logo.file.name : undefined;
                _this.company.BusinessSuburbId = obj.businessSuburb.suburbId || '';
                _this.company.BusinessSuburb = obj.businessSuburb.suburbName;
                _this.company.PostalSuburbId = obj.postalSuburb.suburbId || '';
                _this.company.PostalSuburb = obj.postalSuburb.suburbName;
                _this.company.BusinessCountryId = uuidToBuffer(obj.businessCountry);
                _this.company.PostalCountryId = uuidToBuffer(obj.postalCountry);

                if (_this.state.addMode) {
                    _this.stateSet({ addMode: false });
                    _this.company.Id = res.companyId;
                    _this.company.AuditLogId = uuidToBuffer(res.AuditLogId);
                    //_this.addMode = false;
                    _this.props.updateMode(res.companyId);
                    let businessCountryIndex = _this.companyTabSchema.indexOf('businessCountry');
                    _this.companyTabSchema.splice(businessCountryIndex, 1);
                    let postalCountryIndex = _this.companyTabSchema.indexOf('postalCountry');
                    _this.companyTabSchema.splice(postalCountryIndex, 1);
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: "Company created successfully." });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: "Company updated successfully." });
                }

                _this.props.updateInitialValue(_this.company.companyName, _this.company.shortCode)
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

    // check if username already exists
    checkDupEmail(value) {
        let _this = this;
        return checkDupEmail(value).then(function (res) {
            if (res.success) {
                if (res.data) {
                    if (_this.company.Id && _this.company.Id != res.data.UUID) {
                        _this.refs.email.updateInputStatus(_this.strings.DUPLICATE_EMAIL_VALIDATION);
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_EMAIL_VALIDATION });
                    }
                    else {
                        _this.refs.email.updateInputStatus();
                    }
                }
                else {
                    _this.refs.email.updateInputStatus();
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    renderForm() {
        if (this.state.dataFetch) {
            return (
                <form>
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-6">
                                <Multipicker inputProps={{
                                    name: 'serviceType',
                                    placeholder: this.strings.CONTROLS.COMPANY_SERVICE_TYPE_PLACEHOLDER,
                                    defaultValue: this.company.serviceType || []
                                }}
                                    eReq={this.strings.CONTROLS.COMPANY_SERVICE_TYPE_REQ_MESSAGE}
                                    textField="NameCode" valueField="Id"
                                    dataSource={this.state.serviceTypeData}
                                    isClicked={this.state.isClicked} ref="serviceType" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'email',
                                    hintText: this.strings.CONTROLS.COMPANY_EMAIL_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_EMAIL_LABEL
                                }}
                                    onBlurInput={this.checkDupEmail}
                                    maxLength={100} initialValue={this.company.Email || ''}
                                    eReq={this.strings.CONTROLS.COMPANY_EMAIL_REQ_MESSAGE}
                                    isClicked={this.state.isClicked} ref="email" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'mobile',
                                    hintText: this.strings.CONTROLS.COMPANY_MOBILE_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_MOBILE_LABEL
                                }}
                                    maxLength={20} initialValue={this.company.Mobile || ''}
                                    isClicked={this.state.isClicked} ref="mobile" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'telephone',
                                    hintText: this.strings.CONTROLS.COMPANY_TELEPHONE_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_TELEPHONE_LABEL
                                }}
                                    maxLength={20} initialValue={this.company.Telephone || ''}
                                    isClicked={this.state.isClicked} ref="telephone" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'website',
                                    hintText: this.strings.CONTROLS.COMPANY_WEBSITE_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_WEBSITE_LABEL
                                }}
                                    maxLength={512} initialValue={this.company.Website || ''}
                                    isClicked={this.state.isClicked} ref="website" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'fax',
                                    hintText: this.strings.CONTROLS.COMPANY_FAX_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_FAX_LABEL
                                }}
                                    maxLength={20} initialValue={this.company.Fax || ''}
                                    isClicked={this.state.isClicked} ref="fax" />
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
                                    initialValue={this.company.BusinessAddress || ''}
                                    isClicked={this.state.isClicked} ref="businessaddress" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'postaladdress',
                                    hintText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_POSTALADDRESS_LABEL
                                }}
                                    maxLength={300} multiLine={true} rows={3}
                                    initialValue={this.company.PostalAddress || ''}
                                    isClicked={this.state.isClicked} ref="postaladdress" />
                            </div>
                        </div>
                        <div className="row">
                            {this.state.addMode ?
                                <div className="col-md-6">
                                    <Dropdown inputProps={{
                                        name: 'businessCountry',
                                        hintText: this.strings.CONTROLS.COMPANY_BUSINESS_COUNTRY_PLACEHOLDER,
                                        value: this.company.countryId || null
                                    }}
                                        callOnChange={true} eReq={this.strings.CONTROLS.COMPANY_BUSINESS_COUNTRY_REQ_MESSAGE}
                                        onSelectionChange={this.onBusinessCountryChange}
                                        textField="CountryName" valueField="Id" dataSource={this.state.countryData}
                                        isClicked={this.state.isClicked} ref="businessCountry" />
                                </div> : <div className="col-md-6"></div>
                            }
                            {!this.company.PostalCountryId ?
                                <div className="col-md-6">
                                    <Dropdown inputProps={{
                                        name: 'postalCountry',
                                        hintText: this.strings.CONTROLS.COMPANY_POSTAL_COUNTRY_PLACEHOLDER,
                                        value: this.company.PostalCountryId || null
                                    }}
                                        callOnChange={true}
                                        onSelectionChange={this.onPostalCountryChange}
                                        textField="CountryName" valueField="Id" dataSource={this.state.countryData}
                                        isClicked={this.state.isClicked} ref="postalCountry" />
                                </div> : <div className="col-md-6"></div>}
                        </div>
                        <div className="row">
                            <SuburbAutoComplete suburbName='suburb' componentClass='col-md-6' ref='businessSuburb'
                                countryId={this.state.businessCountryId}
                                suburbHintText={this.strings.CONTROLS.COMPANY_SUBURB_PLACEHOLDER}
                                suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_SUBURB_LABEL}
                                suburbSearchText={this.company.BusinessSuburb ? this.company.BusinessSuburb : ''}
                                suburbSelectedValue={this.company.BusinessSuburbId ? this.company.BusinessSuburbId : null}
                                isClicked={this.state.isClicked}
                                stateHintText={this.strings.CONTROLS.COMPANY_STATE_PLACEHOLDER}
                                statefloatingLabelText={this.strings.CONTROLS.COMPANY_STATE_LABEL}
                                stateDefaultValue={this.company.BusinessStateName ? this.company.BusinessStateName : ''}
                                stateDefaultId={this.company.BusinessStateId ? this.company.BusinessStateId : null}
                                postcodeHintText={this.strings.CONTROLS.COMPANY_POSTCODE_PLACEHOLDER}
                                postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTCODE_LABEL}
                                postcodeDefaultValue={this.company.BusinessPostCode ? this.company.BusinessPostCode : ''} />
                            <SuburbAutoComplete suburbName='postalsuburb' componentClass='col-md-6' ref='postalSuburb'
                                countryId={this.state.postalCountryId}
                                suburbHintText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_PLACEHOLDER}
                                suburbfloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSUBURB_LABEL}
                                suburbSearchText={this.company.PostalSuburb ? this.company.PostalSuburb : ''}
                                suburbSelectedValue={this.company.PostalSuburbId ? this.company.PostalSuburbId : null}
                                isClicked={this.state.isClicked}
                                stateHintText={this.strings.CONTROLS.COMPANY_POSTALSTATE_PLACEHOLDER}
                                statefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALSTATE_LABEL}
                                stateDefaultValue={this.company.PostalStateName ? this.company.PostalStateName : ''}
                                stateDefaultId={this.company.PostalStateId ? this.company.PostalStateId : null}
                                postcodeHintText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_PLACEHOLDER}
                                postcodefloatingLabelText={this.strings.CONTROLS.COMPANY_POSTALPOSTCODE_LABEL}
                                postcodeDefaultValue={this.company.PostalPostCode ? this.company.PostalPostCode : ''} />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'abn',
                                    hintText: this.strings.CONTROLS.COMPANY_ABN_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_ABN_LABEL
                                }}
                                    maxLength={50} initialValue={this.company.ABN || ''}
                                    isClicked={this.state.isClicked} ref="abn" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'acn',
                                    hintText: this.strings.CONTROLS.COMPANY_ACN_PLACEHOLDER,
                                    floatingLabelText: this.strings.CONTROLS.COMPANY_ACN_LABEL
                                }}
                                    maxLength={50} initialValue={this.company.ACN || ''}
                                    isClicked={this.state.isClicked} ref="acn" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <FileUpload
                                    strings={this.strings.COMMON}
                                    notifyToaster={this.props.notifyToaster}
                                    label={this.strings.LOGO_LABEL}
                                    data={this.company.logo}
                                    picDelSuccess={this.strings.PICTURE_DELETE_SUCCESS} ref="logoFile" />
                            </div>
                        </div>
                        <div className="row pull-right">
                            <BusyButton
                                inputProps={{
                                    name: 'btnSave',
                                    label: this.strings.CONTROLS.SAVE_LABEL,
                                    className: 'button2Style button30Style mr10'
                                }}
                                loaderHeight={25}
                                onClick={this.saveClick} ></BusyButton>
                        </div>
                    </div>
                </form >
            );
        }
        else {
            return <div className="col-md-12"><LoadingIndicator onlyIndicator={true} /></div>;
        }
    }

    render() {
        return (
            <div>
                {this.renderForm()}
            </div>
        );
    }
}

export default CompanyTab;