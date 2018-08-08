'use strict';

/**************************
 * Transporter step for e-NVD
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import CheckBox from '../../../../lib/core-components/CheckBox';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Dropdown from '../../../../lib/core-components/Dropdown';
import RadioButton from '../../../../lib/core-components/RadioButton';
import AutoComplete from '../../../../lib/core-components/AutoComplete';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';

import { getPropertyAccessContactList, getContactByCondition } from '../../../../services/private/contact';
import { downloadFile } from '../../../../services/private/common';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { bufferToUUID } from '../../../../../shared/uuid';

class Transporter extends Component {
    constructor(props) {
        super(props);

        this.strings = { ...this.props.strings.TRANSPORTER, COMMON: this.props.strings.COMMON };
        this.notifyToaster = this.props.notifyToaster;
        this.stateSet = this.stateSet.bind(this);
        this.mounted = false;

        this.isModifyNVD = this.props.eNVDCommonDetails.isModifyNVD;
        this.editData = this.props.editData;
        this.AckReq = this.isModifyNVD && this.editData.HasTransporterAcknowledged == 1;
        this.TransporterReq = this.isModifyNVD &&
            (this.editData.TransporterContactId || this.editData.TransporterFirstName);
        this.transporterSchema = ['transporterContact', 'transporterFirstName', 'transporterLastName', 'transporterCompany',
            'transporterCompanyName', 'transporterTelephone', 'transporterDriverName', 'transporterVehicleRegoNumber',
            'transporterAddVehicleRegoNumber', 'transporterEmail', 'transporterMobile', 'transporterFax',
            'transporterAddress', 'acknowledged', 'acknowledgedate', 'movementCommenceDate'];

        if (!this.props.isPickupeNVD)
            this.transporterSchema.push('driveBy');

        this.radioGroupDS = [
            { Value: this.strings.CONTROLS.TRANSPORTER_RADIO_LABEL, Text: this.strings.CONTROLS.TRANSPORTER_RADIO_LABEL },
            { Value: this.strings.CONTROLS.CONSIGNER_RADIO_LABEL, Text: this.strings.CONTROLS.CONSIGNER_RADIO_LABEL },
            { Value: this.strings.CONTROLS.CONSIGNEE_RADIO_LABEL, Text: this.strings.CONTROLS.CONSIGNEE_RADIO_LABEL },
            { Value: this.strings.CONTROLS.NEW_TRANSPORTER_RADIO_LABEL, Text: this.strings.CONTROLS.NEW_TRANSPORTER_RADIO_LABEL }
        ];

        this.state = {
            isAck: this.editData.HasTransporterAcknowledged == 1 ? true : false,
            driveBy: this.editData.DriveBy || this.strings.CONTROLS.TRANSPORTER_RADIO_LABEL,
            transporterFirstName: this.editData.TransporterFirstName || '',
            transporterLastName: this.editData.TransporterLastName || '',
            transporterDriverName: this.editData.TransporterDriverName || '',
            transporterVehicleRegoNumber: this.editData.VehicleRego || '',
            transporterAddVehicleRegoNumber: this.editData.AdditionalVehicleRego || '',
            transporterEmail: this.editData.TransporterEmail || '',
            transporterMobile: this.editData.TransporterMobile || '',
            transporterFax: this.editData.TransporterFax || '',
            transporterAddress: this.editData.TransporterAddress || '',
            transporterCompanyName: this.editData.TransporterCompanyName || '',
            transporterTelephone: this.editData.TransporterTelephone || '',
            suburbId: null,
            consignerContacts: [],
            consignerContactsReady: false,
            consigneeContacts: [],
            consigneeContactsReady: false,
            transporterContacts: [],
            tcKey: Math.random(),
            declarationName: this.editData.TransporterDriverName || '',
            firstNameReq: false,
            lastNameReq: false,
            disableSignature: true
        };

        this.signatureFile = {
            FileId: this.editData.TransporterSignatureId ? bufferToUUID(this.editData.TransporterSignatureId) : null,
            FileName: this.editData.TransporterFileName || '',
            MimeType: this.editData.TransporterFileMimeType || '',
            FilePath: this.editData.TransporterFilePath || ''
        }

        this.driverChange = this.driverChange.bind(this);
        this.getConsignerData = this.getConsignerData.bind(this);
        this.getConsigneeData = this.getConsigneeData.bind(this);
        this.onRadioChange = this.onRadioChange.bind(this);
        this.transporterSelected = this.transporterSelected.bind(this);
        this.onContactChange = this.onContactChange.bind(this);
        this.signatureChange = this.signatureChange.bind(this);
        this.clearFields = this.clearFields.bind(this);
        this.setFields = this.setFields.bind(this);
        this.acknowledgedChange = this.acknowledgedChange.bind(this);
        this.getData = this.getData.bind(this);
        this.firstNameChange = this.firstNameChange.bind(this);
        this.lastNameChange = this.lastNameChange.bind(this);
    }

    stateSet(stateObj) {
        if (this.mounted) {
            this.setState(stateObj);
        }
    }

    componentWillMount() {
        this.mounted = true;
        if (this.isModifyNVD && this.editData.TransporterCompanyId) {
            this.transporterSelected({ CompanyId: bufferToUUID(this.editData.TransporterCompanyId) }, true);
        }
    }

    componentDidMount() {
        if (this.isModifyNVD && this.editData.TransporterSuburbId)
            this.stateSet({ suburbId: this.editData.TransporterSuburbId });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    driverChange(value) {
        this.refs.transporterDriverName.updateInputStatus();
        this.stateSet({ declarationName: value });
    }

    getConsignerData() {
        let _this = this;
        getPropertyAccessContactList(this.props.ConsignedFromPICId, 0).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    consignerContacts: res.data, consignerContactsReady: true
                });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    getConsigneeData() {
        let _this = this;
        getPropertyAccessContactList(this.props.ConsignedToPICId, 0).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    consigneeContacts: res.data, consigneeContactsReady: true
                });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    onRadioChange(value, text) {
        if (value == this.strings.CONTROLS.CONSIGNER_RADIO_LABEL) {
            this.getConsignerData();
        }
        else if (value == this.strings.CONTROLS.CONSIGNEE_RADIO_LABEL) {
            this.getConsigneeData();
        }

        this.clearFields();
        this.stateSet({ driveBy: value, transporterContacts: [], tcKey: Math.random() });
    }

    transporterSelected(value, isInit) {
        if (value && typeof value != 'string') {
            let select = `c.UUID AS Id, c.FirstName, c.LastName, concat(c.FirstName, ' ', c.LastName) as Name`;
            let where = `c.CompanyId = fn_UuidToBin('${value.CompanyId}')`;
            let _this = this;
            getContactByCondition(select, '', where).then(function (res) {
                if (res.success) {
                    _this.stateSet({ transporterContacts: res.response, tcKey: Math.random() });
                    if (!isInit) _this.clearFields();
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.setState({ transporterContacts: [], tcKey: Math.random() });
            this.clearFields();
        }
    }

    onContactChange(value, text) {
        if (value) {
            let select = `c.FirstName, c.LastName, c.Email, c.Mobile, c.Telephone, c.Fax, c.VehicleRegNumber, 
                          c.BusinessAddress,
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
        stateObj.transporterFirstName = contact.FirstName || '';
        stateObj.transporterLastName = contact.LastName || '';
        stateObj.transporterDriverName = contact.FirstName ?
            stateObj.transporterFirstName.concat(' ', stateObj.transporterLastName) : '';
        stateObj.declarationName = stateObj.transporterDriverName;
        stateObj.transporterVehicleRegoNumber = contact.VehicleRegNumber || '';
        stateObj.transporterEmail = contact.Email || '';
        stateObj.transporterMobile = contact.Mobile || '';
        stateObj.transporterFax = contact.Fax || '';
        stateObj.transporterAddress = contact.BusinessAddress || '';
        stateObj.transporterCompanyName = contact.CompanyName || '';
        stateObj.transporterTelephone = contact.Telephone || '';
        stateObj.suburbId = contact.SuburbId ? bufferToUUID(contact.SuburbId) : null;
        stateObj.countryId = contact.CountryId ? bufferToUUID(contact.CountryId) : null;
        stateObj.disableSignature = false;
        if (contact.SignatureFileId) {
            downloadFile(contact.FilePath, contact.FileName, contact.MimeType).then(function (res) { })
            stateObj.isAck = true;
            this.editData.HasTransporterAcknowledged = 1;
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
            transporterAddress: '',
            transporterAddVehicleRegoNumber: '',
            transporterDriverName: '',
            declarationName: '',
            transporterEmail: '',
            transporterFax: '',
            transporterMobile: '',
            transporterVehicleRegoNumber: '',
            transporterFirstName: '',
            transporterLastName: '',
            transporterCompanyName: '',
            transporterTelephone: '',
            suburbId: null,
            countryId: this.props.authUser.CountryId ? bufferToUUID(this.props.authUser.CountryId) : null,
            disableSignature: true
        });
        this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
        this.editData.TransporterContactId = null;
        this.editData.TransporterCompanyId = null;
        this.editData.TCompanyName = null;
        this.editData.HasTransporterAcknowledged = 0;
        this.editData.TransporterAcknowledgedDate = null;
        this.editData.MovementCommenceDate = null;
    }

    signatureChange(obj) {
        if (this.isModifyNVD) this.editData.HasTransporterAcknowledged = 1;
        this.stateSet({ isAck: obj.file ? true : false });
    }

    acknowledgedChange(value) {
        this.setState({ isAck: value });
    }

    getData() {

        let tempSchema = [...this.transporterSchema];
        if (this.state.driveBy == this.strings.CONTROLS.CONSIGNER_RADIO_LABEL || this.state.driveBy == this.strings.CONTROLS.CONSIGNEE_RADIO_LABEL) {
            this.transporterSchema = tempSchema.filter((s) => {
                return s != 'transporterCompany' && s != 'transporterFirstName' &&
                    s != 'transporterLastName' && s != 'transporterCompanyName' && s != 'transporterTelephone';
            });
        }
        else if (this.state.driveBy == this.strings.CONTROLS.TRANSPORTER_RADIO_LABEL) {
            this.transporterSchema = tempSchema.filter((s) => {
                return s != 'transporterFirstName' &&
                    s != 'transporterLastName' && s != 'transporterCompanyName' && s != 'transporterTelephone';
            });
        }
        else if (this.state.driveBy == this.strings.CONTROLS.NEW_TRANSPORTER_RADIO_LABEL) {
            this.transporterSchema = tempSchema.filter((s) => {
                return s != 'transporterContact' && s != 'transporterCompany';
            });
        }

        let isFormValid = isValidForm(this.transporterSchema, this.refs);
        if (!isFormValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let transporterObj = getForm(this.transporterSchema, this.refs);
        // if (transporterObj.transporterContact && typeof transporterObj.transporterContact == 'string') {
        //     transporterObj.transporterContact = { Id: transporterObj.transporterContact };
        // }
        let fileObj = this.refs.transporterSignature.getValues();
        transporterObj.signatureObj = fileObj;
        transporterObj.transporterSuburbData = this.refs.transporterSuburb.state;

        return transporterObj;
    }

    firstNameChange(value) {
        let { transporterFirstName, transporterLastName } = this.refs;
        if (value)
            this.setState({ lastNameReq: true, firstNameReq: true, disableSignature: false });
        else if (!transporterLastName.fieldStatus.value) {
            this.setState({ lastNameReq: false, firstNameReq: false, disableSignature: true });
            transporterFirstName.updateInputStatus();
            transporterLastName.updateInputStatus();
        }
    }

    lastNameChange(value) {
        let { transporterFirstName, transporterLastName } = this.refs;
        if (value)
            this.setState({ lastNameReq: true, firstNameReq: true, disableSignature: false });
        else if (!transporterFirstName.fieldStatus.value) {
            this.setState({ lastNameReq: false, firstNameReq: false, disableSignature: true });
            transporterLastName.updateInputStatus();
            transporterFirstName.updateInputStatus();
        }
    }

    render() {
        let strings = this.strings.CONTROLS;
        return (
            <div className="row">
                {this.props.isPickupeNVD ?
                    null :
                    <div>
                        <div className='col-md-12'>
                            <div className="configure-head">
                                <span>{this.strings.TITLE}</span>
                            </div>
                        </div>
                        <div className="col-md-12 mt10 mb10">
                            <span>{strings.SUB_TITLE}</span>
                        </div>
                        <div className="col-md-12">
                            <RadioButton inputGroupProps={{ name: 'driveBy', defaultSelected: this.state.driveBy }}
                                dataSource={this.radioGroupDS}
                                disabled={this.editData.disableAll}
                                textField="Text" valueField="Value" horizontalAlign={true}
                                onChange={this.onRadioChange}
                                isClicked={this.props.isClicked} ref="driveBy" />
                        </div>
                    </div>}
                <div key={this.state.driveBy}>
                    <div className='col-md-6'>
                        <div className="row">
                            {this.state.driveBy == strings.TRANSPORTER_RADIO_LABEL ?
                                <div>
                                    <div className="col-md-12">
                                        <AutoComplete inputProps={{
                                            name: 'transporterCompany',
                                            hintText: strings.TRANSPORTER_COMAPNY_NAME_PLACEHOLDER,
                                            floatingLabelText: strings.TRANSPORTER_COMAPNY_NAME_LABEL,
                                            disabled: this.editData.disableAll
                                        }}
                                            selectedValue={this.editData.TransporterCompanyId ?
                                                bufferToUUID(this.editData.TransporterCompanyId) : null}
                                            searchText={this.editData.TCompanyName}
                                            textField="CompanyName" valueField="CompanyId" eInvalid={null}
                                            apiUrl="/api/private/contact/gettransporter?search=$$$"
                                            onSelectionChange={this.transporterSelected}
                                            isClicked={this.props.isClicked} ref='transporterCompany' />
                                    </div>
                                    <div className="col-md-12" key={this.state.tcKey}>
                                        <Dropdown inputProps={{
                                            name: 'transporterContact',
                                            hintText: strings.TRANSPORTER_NAME_PLACEHOLDER,
                                            floatingLabelText: strings.TRANSPORTER_NAME_LABEL,
                                            value: this.isModifyNVD && this.editData.TransporterContactId ?
                                                this.editData.TransporterContactId : null,
                                            disabled: this.editData.disableAll
                                        }}
                                            eReq={this.state.isAck || this.TransporterReq ? strings.TRANSPORTER_NAME_REQ_MESSAGE : null}
                                            onSelectionChange={this.onContactChange} callOnChange={true}
                                            textField="Name" valueField="Id" dataSource={this.state.transporterContacts}
                                            isClicked={this.props.isClicked} ref='transporterContact' />
                                    </div>
                                </div> : null}
                            {this.state.driveBy == strings.CONSIGNER_RADIO_LABEL ?
                                <div className="col-md-12">
                                    <Dropdown inputProps={{
                                        name: 'transporterContact',
                                        hintText: this.state.consignerContactsReady ? strings.TRANSPORTER_NAME_PLACEHOLDER : 'Loading...',
                                        floatingLabelText: strings.TRANSPORTER_NAME_LABEL,
                                        value: this.isModifyNVD && this.editData.TransporterContactId ?
                                            this.editData.TransporterContactId : null,
                                        disabled: this.editData.disableAll
                                    }}
                                        eReq={this.state.isAck || this.TransporterReq ? strings.TRANSPORTER_NAME_REQ_MESSAGE : null}
                                        onSelectionChange={this.onContactChange} callOnChange={true}
                                        textField="Name" valueField="Id" dataSource={this.state.consignerContacts}
                                        isClicked={this.props.isClicked} ref='transporterContact' />
                                </div> : null}
                            {this.state.driveBy == strings.CONSIGNEE_RADIO_LABEL ?
                                <div className="col-md-12">
                                    <Dropdown inputProps={{
                                        name: 'transporterContact',
                                        hintText: this.state.consigneeContactsReady ? strings.TRANSPORTER_NAME_PLACEHOLDER : 'Loading...',
                                        floatingLabelText: strings.TRANSPORTER_NAME_LABEL,
                                        value: this.isModifyNVD && this.editData.TransporterContactId ?
                                            this.editData.TransporterContactId : null,
                                        disabled: this.editData.disableAll
                                    }}
                                        eReq={this.state.isAck || this.TransporterReq ? strings.TRANSPORTER_NAME_REQ_MESSAGE : null}
                                        onSelectionChange={this.onContactChange} callOnChange={true}
                                        textField="Name" valueField="Id" dataSource={this.state.consigneeContacts}
                                        isClicked={this.props.isClicked} ref='transporterContact' />
                                </div> : null}
                            <div className={this.state.driveBy == strings.NEW_TRANSPORTER_RADIO_LABEL ? '' : 'hidden'}>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'transporterFirstName',
                                        hintText: strings.TRANSPORTER_FIRST_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.TRANSPORTER_FIRST_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        eReq={(this.state.firstNameReq || this.TransporterReq) && strings.NEW_TRANSPORTER_RADIO_LABEL
                                            ? strings.TRANSPORTER_FIRST_NAME_REQ_MESSAGE : null}
                                        updateOnChange={true} isLoading={false} callOnChange={true}
                                        onChangeInput={this.firstNameChange}
                                        maxLength={100} initialValue={this.state.transporterFirstName}
                                        isClicked={this.props.isClicked} ref='transporterFirstName' />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'transporterLastName',
                                        hintText: strings.TRANSPORTER_LAST_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.TRANSPORTER_LAST_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        eReq={(this.state.lastNameReq || this.TransporterReq) && strings.NEW_TRANSPORTER_RADIO_LABEL
                                            ? strings.TRANSPORTER_LAST_NAME_REQ_MESSAGE : null}
                                        updateOnChange={true} isLoading={false} callOnChange={true}
                                        onChangeInput={this.lastNameChange}
                                        maxLength={100} initialValue={this.state.transporterLastName}
                                        isClicked={this.props.isClicked} ref='transporterLastName' />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'transporterCompanyName',
                                        hintText: strings.COMPANY_NAME_PLACEHOLDER,
                                        floatingLabelText: strings.COMPANY_NAME_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={100} initialValue={this.state.transporterCompanyName}
                                        isClicked={this.props.isClicked} ref='transporterCompanyName' />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'transporterTelephone',
                                        hintText: strings.TELEPHONE_PLACEHOLDER,
                                        floatingLabelText: strings.TELEPHONE_LABEL,
                                        disabled: this.editData.disableAll
                                    }}
                                        updateOnChange={true}
                                        maxLength={100} initialValue={this.state.transporterTelephone}
                                        isClicked={this.props.isClicked} ref='transporterTelephone' />

                                </div>
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'transporterDriverName',
                                    hintText: strings.DRIVER_NAME_PLACEHOLDER,
                                    floatingLabelText: strings.DRIVER_NAME_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true} onChangeInput={this.driverChange}
                                    maxLength={100} initialValue={this.state.transporterDriverName}
                                    isClicked={this.props.isClicked} ref='transporterDriverName' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'transporterVehicleRegoNumber',
                                    hintText: strings.VEHICLE_REGO_NUMBER_PLACEHOLDER,
                                    floatingLabelText: strings.VEHICLE_REGO_NUMBER_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.transporterVehicleRegoNumber}
                                    isClicked={this.props.isClicked} ref='transporterVehicleRegoNumber' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'transporterAddVehicleRegoNumber',
                                    hintText: strings.ADDITIONAL_VEHICLE_REGO_PLACEHOLDER,
                                    floatingLabelText: strings.ADDITIONAL_VEHICLE_REGO_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.transporterAddVehicleRegoNumber}
                                    isClicked={this.props.isClicked} ref='transporterAddVehicleRegoNumber' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'transporterEmail',
                                    hintText: strings.EMAIL_PLACEHOLDER,
                                    floatingLabelText: strings.EMAIL_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    eInvalid={strings.EMAIL_VALIDATE_MESSAGE}
                                    maxLength={100} initialValue={this.state.transporterEmail}
                                    isClicked={this.props.isClicked} ref='transporterEmail' />
                            </div>
                            <div className="col-md-12">
                                <NumberInput inputProps={{
                                    name: 'transporterMobile',
                                    hintText: strings.MOBILE_NUMBER_PLACEHOLDER,
                                    floatingLabelText: strings.MOBILE_NUMBER_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.transporterMobile}
                                    isClicked={this.props.isClicked} ref='transporterMobile' />
                            </div>
                            <div className="col-md-12">
                                <NumberInput inputProps={{
                                    name: 'transporterFax',
                                    hintText: strings.FAX_PLACEHOLDER,
                                    floatingLabelText: strings.FAX_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true}
                                    maxLength={20} initialValue={this.state.transporterFax}
                                    isClicked={this.props.isClicked} ref='transporterFax' />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'transporterAddress',
                                    hintText: strings.ADDRESS_PLACEHOLDER,
                                    floatingLabelText: strings.ADDRESS_LABEL,
                                    disabled: this.editData.disableAll
                                }}
                                    maxLength={200} initialValue={this.state.transporterAddress}
                                    multiLine={true} updateOnChange={true}
                                    isClicked={this.props.isClicked} ref='transporterAddress' />
                            </div>
                            <div className="col-md-12">
                                <SuburbAutoComplete suburbName='transporterSuburb' ref='transporterSuburb'
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
                                        isSignature={true}
                                        isSignaturePad={true} isDisabled={this.editData.disableAll || this.state.disableSignature}
                                        strings={this.strings.COMMON}
                                        notifyToaster={this.notifyToaster}
                                        data={this.signatureFile} getDataOnUpload={this.signatureChange}
                                        picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref='transporterSignature' />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <CheckBox inputProps={{
                                    name: 'acknowledged',
                                    label: strings.TRANSPORTER_ACKNOWLEDGED_LABEL,
                                    defaultChecked: this.isModifyNVD ?
                                        this.editData.HasTransporterAcknowledged == 1 ? true : false : this.state.isAck,
                                    disabled: this.editData.disableAll
                                }}
                                    updateOnChange={true} eReq={this.AckReq}
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
                                    defaultValue={this.isModifyNVD && this.editData.TransporterAcknowledgedDate ?
                                        new Date(this.editData.TransporterAcknowledgedDate) : this.state.isAck ? new Date() : undefined}
                                    isClicked={this.props.isClicked} ref='acknowledgedate' />
                            </div>
                            <div className="col-md-12">
                                <DateTimePicker inputProps={{
                                    name: 'movementCommenceDate',
                                    placeholder: strings.MOVEMENT_DATE_PLACEHOLDER,
                                    label: strings.MOVEMENT_DATE_LABEL,
                                    disabled: !this.state.isAck || this.editData.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY' updateOnChange={true}
                                    dateFilter={{ minDate: new Date(-8640000000000000), maxDate: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)) }}
                                    defaultValue={this.isModifyNVD && this.editData.MovementCommenceDate ?
                                        new Date(this.editData.MovementCommenceDate) : this.state.isAck ? new Date() : undefined}
                                    isClicked={this.props.isClicked} ref='movementCommenceDate' />
                            </div>
                            {this.state.isAck ? <div className="col-md-12">
                                <div className="mt10" style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', textJustify: 'inter-word' }} dangerouslySetInnerHTML={{
                                    __html: strings.DECLARATION_TEXT.replace('<<Driver Name>>', this.state.declarationName).
                                        replace(/<<NVDType>>/g, this.props.eNVDCommonDetails.nvdTypeName)
                                }}>
                                </div>
                            </div> : null}

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Transporter;