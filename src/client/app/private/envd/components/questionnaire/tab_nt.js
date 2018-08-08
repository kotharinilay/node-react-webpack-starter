'use strict';

/**************************
 * tab component of NT
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../../lib/wrapper-components/FileUpload';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';
import AutoComplete from '../../../../../lib/core-components/AutoComplete';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import ContactAutoComplete from '../../../../../lib/wrapper-components/ContactAutoComplete';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { nvdAccredQue } from '../../../../../../shared/constants';
import { bufferToUUID } from '../../../../../../shared/uuid/index';
import { downloadFile } from '../../../../../services/private/common';

class TabNT extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            phoneNumber: ''
        }

        this.getValues = this.getValues.bind(this);
        this.onContactChange = this.onContactChange.bind(this);

        this.ntSchema = [nvdAccredQue.ntLastAccess, nvdAccredQue.ntMovementToArea, nvdAccredQue.ntMovementFor,
        nvdAccredQue.ntSignatureDate, nvdAccredQue.ntPhoneNumber];
        this.biosecurityOfficer = null;

        this.renderGrid = this.renderGrid.bind(this);
        this.summaryData = this.props.isModifyNVD ? this.props.editData.livestockSummaryData : this.props.livestockSummaryData;

        this.signatureFile = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        }
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '';
        if (this.props.editData.accreditationQuestionnireData.length > 0) {
            this.props.editData.accreditationQuestionnireData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;
                if (element.AgliveFileId && element.DataId == nvdAccredQue.ntSignature) {
                    // download file from s3 for storage
                    downloadFile(element.AccreditaionFilePath, element.AccreditaionFileName, element.MimeType).then(function (res) { })
                    this.signatureFile = {
                        FileId: this.props.isModifyNVD ? bufferToUUID(element.AgliveFileId) : null,
                        FileName: element.AccreditaionFileName,
                        MimeType: element.MimeType,
                        FilePath: element.AccreditaionFilePath
                    }
                }
            }, this);
        }
    }

    // set contact value on change of contact selection
    onContactChange(value) {
        let phoneNumber = '';
        if (!value) {
            this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
            this.biosecurityOfficer = null;
        }
        else if (typeof (value) == 'string' || !value.Id) {
            this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
            this.biosecurityOfficer = value;
        }
        else {
            if (value.SignatureFileId) {
                this.signatureFile = {
                    FileId: bufferToUUID(value.SignatureFileId),
                    FileName: value.FileName,
                    MimeType: value.MimeType,
                    FilePath: value.FilePath
                }
            }
            phoneNumber = value.Mobile;
            this.biosecurityOfficer = value.Name;
        }
        this.setState({ phoneNumber: phoneNumber });
    }

    getValues() {
        let obj = getForm(this.ntSchema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let newObj = {
                AccreditationProgramId: null,
                DataId: key,
                Value: obj[key],
                AgliveFile: null,
                AgliveFileId: null
            }
            finalObj.push(newObj);
        });

        // Object for biosecurity officer
        let newObj = {
            AccreditationProgramId: null,
            DataId: nvdAccredQue.ntBiosecurityOfficer,
            Value: this.biosecurityOfficer,
            AgliveFile: null,
            AgliveFileId: null
        }
        finalObj.push(newObj);

        // Object for signature upload
        let fileObj = this.refs[nvdAccredQue.ntSignature].getValues();
        if (fileObj.file && fileObj.deletedFile) {
            // fileObj.deletedFile = null;
            fileObj.fileId = null;
        }
        let signatureObj = {
            AccreditationProgramId: null,
            DataId: nvdAccredQue.ntSignature,
            Value: null,
            AgliveFile: (fileObj.file && fileObj.fileId == null) ? fileObj : null,// fileObj.file ? (fileObj.fileId ? null : fileObj) : null,
            AgliveFileId: fileObj.file ? (fileObj.fileId ? fileObj.fileId : null) : null
        }
        finalObj.push(signatureObj);

        return {
            data: finalObj,
            summaryData: this.summaryData
        };
    }

    renderGrid() {
        return <table className="mt30 table table-hover table-bordered">
            <thead>
                <tr>
                    <th>Mob</th>
                    <th>Number of Livestock</th>
                    <th>Description</th>
                    <th>Chemical</th>
                    <th>Method of Treatment</th>
                </tr>
            </thead>
            <tbody>
                {this.summaryData.map((d, i) => {
                    return <tr key={i}>
                        <td>{d.Mob}</td>
                        <td>{d.NumberOfHead}</td>
                        <td>{d.Description}</td>
                        <td>
                            <AutoComplete inputProps={{
                                name: 'chemical_' + d.SummaryId,
                                hintText: this.strings.CHEMICAL_PRODUCT_PLACEHOLDER,
                                floatingLabelText: this.strings.CHEMICAL_PRODUCT_LABEL,
                                disabled: this.props.disableAll
                            }}
                                eInvalid={null} selectedObj={d.NT_Chemical || ''}
                                textField="Name" valueField="Id"
                                apiUrl={"/api/private/chemicalproduct/getlist?search=$$$&topPIC=" + this.props.topPIC + "&speciesId=" + this.props.speciesId}
                                onSelectionChange={(value) => { d.Chemical = typeof value == 'string' ? value : (value.Name || ''); }}
                                isClicked={this.props.isClicked} ref={'chemical_' + d.SummaryId} />
                        </td>
                        <td>
                            <AutoComplete inputProps={{
                                name: 'treatmentmethod_' + d.SummaryId,
                                hintText: this.strings.TREATMENT_METHOD_PLACEHOLDER,
                                floatingLabelText: this.strings.TREATMENT_METHOD_LABEL,
                                disabled: this.props.disableAll
                            }}
                                eInvalid={null} selectedObj={d.NT_TreatmentMethod || ''}
                                textField="Name" valueField="Id"
                                apiUrl={"/api/private/treatmentmethod/getlist?search=$$$&topPIC=" + this.props.topPIC}
                                onSelectionChange={(value) => { d.TreatmentMethod = typeof value == 'string' ? value : (value.Name || ''); }}
                                isClicked={this.props.isClicked} ref={'treatmentmethod_' + d.SummaryId} />
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    }

    render() {

        let strings = this.strings;
        let isClicked = this.props.isClicked;

        return (<div>
            <div className="col-xs-12 tbl-questionnaire">{this.renderGrid()}</div>
            <div className="clearfix" />


            <div className="row">
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <DateTimePicker inputProps={{
                                    name: nvdAccredQue.ntLastAccess,
                                    placeholder: strings.LAST_ACCESS_TO_WATER,
                                    label: strings.LAST_ACCESS_TO_WATER,
                                    disabled: this.props.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY'
                                    dateFilter={{ isBefore: true, isIncludeToday: true }}
                                    defaultValue={this.dataObj[nvdAccredQue.ntLastAccess] ?
                                        new Date(this.dataObj[nvdAccredQue.ntLastAccess]) : undefined}
                                    isClicked={isClicked} ref={nvdAccredQue.ntLastAccess} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <Input inputProps={{
                                    name: nvdAccredQue.ntMovementToArea,
                                    hintText: strings.MOVEMENT_TO_AREA_PLACEHOLDER,
                                    floatingLabelText: strings.MOVEMENT_TO_AREA_LABEL,
                                    disabled: this.props.disableAll
                                }}
                                    initialValue={this.dataObj[nvdAccredQue.ntMovementToArea] || ''}
                                    isClicked={isClicked} ref={nvdAccredQue.ntMovementToArea} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <Input inputProps={{
                                    name: nvdAccredQue.ntMovementFor,
                                    hintText: strings.MOVEMENT_FOR_PLACEHOLDER,
                                    floatingLabelText: strings.MOVEMENT_FOR_LABEL,
                                    disabled: this.props.disableAll
                                }}
                                    initialValue={this.dataObj[nvdAccredQue.ntMovementFor] || ''}
                                    isClicked={isClicked} ref={nvdAccredQue.ntMovementFor} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="clearfix" />

            <div className="row">
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <ContactAutoComplete inputProps={{
                                    name: nvdAccredQue.ntBiosecurityOfficer,
                                    hintText: this.strings.BIOSECURITY_OFFICER_PLACEHOLDER,
                                    floatingLabelText: this.strings.BIOSECURITY_OFFICER_LABEL,
                                    disabled: this.props.disableAll
                                }}
                                    eInvalid={null}
                                    selectedObj={this.dataObj[nvdAccredQue.ntBiosecurityOfficer] || ''}
                                    targetKey={nvdAccredQue.ntBiosecurityOfficer}
                                    appendUrl={"&companyid=" + this.props.companyId}
                                    companyName={this.props.companyName}
                                    isClicked={isClicked}
                                    findContact={this.props.findContact}
                                    openFindContact={this.props.openFindContact}
                                    onSelectionChange={this.onContactChange} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <NumberInput inputProps={{
                                    name: nvdAccredQue.ntPhoneNumber,
                                    hintText: strings.PHONE_NUMBER_PLACEHOLDER,
                                    floatingLabelText: strings.PHONE_NUMBER_LABEL,
                                    disabled: this.props.disableAll
                                }}
                                    initialValue={this.dataObj[nvdAccredQue.ntPhoneNumber] || this.state.phoneNumber} updateOnChange={true}
                                    isClicked={isClicked} ref={nvdAccredQue.ntPhoneNumber} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                </div>
            </div>
            <div className="clearfix" />

            <div className="row">
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div key={this.signatureFile.FileId} className="que-text-ans">
                                <FileUpload
                                    isSignature={true} isDisabled={this.props.disableAll}
                                    isSignaturePad={true}
                                    strings={strings.COMMON}
                                    notifyToaster={this.notifyToaster}
                                    data={this.signatureFile}
                                    picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref={nvdAccredQue.ntSignature} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="que-box">
                        <div className="que-text-box">
                            <div className="que-text-ans">
                                <DateTimePicker inputProps={{
                                    name: nvdAccredQue.ntSignatureDate,
                                    placeholder: strings.SIGNATURE_DATE,
                                    label: strings.SIGNATURE_DATE,
                                    disabled: this.props.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY'
                                    dateFilter={{ isBefore: true, isIncludeToday: true }}
                                    defaultValue={this.dataObj[nvdAccredQue.ntSignatureDate] ?
                                        new Date(this.dataObj[nvdAccredQue.ntSignatureDate]) : undefined}
                                    isClicked={isClicked} ref={nvdAccredQue.ntSignatureDate} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                </div>
            </div>
            <div className="clearfix" />

        </div>);
    }
}
export default TabNT;