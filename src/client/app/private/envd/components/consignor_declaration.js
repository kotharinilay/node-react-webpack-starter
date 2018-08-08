'use strict';

/**************************
 * Consigner Declaration step for e-NVD
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import CheckBox from '../../../../lib/core-components/CheckBox';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Dropdown from '../../../../lib/core-components/Dropdown';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';

import { getPropertyAccessContactList, getContactByCondition } from '../../../../services/private/contact';
import { downloadFile } from '../../../../services/private/common';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { bufferToUUID } from '../../../../../shared/uuid';

class ConsignorDeclaration extends Component {
    constructor(props) {
        super(props);

        this.strings = { ...this.props.strings.CONSIGNER_DECLARER, COMMON: this.props.strings.COMMON };
        this.notifyToaster = this.props.notifyToaster;
        this.stateSet = this.stateSet.bind(this);
        this.mounted = false;

        this.isModifyNVD = this.props.eNVDCommonDetails.isModifyNVD;
        this.editData = this.props.editData;
        this.consignerDeclarerSchema = ['declarerEmail', 'declarerMobile', 'declarerFax', 'declarerAddress',
            'acknowledged', 'acknowledgedate', 'papernvdnumber', 'declarerContact', 'declarerCompanyName',
            'declarerTelephone'];
        this.state = {
            isAck: this.editData.HasDeclarerAcknowledged == 1 ? true : false,
            declarerEmail: this.editData.DeclarerEmail || '',
            declarerMobile: this.editData.DeclarerMobile || '',
            declarerFax: this.editData.DeclarerFax || '',
            declarerAddress: this.editData.DeclarerAddress || '',
            declarerCompanyName: this.editData.DeclarerCompanyName || '',
            declarerTelephone: this.editData.DeclarerTelephone || '',
            suburbId: null,
            countryId: this.editData.DeclarerCountryId ? bufferToUUID(this.editData.DeclarerCountryId) : null,
            responsiblePersons: [],
            responsiblePersonsReady: false,
            disableSignature: true
        }
        this.declarerFirstName = this.editData.DeclarerFirstName || '';
        this.declarerLastName = this.editData.DeclarerLastName || '';
        this.signatureFile = {
            FileId: this.editData.DeclarerSignatureId ? bufferToUUID(this.editData.DeclarerSignatureId) : null,
            FileName: this.editData.DeclarerFileName || '',
            MimeType: this.editData.DeclarerFileMimeType || '',
            FilePath: this.editData.DeclarerFilePath || ''
        }

        this.getData = this.getData.bind(this);
        this.clearFields = this.clearFields.bind(this);
        this.onContactChange = this.onContactChange.bind(this);
        this.acknowledgedChange = this.acknowledgedChange.bind(this);
        this.signatureChange = this.signatureChange.bind(this);
    }

    stateSet(stateObj) {
        if (this.mounted) {
            this.setState(stateObj);
        }
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getPropertyAccessContactList(this.props.ConsignedFromPICId, 0).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    responsiblePersons: res.data, responsiblePersonsReady: true,
                    suburbId: _this.editData.DeclarerSuburbId || null
                });
                if (_this.props.PropertyManagerId && !_this.isModifyNVD) {
                    _this.onContactChange(_this.props.PropertyManagerId);
                }
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getData() {

        let isFormValid = isValidForm(this.consignerDeclarerSchema, this.refs);
        if (!isFormValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let consignerDeclarerObj = getForm(this.consignerDeclarerSchema, this.refs);
        consignerDeclarerObj.declarerFirstName = this.declarerFirstName;
        consignerDeclarerObj.declarerLastName = this.declarerLastName;
        let fileObj = this.refs.declarerSignature.getValues();
        consignerDeclarerObj.signatureObj = fileObj;
        consignerDeclarerObj.declarerSuburbData = this.refs.declarerSuburb.state;

        return consignerDeclarerObj;
    }

    onContactChange(value, text) {
        if (value) {
            let select = `c.Mobile, c.Fax, c.Email, IFNULL(c.BusinessSuburbId, com.BusinessSuburbId) AS SuburbId,
                          com.BusinessCountryId AS CountryId, com.Name AS CompanyName, c.BusinessAddress, 
                          c.FirstName, c.LastName, IF(c.IsNvdSignatureAllowed = 1, c.SignatureFileId, null) as SignatureFileId,
                          f.FilePath, f.FileName, f.MimeType, c.Telephone`;
            let where = `c.UUID = '${value}'`;
            let joins = 'LEFT JOIN company com ON c.CompanyId = com.Id LEFT JOIN filestorage f ON f.Id = c.SignatureFileId';

            let _this = this;
            getContactByCondition(select, joins, where).then(function (res) {
                if (res.success && res.response.length > 0) {
                    let contact = res.response[0]
                    let stateObj = {};
                    _this.declarerFirstName = contact.FirstName;
                    _this.declarerLastName = contact.LastName;
                    stateObj.declarerEmail = contact.Email || '';
                    stateObj.declarerMobile = contact.Mobile || '';
                    stateObj.declarerFax = contact.Fax || '';
                    stateObj.declarerCompanyName = contact.CompanyName;
                    stateObj.declarerTelephone = contact.Telephone;
                    stateObj.declarerAddress = contact.BusinessAddress || '';
                    stateObj.suburbId = contact.SuburbId ? bufferToUUID(contact.SuburbId) : null;
                    stateObj.countryId = contact.CountryId ? bufferToUUID(contact.CountryId) : null;
                    stateObj.disableSignature = false;
                    if (contact.SignatureFileId) {
                        downloadFile(contact.FilePath, contact.FileName, contact.MimeType).then(function (res) {
                        })
                        stateObj.isAck = true;
                        _this.editData.HasDeclarerAcknowledged = 1;
                        _this.signatureFile = {
                            FileId: null,// bufferToUUID(contact.SignatureFileId),
                            FileName: contact.FileName,
                            MimeType: contact.MimeType,
                            FilePath: contact.FilePath
                        }
                    }
                    else {
                        stateObj.isAck = false;
                        _this.signatureFile = {
                            FileId: null,// bufferToUUID(contact.SignatureFileId),
                            FileName: '',
                            MimeType: '',
                            FilePath: ''
                        }
                    }
                    _this.stateSet(stateObj);
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

    clearFields() {
        this.declarerFirstName = '';
        this.declarerLastName = '';
        this.stateSet({
            isAck: false,
            declarerEmail: '',
            declarerMobile: '',
            declarerFax: '',
            declarerAddress: '',
            suburbId: null,
            countryId: null,
            disableSignature: true
        });
        this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
    }

    acknowledgedChange(value) {
        this.setState({ isAck: value });
    }

    signatureChange(obj) {
        if (this.isModifyNVD)
            obj.file ? this.editData.HasDeclarerAcknowledged = 1 : this.editData.HasDeclarerAcknowledged = 0;
        this.stateSet({ isAck: obj.file ? true : false });
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
                <div className='col-md-6'>
                    <div className="row">
                        <div className="col-md-12">
                            <Dropdown inputProps={{
                                name: 'declarerContact',
                                hintText: this.state.responsiblePersonsReady ? strings.DECLARER_CONTACT_PLACEHOLDER : 'Loading...',
                                floatingLabelText: strings.DECLARER_CONTACT_LABEL,
                                value: this.isModifyNVD ? bufferToUUID(this.editData.DeclarerContactId) : this.props.PropertyManagerId,
                                disabled: this.editData.disableAll
                            }}
                                eReq={strings.DECLARER_CONTACT_REQ_MESSAGE}
                                onSelectionChange={this.onContactChange} callOnChange={true}
                                textField="Name" valueField="Id" dataSource={this.state.responsiblePersons}
                                isClicked={this.props.isClicked} ref="declarerContact" />
                        </div>
                        <div className="hidden">
                            <Input inputProps={{
                                name: 'declarerCompanyName',
                                hintText: '',
                                floatingLabelText: '',
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={100} initialValue={this.state.declarerCompanyName}
                                isClicked={this.props.isClicked} ref="declarerCompanyName" />
                        </div>
                        <div className="hidden">
                            <Input inputProps={{
                                name: 'declarerTelephone',
                                hintText: '',
                                floatingLabelText: '',
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={100} initialValue={this.state.declarerTelephone}
                                isClicked={this.props.isClicked} ref="declarerTelephone" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'declarerEmail',
                                hintText: strings.DECLARER_EMAIL_PLACEHOLDER,
                                floatingLabelText: strings.DECLARER_EMAIL_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                eInvalid={strings.EMAIL_VALIDATE_MESSAGE}
                                maxLength={100} initialValue={this.state.declarerEmail}
                                isClicked={this.props.isClicked} ref="declarerEmail" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'declarerMobile',
                                hintText: strings.DECLARER_MOBILE_PLACEHOLDER,
                                floatingLabelText: strings.DECLARER_MOBILE_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.declarerMobile}
                                isClicked={this.props.isClicked} ref="declarerMobile" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'declarerFax',
                                hintText: strings.DECLARER_FAX_PLACEHOLDER,
                                floatingLabelText: strings.DECLARER_FAX_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                updateOnChange={true}
                                maxLength={20} initialValue={this.state.declarerFax}
                                isClicked={this.props.isClicked} ref="declarerFax" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'declarerAddress',
                                hintText: strings.DECLARER_ADDRESS_PLACEHOLDER,
                                floatingLabelText: strings.DECLARER_ADDRESS_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                maxLength={200} initialValue={this.state.declarerAddress}
                                multiLine={true} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="declarerAddress" />
                        </div>
                        <div className="col-md-12">
                            <SuburbAutoComplete suburbName='declarerSuburb' ref='declarerSuburb'
                                countryId={this.state.countryId} strings={this.strings.COMMON}
                                suburbSelectedValue={this.state.suburbId} fatchData={true}
                                isClicked={this.props.isClicked} isDisabled={this.editData.disableAll} />
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className="row">
                        <div className="col-md-12">
                            <div key={this.signatureFile.FileName} className="que-text-ans">
                                <FileUpload
                                    isSignature={true}
                                    isSignaturePad={true}
                                    isDisabled={this.editData.disableAll || this.state.disableSignature}
                                    strings={this.strings.COMMON}
                                    notifyToaster={this.notifyToaster}
                                    data={this.signatureFile} getDataOnUpload={this.signatureChange}
                                    picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref='declarerSignature' />
                            </div>
                        </div>
                        <div className="col-md-12">
                            <CheckBox inputProps={{
                                name: 'acknowledged',
                                label: strings.DECLARER_ACKNOWLEDGED_LABEL,
                                defaultChecked: this.isModifyNVD ? this.editData.HasDeclarerAcknowledged == 1 ? true : false : this.state.isAck,
                                disabled: this.editData.disableAll
                            }}
                                eReq={true} updateOnChange={true}
                                className='auth-sign' onCheck={this.acknowledgedChange}
                                isClicked={this.props.isClicked} ref="acknowledged" />
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
                                defaultValue={this.isModifyNVD && this.editData.DeclarerAcknowledgedDate ?
                                    new Date(this.editData.DeclarerAcknowledgedDate) : this.state.isAck ? new Date() : undefined}
                                isClicked={this.props.isClicked} ref='acknowledgedate' />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'papernvdnumber',
                                hintText: strings.PAPER_NVD_NUMBER_PLACEHOLDER,
                                floatingLabelText: strings.PAPER_NVD_NUMBER_LABEL,
                                disabled: this.editData.disableAll
                            }}
                                maxLength={25} initialValue={this.props.editData.PaperNVDNumber || ''}
                                isClicked={this.props.isClicked} ref="papernvdnumber" />
                        </div>
                        {this.state.isAck ? <div className="col-md-12">
                            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', textJustify: 'inter-word' }} dangerouslySetInnerHTML={{ __html: strings.DECLARATION_TEXT.replace('<<Resonsible Person>>', this.declarerFirstName.concat(' ', this.declarerLastName)).replace(/<<NVDType>>/g, this.props.eNVDCommonDetails.nvdTypeName) }}>
                            </div>
                        </div> : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default ConsignorDeclaration;