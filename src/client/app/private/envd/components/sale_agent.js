'use strict';

/**************************
 * Sale Agent step for e-NVD
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import CheckBox from '../../../../lib/core-components/CheckBox';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Dropdown from '../../../../lib/core-components/Dropdown';
import AutoComplete from '../../../../lib/core-components/AutoComplete';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';

import { getContactByCondition } from '../../../../services/private/contact';
import { downloadFile } from '../../../../services/private/common';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { bufferToUUID } from '../../../../../shared/uuid';

class SaleAgent extends Component {
    constructor(props) {
        super(props);

        this.strings = { ...this.props.strings.SALE_AGENT, COMMON: this.props.strings.COMMON };
        this.notifyToaster = this.props.notifyToaster;
        this.stateSet = this.stateSet.bind(this);
        this.mounted = false;

        this.isModifyNVD = this.props.eNVDCommonDetails.isModifyNVD;
        this.editData = this.props.editData;
        this.saleAgentSchema = ['isNewAgent', 'saleAgentCompany', 'saleAgentContact', 'saleAgentFirstName',
            'saleAgentLastName', 'saleAgentCompanyName', 'saleAgentTelephone', 'saleAgentCode', 'saleAgentVendorCode',
            'saleAgentEmail', 'saleAgentMobile', 'saleAgentFax', 'saleAgentAddress', 'acknowledged', 'acknowledgedate'];

        this.state = {
            isAck: this.editData.HasSaleAgentAcknowledged == 1 ? true : false,
            isNewAgent: false,
            saleAgentFirstName: this.editData.SaleAgentFirstName || '',
            saleAgentLastName: this.editData.SaleAgentLastName || '',
            saleAgentCode: this.editData.SaleAgentCode || '',
            saleAgentVendorCode: this.editData.SaleAgentVendorCode ? this.editData.SaleAgentVendorCode :
                this.props.ConsignedFromPIC || '',
            saleAgentEmail: this.editData.SaleAgentEmail || '',
            saleAgentMobile: this.editData.SaleAgentMobile || '',
            saleAgentFax: this.editData.SaleAgentFax || '',
            saleAgentAddress: this.editData.SaleAgentAddress || '',
            saleAgentCompanyName: this.editData.SaleAgentCompanyName || '',
            saleAgentTelephone: this.editData.SaleAgentTelephone || '',
            suburbId: null,
            saleAgentContacts: [],
            sacKey: Math.random(),
            disableSignature: true
        };
        this.signatureFile = {
            FileId: this.editData.SaleAgentSignatureId ? bufferToUUID(this.editData.SaleAgentSignatureId) : null,
            FileName: this.editData.SaleAgentFileName || '',
            MimeType: this.editData.SaleAgentFileMimeType || '',
            FilePath: this.editData.SaleAgentFilePath || ''
        }

        this.saleAgentSelected = this.saleAgentSelected.bind(this);
        this.onContactChange = this.onContactChange.bind(this);
        this.signatureChange = this.signatureChange.bind(this);
        this.clearFields = this.clearFields.bind(this);
        this.setFields = this.setFields.bind(this);
        this.acknowledgedChange = this.acknowledgedChange.bind(this);
        this.newAgentChange = this.newAgentChange.bind(this);
        this.getData = this.getData.bind(this);
    }

    stateSet(stateObj) {
        if (this.mounted) {
            this.setState(stateObj);
        }
    }

    componentWillMount() {
        this.mounted = true;
        if (this.isModifyNVD && this.editData.SaleAgentCompanyId) {
            this.saleAgentSelected({ CompanyId: this.editData.SaleAgentCompanyId }, true);
        }
    }

    componentDidMount() {
        if (this.isModifyNVD && this.editData.SaleAgentSuburbId)
            this.stateSet({ suburbId: this.editData.SaleAgentSuburbId });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    saleAgentSelected(value, isInit) {
        if (value && typeof value != 'string') {
            let select = `c.UUID AS Id, c.FirstName, c.LastName, concat(c.FirstName, ' ', c.LastName) as Name`;
            let where = `c.CompanyId = fn_UuidToBin('${value.CompanyId}')`;
            let _this = this;
            getContactByCondition(select, '', where).then(function (res) {
                if (res.success) {
                    _this.stateSet({ saleAgentContacts: res.response, tcKey: Math.random() });
                    if (!isInit) _this.clearFields();
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.setState({ saleAgentContacts: [], tcKey: Math.random() });
            this.clearFields();
        }
    }

    onContactChange(value, text) {
        if (value) {
            let select = `c.FirstName, c.LastName, c.Email, c.Mobile, c.Telephone, c.Fax, c.VehicleRegNumber, 
                          c.BusinessAddress, c.ContactCode, 
                          IF(c.IsNvdSignatureAllowed = 1, c.SignatureFileId, null) as SignatureFileId,
                          IFNULL(c.BusinessSuburbId, com.BusinessSuburbId) AS SuburbId,
                          com.BusinessCountryId AS CountryId, com.Name AS CompanyName,  
                          f.FilePath, f.FileName, f.MimeType `;
            let where = `c.UUID = '${value}'`;
            let joins = 'LEFT JOIN company com ON c.CompanyId = com.Id LEFT JOIN filestorage f ON f.Id = c.SignatureFileId';

            let _this = this;
            getContactByCondition(select, joins, where).then(function (res) {
                if (res.success && res.response.length > 0) {
                    let contact = res.response[0]
                    _this.setFields(contact);
                }
                else {
                    _this.clearFields();
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.clearFields();
        }
    }

    setFields(contact) {
        let stateObj = {};
        stateObj.saleAgentFirstName = contact.FirstName || '';
        stateObj.saleAgentLastName = contact.LastName || '';
        stateObj.saleAgentEmail = contact.Email || '';
        stateObj.saleAgentMobile = contact.Mobile || '';
        stateObj.saleAgentFax = contact.Fax || '';
        stateObj.saleAgentAddress = contact.BusinessAddress || '';
        stateObj.saleAgentCompanyName = contact.CompanyName || '';
        stateObj.saleAgentTelephone = contact.Telephone || '';
        stateObj.suburbId = contact.SuburbId ? bufferToUUID(contact.SuburbId) : null;
        stateObj.countryId = contact.CountryId ? bufferToUUID(contact.CountryId) : null;
        stateObj.disableSignature = false;
        if (contact.SignatureFileId) {
            downloadFile(contact.FilePath, contact.FileName, contact.MimeType).then(function (res) { })
            stateObj.isAck = true;
            this.signatureFile = {
                FileId: null,
                FileName: contact.FileName,
                MimeType: contact.MimeType,
                FilePath: contact.FilePath
            }
        }
        else {
            stateObj.isAck = false;
            this.signatureFile = {
                FileId: null,
                FileName: '',
                MimeType: '',
                FilePath: ''
            }
        }
        this.stateSet(stateObj);
    }

    clearFields() {
        this.stateSet({
            isAck: false,
            saleAgentAddress: '',
            saleAgentName: '',
            saleAgentEmail: '',
            saleAgentFax: '',
            saleAgentMobile: '',
            saleAgentFirstName: '',
            saleAgentLastName: '',
            saleAgentCompanyName: '',
            saleAgentTelephone: '',
            saleAgentCode: '',
            suburbId: null,
            countryId: this.props.authUser.CountryId ? bufferToUUID(this.props.authUser.CountryId) : null,
            disableSignature: true
        });
        this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
        this.editData.SaleAgentContactId = null;
        this.editData.SaleAgentCompanyId = null;
        this.editData.SCompanyName = null;
        this.editData.HasSaleAgentAcknowledged = 0;
        this.editData.SaleAgentAcknowledgedDate = null;
    }

    signatureChange(obj) {
        if (this.isModifyNVD)
            obj.file ? this.editData.HasSaleAgentAcknowledged = 1 : this.editData.HasSaleAgentAcknowledged = 0;
        this.stateSet({ isAck: obj.file ? true : false });
    }

    acknowledgedChange(value) {
        this.setState({ isAck: value });
    }

    newAgentChange(value) {
        if (value && this.saleAgentSchema.indexOf('saleAgentCompany') != -1) {
            this.saleAgentSchema.splice(this.saleAgentSchema.indexOf('saleAgentCompany'), 1);
            this.saleAgentSchema.splice(this.saleAgentSchema.indexOf('saleAgentContact'), 1);
        }
        else if (this.saleAgentSchema.indexOf('saleAgentCompany') == -1) {
            this.saleAgentSchema.push('saleAgentCompany');
            this.saleAgentSchema.push('saleAgentContact');
        }
        this.clearFields();
        this.setState({ isNewAgent: value, saleAgentContacts: [], sacKey: Math.random(), disableSignature: value ? false : true });
    }

    getData() {
        if (this.state.isNewAgent && this.saleAgentSchema.indexOf('saleAgentCompany') != -1) {
            this.saleAgentSchema.splice(this.saleAgentSchema.indexOf('saleAgentCompany'), 1);
            this.saleAgentSchema.splice(this.saleAgentSchema.indexOf('saleAgentContact'), 1);
        }
        else if (this.saleAgentSchema.indexOf('saleAgentCompany') == -1) {
            this.saleAgentSchema.push('saleAgentCompany');
            this.saleAgentSchema.push('saleAgentContact');
        }

        let isFormValid = isValidForm(this.saleAgentSchema, this.refs);
        if (!isFormValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let saleAgentObj = getForm(this.saleAgentSchema, this.refs);
        let fileObj = this.refs.saleAgentSignature.getValues();
        saleAgentObj.signatureObj = fileObj;
        saleAgentObj.saleAgentSuburbData = this.refs.saleAgentSuburb.state;

        return saleAgentObj;
    }

    render() {
        let strings = this.strings.CONTROLS;
        return (
            <div className="row">
                <div className='col-md-12'>
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                    </div>
                </div>
                <div className="col-md-12 mt10">
                    <CheckBox inputProps={{
                        name: 'isNewAgent',
                        label: strings.NEW_SALE_AGENT_LABEL,
                        defaultChecked: false,
                        disabled: this.editData.disableAll
                    }}
                        updateOnChange={true}
                        className='auth-sign' onCheck={this.newAgentChange}
                        isClicked={this.props.isClicked} ref='isNewAgent' />
                </div>
                <div key={this.state.isNewAgent}>
                    <div className='col-md-6'>
                        <div className="row">
                            {!this.state.isNewAgent ?
                                <div>
                                    <div className="col-md-12">
                                        <AutoComplete inputProps={{
                                            name: 'saleAgentCompany',
                                            hintText: strings.SALE_AGENT_COMAPNY_NAME_PLACEHOLDER,
                                            floatingLabelText: strings.SALE_AGENT_COMAPNY_NAME_LABEL,
                                            disabled: this.editData.disableAll
                                        }}
                                            selectedValue={this.editData.SaleAgentCompanyId}
                                            searchText={this.editData.SCompanyName}
                                            textField="CompanyName" valueField="CompanyId" eInvalid={null}
                                            apiUrl="/api/private/contact/getsaleagent?search=$$$"
                                            onSelectionChange={this.saleAgentSelected}
                                            isClicked={this.props.isClicked} ref='saleAgentCompany' />
                                    </div>
                                    <div className="col-md-12" key={this.state.tcKey}>
                                        <Dropdown inputProps={{
                                            name: 'saleAgentContact',
                                            hintText: strings.SALE_AGENT_NAME_PLACEHOLDER,
                                            floatingLabelText: strings.SALE_AGENT_NAME_LABEL,
                                            value: this.isModifyNVD && this.editData.SaleAgentContactId ?
                                                this.editData.SaleAgentContactId : null,
                                            disabled: this.editData.disableAll
                                        }}
                                            onSelectionChange={this.onContactChange} callOnChange={true}
                                            textField="Name" valueField="Id" dataSource={this.state.saleAgentContacts}
                                            isClicked={this.props.isClicked} ref='saleAgentContact' />
                                    </div>
                                </div> : null}
                            <div className={this.state.isNewAgent ? '' : 'hidden'}>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'saleAgentFirstName',
                                        hintText: strings.SALE_AGENT_FIRST_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.SALE_AGENT_FIRST_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={100} initialValue={this.state.saleAgentFirstName}
                                        isClicked={this.props.isClicked} ref='saleAgentFirstName' />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'saleAgentLastName',
                                        hintText: strings.SALE_AGENT_LAST_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.SALE_AGENT_LAST_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={100} initialValue={this.state.saleAgentLastName}
                                        isClicked={this.props.isClicked} ref='saleAgentLastName' />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'saleAgentCompanyName',
                                        hintText: strings.COMPANY_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.COMPANY_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={100} initialValue={this.state.saleAgentCompanyName}
                                        isClicked={this.props.isClicked} ref='saleAgentCompanyName' />
                                </div>
                                <div className="col-md-12">
                                    <NumberInput inputProps={{
                                        name: 'saleAgentTelephone',
                                        hintText: strings.TELEPHONE_PLACEHOLDER,
                                        floatingLabelText: strings.TELEPHONE_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={15} initialValue={this.state.saleAgentTelephone}
                                        isClicked={this.props.isClicked} ref='saleAgentTelephone' />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'saleAgentCode',
                                    hintText: strings.SALE_AGENT_CODE_PLACEHOLDER,
                                    floatingLabelText: strings.SALE_AGENT_CODE_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={100} initialValue={this.state.saleAgentCode}
                                    isClicked={this.props.isClicked} ref='saleAgentCode' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'saleAgentVendorCode',
                                    hintText: strings.SALE_AGENT_VENDOR_PLACEHOLDER,
                                    floatingLabelText: strings.SALE_AGENT_VENDOR_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={100} initialValue={this.state.saleAgentVendorCode}
                                    isClicked={this.props.isClicked} ref='saleAgentVendorCode' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'saleAgentEmail',
                                    hintText: strings.EMAIL_PLACEHOLDER,
                                    floatingLabelText: strings.EMAIL_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    eInvalid={strings.EMAIL_VALIDATE_MESSAGE}
                                    maxLength={100} initialValue={this.state.saleAgentEmail}
                                    isClicked={this.props.isClicked} ref='saleAgentEmail' />
                            </div>
                            <div className="col-md-12">
                                <NumberInput inputProps={{
                                    name: 'saleAgentMobile',
                                    hintText: strings.MOBILE_NUMBER_PLACEHOLDER,
                                    floatingLabelText: strings.MOBILE_NUMBER_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.saleAgentMobile}
                                    isClicked={this.props.isClicked} ref='saleAgentMobile' />
                            </div>
                            <div className="col-md-12">
                                <NumberInput inputProps={{
                                    name: 'saleAgentFax',
                                    hintText: strings.FAX_PLACEHOLDER,
                                    floatingLabelText: strings.FAX_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.saleAgentFax}
                                    isClicked={this.props.isClicked} ref='saleAgentFax' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'saleAgentAddress',
                                    hintText: strings.ADDRESS_PLACEHOLDER,
                                    floatingLabelText: strings.ADDRESS_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    maxLength={200} initialValue={this.state.saleAgentAddress}
                                    multiLine={true} updateOnChange={true}
                                    isClicked={this.props.isClicked} ref='saleAgentAddress' />
                            </div>
                            <div className="col-md-12">
                                <SuburbAutoComplete suburbName='saleAgentSuburb' ref='saleAgentSuburb'
                                    countryId={this.state.countryId} strings={this.strings.COMMON}
                                    suburbSelectedValue={this.state.suburbId} fatchData={true}
                                    isClicked={this.props.isClicked} isDisabled={this.editData.disableAll} />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="row">
                            <div className="col-md-12" key={this.signatureFile.FileName}>
                                <div className="que-text-ans">
                                    <FileUpload
                                        isSignature={true} isDisabled={this.editData.disableAll || this.state.disableSignature}
                                        isSignaturePad={true}
                                        strings={this.strings.COMMON}
                                        notifyToaster={this.notifyToaster}
                                        data={this.signatureFile} getDataOnUpload={this.signatureChange}
                                        picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref='saleAgentSignature' />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <CheckBox inputProps={{
                                    name: 'acknowledged',
                                    label: strings.SALE_AGENT_ACKNOWLEDGED_LABEL,
                                    defaultChecked: this.isModifyNVD ?
                                        this.editData.HasSaleAgentAcknowledged == 1 ? true : false : this.state.isAck,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    className='auth-sign' onCheck={this.acknowledgedChange}
                                    isClicked={this.props.isClicked} ref='acknowledged' />
                            </div>
                            <div className="col-md-12">
                                <DateTimePicker inputProps={{
                                    name: 'acknowledgedate',
                                    placeholder: strings.ACKNOWLEDGED_DATE_PLACEHOLDER,
                                    label: strings.ACKNOWLEDGED_DATE_LABEL,
                                    disabled: !this.state.isAck || this.editData.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY' updateOnChange={true}
                                    dateFilter={{ minDate: new Date(-8640000000000000), maxDate: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)) }}
                                    defaultValue={this.isModifyNVD && this.editData.SaleAgentAcknowledgedDate ?
                                        new Date(this.editData.SaleAgentAcknowledgedDate) : this.state.isAck ? new Date() : undefined}
                                    isClicked={this.props.isClicked} ref='acknowledgedate' />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default SaleAgent;