'use strict';

/**************************
 * tab component of NFAS
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../../lib/wrapper-components/FileUpload';
import RadioButton from '../../../../../lib/core-components/RadioButton';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';
import ContactAutoComplete from '../../../../../lib/wrapper-components/ContactAutoComplete';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import NumberInput from '../../../../../lib/core-components/NumberInput';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { nvdAccredQue } from '../../../../../../shared/constants';
import { bufferToUUID } from '../../../../../../shared/uuid/index';
import { downloadFile } from '../../../../../services/private/common';

class TabNFAS extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            name: null
        }

        this.getValues = this.getValues.bind(this);
        this.onContactChange = this.onContactChange.bind(this);

        this.fedAtNFASForDays = [
            { Value: 'DOF', Text: this.strings.DOF },
            { Value: 'Days60', Text: this.strings.Days60 },
            { Value: 'Days70', Text: this.strings.Days70 },
            { Value: 'Days100', Text: this.strings.Days100 }
        ];

        this.nfasSchema = [nvdAccredQue.nfasFedAtNFASFeelot, nvdAccredQue.nfasCertiNo,
        nvdAccredQue.nfasDate, nvdAccredQue.nfasSlaughterDate];

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
                if (element.AgliveFileId && element.DataId == nvdAccredQue.nfasSignature) {
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
            this.setState({ name: this.dataObj[nvdAccredQue.nfasName] || '' });
        }
    }

    // set contact value on change of contact selection
    onContactChange(value) {
        let name = null;
        if (!value) {
            this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
            name = null;
        }
        else if (typeof (value) == 'string' || !value.Id) {
            this.signatureFile = { FileId: null, FileName: '', MimeType: '', FilePath: '' };
            name = value;
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
            name = value.Name;
        }
        this.setState({ name: name });
    }

    getValues() {
        let isValid = isValidForm(this.nfasSchema, this.refs);
        if (!isValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.nfasSchema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let newObj = {
                AccreditationProgramId: _this.props.accreditationProgramId,
                DataId: key,
                Value: obj[key],
                AgliveFile: null,
                AgliveFileId: null
            }
            finalObj.push(newObj);
        });

        // Object for Name(Print)
        let newObj = {
            AccreditationProgramId: this.props.accreditationProgramId,
            DataId: nvdAccredQue.nfasName,
            Value: this.state.name,
            AgliveFile: null,
            AgliveFileId: null
        }
        finalObj.push(newObj);

        // Object for signature upload
        let fileObj = this.refs[nvdAccredQue.nfasSignature].getValues();
        if (fileObj.file && fileObj.deletedFile) {
            //fileObj.deletedFile = null;
            fileObj.fileId = null;
        }
        let signatureObj = {
            AccreditationProgramId: this.props.accreditationProgramId,
            DataId: nvdAccredQue.nfasSignature,
            Value: null,
            AgliveFile: (fileObj.file && fileObj.fileId == null) ? fileObj : null,//fileObj.file ? (fileObj.fileId ? null : fileObj) : null,
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
                    <th>Dentition</th>
                    <th>Minimum Days On Feed</th>
                </tr>
            </thead>
            <tbody>
                {this.summaryData.map((d, i) => {
                    return <tr key={i}>
                        <td>{d.Mob}</td>
                        <td>{d.NumberOfHead}</td>
                        <td>{d.Description}</td>
                        <td>
                            <Dropdown inputProps={{
                                name: 'dentition_' + d.SummaryId,
                                hintText: this.strings.DENTITION_PLACEHOLDER,
                                floatingLabelText: this.strings.DENTITION_LABEL,
                                value: d.NFAS_DentitionId ?
                                    bufferToUUID(d.NFAS_DentitionId) : null,
                                disabled: this.props.disableAll
                            }}
                                callOnChange={true} onSelectionChange={(value, text) => { d.DentitionId = value; }}
                                textField="DentitionName" valueField="Id" dataSource={this.props.dentition}
                                isClicked={this.props.isClicked} ref={"dentition_" + d.SummaryId} />
                        </td>
                        <td>
                            <NumberInput inputProps={{
                                name: 'daysonfeed_' + d.SummaryId,
                                hintText: this.strings.MINIMUM_DAYS_ON_FEED_PLACEHOLDER,
                                floatingLabelText: this.strings.MINIMUM_DAYS_ON_FEED_LABEL,
                                disabled: this.props.disableAll
                            }}
                                maxLength={10} initialValue={d.NFAS_DaysOnFeed || ''}
                                onBlurInput={(value) => { d.DaysOnFeed = value; this.refs["daysonfeed_" + d.SummaryId].setState({ error: null, isLoading: false }); }}
                                isClicked={this.props.isClicked} ref={"daysonfeed_" + d.SummaryId} />
                        </td>
                    </tr>
                })}
            </tbody>
        </table >
    }

    render() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        return (<div>
            <div className="que-box">
                <div className="que-numb">1)</div>
                <div className="que-text-box">
                    <div>{strings.QUE_1} {/*<span className="mandatory-star">*</span>*/}</div>
                    <div className="que-text-ans">
                        <RadioButton inputGroupProps={{
                            name: nvdAccredQue.nfasFedAtNFASFeelot,
                            defaultSelected: this.dataObj[nvdAccredQue.nfasFedAtNFASFeelot]
                        }}
                            disabled={this.props.disableAll}
                            // eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                            dataSource={this.fedAtNFASForDays}
                            textField="Text" valueField="Value"
                            isClicked={isClicked} ref={nvdAccredQue.nfasFedAtNFASFeelot} />
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
            <div className="clearfix" />
            <div className="col-xs-12 tbl-questionnaire">{this.renderGrid()}</div>
            <div className="clearfix" />
            <div className="que-box">
                <div className="mt30">{this.strings.DECLARATION}</div>
                <div className="row">
                    <div className="col-md-5">
                        <ContactAutoComplete inputProps={{
                            name: nvdAccredQue.nfasName,
                            hintText: this.strings.NAME,
                            floatingLabelText: this.strings.NAME,
                            disabled: this.props.disableAll
                        }}
                            eInvalid={null}
                            selectedObj={this.dataObj[nvdAccredQue.nfasName] || ''}
                            targetKey={nvdAccredQue.nfasName}
                            appendUrl={"&companyid=" + this.props.companyId}
                            companyName={this.props.companyName}
                            isClicked={isClicked}
                            findContact={this.props.findContact}
                            openFindContact={this.props.openFindContact}
                            onSelectionChange={this.onContactChange} />
                    </div>
                    <div className="col-md-4">
                        <Input inputProps={{
                            name: nvdAccredQue.nfasCertiNo,
                            hintText: strings.CERTIFICATE_NO,
                            floatingLabelText: strings.CERTIFICATE_NO,
                            disabled: this.props.disableAll
                        }}
                            initialValue={this.dataObj[nvdAccredQue.nfasCertiNo] || ''}
                            isClicked={isClicked} ref={nvdAccredQue.nfasCertiNo} />
                    </div>
                    <div className="col-md-3">

                    </div>
                </div>
                <div className="row">
                    <div key={this.signatureFile.FileId} className="col-md-5">
                        <FileUpload
                            isSignature={true}
                            isSignaturePad={true} isDisabled={this.props.disableAll}
                            strings={strings.COMMON}
                            notifyToaster={this.notifyToaster}
                            data={this.signatureFile}
                            picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref={nvdAccredQue.nfasSignature} />
                    </div>
                    <div className="col-md-4">
                        <DateTimePicker inputProps={{
                            name: nvdAccredQue.nfasDate,
                            placeholder: strings.DATE,
                            label: strings.DATE,
                            disabled: this.props.disableAll
                        }}
                            dateFormat='DD/MM/YYYY' timeFormat={false}
                            defaultValue={this.dataObj[nvdAccredQue.nfasDate] ? new Date(this.dataObj[nvdAccredQue.nfasDate]) : undefined}
                            dateFilter={{ isBefore: true, isIncludeToday: true }}
                            isClicked={isClicked} ref={nvdAccredQue.nfasDate} />
                    </div>
                    <div className="col-md-3">
                        <DateTimePicker inputProps={{
                            name: nvdAccredQue.nfasSlaughterDate,
                            placeholder: strings.SLAUGHTER_DATE,
                            label: strings.SLAUGHTER_DATE,
                            disabled: this.props.disableAll
                        }}
                            dateFormat='DD/MM/YYYY' timeFormat={false}
                            dateFilter={{ isBefore: true, isIncludeToday: true }}
                            defaultValue={this.dataObj[nvdAccredQue.nfasSlaughterDate] ?
                                new Date(this.dataObj[nvdAccredQue.nfasSlaughterDate]) : undefined}
                            isClicked={isClicked} ref={nvdAccredQue.nfasSlaughterDate} />
                    </div>
                </div>
            </div>
        </div>);
    }
}
export default TabNFAS;