'use strict';

/**************************
 * tab component of Documents
 * **************************** */

import React, { Component } from 'react';

import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';
import DocumentUpload from '../../../../../lib/wrapper-components/DocumentUpload';
import Button from '../../../../../lib/core-components/Button';
import Grid from '../../../../../lib/core-components/Grid';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { newUUID, bufferToUUID } from '../../../../../../shared/uuid/index';

class TabDocuments extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            key: Math.random(),
            docData: [],
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Id' },
                { field: 'AuditLogId', displayName: 'AuditLogId' },
                { field: 'IsDeleted', displayName: 'IsDeleted' },
                { field: 'DocumentType', displayName: 'Document Type', visible: true },
                { field: 'DocumentNo', displayName: 'Document No', visible: true },
                { field: 'OfficeOfIssue', displayName: 'Office Of Issue', visible: true },
                { field: 'ExpiryDate', displayName: 'Expiry Date', format: 'dateformat', visible: true },
                { field: 'FileId', displayName: 'FileId', visible: false },
                { field: 'DocumentFileName', displayName: 'DocumentFileName', visible: false },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'deleteformat' }
            ]
        }

        this.getValues = this.getValues.bind(this);
        this.addData = this.addData.bind(this);
        this.deleteDoc = this.deleteDoc.bind(this);
        this.clearData = this.clearData.bind(this);

        this.docSchema = ['DocumentType', 'DocumentNo', 'OfficeOfIssue', 'ExpiryDate'];
        this.docFile = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        }
    }

    componentWillMount() {
        if (this.props.editData.length > 0) {
            let docData = [];
            this.props.editData.forEach(function (element) {
                let obj = {
                    NewEntry: false,
                    UpdateEntry: false,
                    IsDeleted: 0,
                    Id: element.DocumentId,
                    AuditLogId: bufferToUUID(element.AuditLogId),
                    DocumentType: element.DocumentType || '',
                    DocumentNo: element.DocumentNo || '',
                    OfficeOfIssue: element.OfficeOfIssue || '',
                    ExpiryDate: element.ExpiryDate ? new Date(element.ExpiryDate) : undefined,
                    FileId: element.FileId,
                    DocumentFileName: element.DocumentFileName
                }
                docData.push(obj);
            }, this);
            this.setState({ docData: docData });
        }
    }

    addData() {
        let docFile = this.refs.docFile.getValues();
        if (!docFile.file) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let obj = getForm(this.docSchema, this.refs);
        obj.DocFile = docFile;
        obj.NewEntry = true;
        obj.IsDeleted = 0;
        obj.Id = newUUID();
        obj.AuditLogId = newUUID();

        let data = [...this.state.docData]
        data.push(obj);
        this.setState({ docData: data, key: Math.random() });
    }

    // Delete document from grid on confirmation
    deleteDoc(id) {
        let gridData = [];
        this.state.docData.map((f) => {
            if (f.Id == id) {
                f.IsDeleted = 1;
                f.UpdateEntry = true;
                if (f.NewEntry != true)
                    gridData.push(f);
            }
            else
                gridData.push(f);
        });
        this.setState({ docData: gridData });
    }

    clearData() {
        this.setState({ key: Math.random() });
    }

    getValues() {
        return this.state.docData;
    }

    render() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.state.docData.filter(s => { return s.IsDeleted == 0 }),
            selectRowMode: "none",
            deleteClick: this.deleteDoc
        }

        return (<div className="que-box">
            <div className="row">
                <div className="col-md-4" key={this.state.key}>
                    <Input inputProps={{
                        name: 'DocumentType',
                        hintText: strings.DOC_TYPE,
                        floatingLabelText: strings.DOC_TYPE,
                        disabled: this.props.disableAll
                    }}
                        isClicked={isClicked} ref='DocumentType' />
                    <Input inputProps={{
                        name: 'DocumentNo',
                        hintText: strings.DOC_NO,
                        floatingLabelText: strings.DOC_NO,
                        disabled: this.props.disableAll
                    }}
                        isClicked={isClicked} ref='DocumentNo' />
                    <Input inputProps={{
                        name: 'OfficeOfIssue',
                        hintText: strings.OFFICE_OF_ISSUE,
                        floatingLabelText: strings.OFFICE_OF_ISSUE,
                        disabled: this.props.disableAll
                    }}
                        isClicked={isClicked} ref='OfficeOfIssue' />
                    <DateTimePicker inputProps={{
                        name: 'ExpiryDate',
                        placeholder: strings.EXPIRY_DATE,
                        label: strings.EXPIRY_DATE,
                        disabled: this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        isClicked={isClicked} ref='ExpiryDate' />
                    <div className="clearfix mt20" />
                    <DocumentUpload
                        strings={strings.COMMON} disabled={this.props.disableAll}
                        notifyToaster={this.notifyToaster}
                        label={this.strings.DOC_FILE_LABEL}
                        data={this.docFile} ref="docFile" />
                    <div className="clearfix mt20" />
                    <Button
                        inputProps={{
                            name: 'btnAdd',
                            label: strings.ADD_LABEL,
                            className: 'button2Style button30Style mr10',
                            disabled: this.props.disableAll
                        }}
                        onClick={this.addData} ></Button>
                    <Button
                        inputProps={{
                            name: 'btnClear',
                            label: strings.CLEAR_LABEL,
                            className: 'button1Style button30Style',
                            disabled: this.props.disableAll
                        }}
                        onClick={this.clearData} ></Button>
                </div>
                <div className="col-md-8">
                    <Grid {...gridProps} />
                </div>
            </div>
        </div>);
    }
}
export default TabDocuments;