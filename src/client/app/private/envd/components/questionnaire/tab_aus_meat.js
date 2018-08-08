'use strict';

/**************************
 * tab component of AUS-MEAT
 * **************************** */

import React, { Component } from 'react';

import FileUpload from '../../../../../lib/wrapper-components/FileUpload';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';

import { getForm } from '../../../../../lib/wrapper-components/FormActions';
import { nvdAccredQue } from '../../../../../../shared/constants';
import { bufferToUUID } from '../../../../../../shared/uuid/index';
import { downloadFile } from '../../../../../services/private/common';

class TabAUSMEAT extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.getValues = this.getValues.bind(this);
        this.ausMeatSchema = [nvdAccredQue.ausMeatRecordDays, nvdAccredQue.ausMeatDate,
        nvdAccredQue.ausMeatName, nvdAccredQue.ausMeatSlaughterDate];
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
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;
                if (element.AgliveFileId && element.DataId == nvdAccredQue.ausMeatSignature) {
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

    getValues() {
        let obj = getForm(this.ausMeatSchema, this.refs);

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

        // Object for signature upload
        let fileObj = this.refs[nvdAccredQue.ausMeatSignature].getValues();
        if (fileObj.file && fileObj.deletedFile) {
            fileObj.fileId = null;
        }
        let signatureObj = {
            AccreditationProgramId: this.props.accreditationProgramId,
            DataId: nvdAccredQue.ausMeatSignature,
            Value: null,
            AgliveFile: (fileObj.file && fileObj.fileId == null) ? fileObj : null,// fileObj.file ? fileObj : null,
            AgliveFileId: fileObj.file ? (fileObj.fileId ? fileObj.fileId : null) : null
        }
        finalObj.push(signatureObj);

        return finalObj;
    }

    render() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        return (<div style={{ margin: '10px' }}>

            <div style={{ borderBottom: '1px solid #769277', margin: '0 0 15px 0', lineHeight: '35px' }}>
                {strings.LIVESTOCK_DECLARATION_LABEL}
            </div>
            <div style={{ lineHeight: '30px', fontSize: '13px' }}>{strings.LINE_1}</div>
            <div style={{ lineHeight: '30px', fontSize: '13px' }}>
                <div className="col-sm-4 pull-left mr10">
                    <NumberInput inputProps={{
                        name: nvdAccredQue.ausMeatRecordDays,
                        hintText: strings.RECORD_DAYS,
                        floatingLabelText: strings.RECORD_DAYS,
                        disabled: this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj['1230'] || ''}
                        isClicked={isClicked} ref={nvdAccredQue.ausMeatRecordDays} /></div>{strings.LINE_2}
            </div>
            <div className="clearfix mb15" />

            <div className="col-sm-6">
                <FileUpload
                    isSignature={true}
                    isSignaturePad={true} isDisabled={this.props.disableAll}
                    strings={strings.COMMON}
                    notifyToaster={this.notifyToaster}
                    data={this.signatureFile}
                    picDelSuccess={strings.SIGNATURE_DELETE_SUCCESS} ref={nvdAccredQue.ausMeatSignature} />
            </div>
            <div className="col-sm-6">
                <DateTimePicker inputProps={{
                    name: nvdAccredQue.ausMeatDate,
                    placeholder: strings.DATE,
                    label: strings.DATE,
                    disabled: this.props.disableAll
                }}
                    dateFormat='DD/MM/YYYY' timeFormat={false}
                    defaultValue={this.dataObj['1250'] ? new Date(this.dataObj['1250']) : undefined}
                    isClicked={isClicked} ref={nvdAccredQue.ausMeatDate} />
            </div>
            <div className="clearfix mb15" />

            <div className="col-sm-6">
                <Input inputProps={{
                    name: nvdAccredQue.ausMeatName,
                    hintText: strings.NAME,
                    floatingLabelText: strings.NAME,
                    disabled: this.props.disableAll
                }}
                    initialValue={this.dataObj['1260'] || ''}
                    isClicked={isClicked} ref={nvdAccredQue.ausMeatName} />
            </div>
            <div className="col-sm-6">
            </div>
            <div className="clearfix" />

            <div style={{ borderBottom: '1px solid #769277', margin: '10px 0 15px 0', lineHeight: '35px' }}>
                {strings.ABATTOIR_TO_COMPLETE_LABEL}
            </div>

            <div style={{ lineHeight: '30px', fontSize: '13px' }} className="col-sm-6">
                {strings.LINE_3}<br />
                {strings.LINE_4}<br />
                {strings.LINE_5}<br />
                {strings.LINE_6}
            </div>
            <div className="col-sm-6">
                <DateTimePicker inputProps={{
                    name: nvdAccredQue.ausMeatSlaughterDate,
                    placeholder: strings.SLAUGHTER_DATE,
                    label: strings.SLAUGHTER_DATE,
                    disabled: this.props.disableAll
                }}
                    dateFormat='DD/MM/YYYY' timeFormat={false}
                    defaultValue={this.dataObj['1270'] ? new Date(this.dataObj['1270']) : undefined}
                    isClicked={isClicked} ref={nvdAccredQue.ausMeatSlaughterDate} />
            </div>
            <div className="clearfix" />
        </div>);
    }
}

export default TabAUSMEAT;