'use strict';

/**************************
 * Upload image file with delete functionality
 * **************************** */

import React, { Component } from 'react';
import Button from '../core-components/Button';
import { deleteFile, uploadFile } from '../../services/private/common';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../app/common/actiontypes';
import encoding from 'text-encoding';

class DocumentUpload extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.data = this.props.data || {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        };

        this.state = {
            file: this.data && this.data['FilePath'] ? {
                name: this.data['FileName'],
                type: this.data['MimeType']
            } : null,
            deletedFile: null,
            docPreview: this.props.data && this.props.data.FileId ? this.props.data.FileName : null
        }

        this.file = null;
        this.CHUNK_SIZE = 10000;
        this.columnHeader = [];

        this.uploadFileClick = this.uploadFileClick.bind(this);
        this.deleteFileClick = this.deleteFileClick.bind(this);
        this.fileChange = this.fileChange.bind(this);

    }

    // Handle upload file click event
    uploadFileClick() {
        this.file.click();
    }

    // Handle delete file click event
    deleteFileClick() {
        let _this = this;
        deleteFile(this.state.file.name, true).then(function (res) {
            if (res.success) {
                let deletedFile = null;
                if (_this.data['FilePath']) {
                    deletedFile = {
                        name: _this.data['FileName'],
                        type: _this.data['MimeType']
                    }
                }
                _this.setState({
                    file: null,
                    deletedFile: deletedFile,
                    docPreview: null
                });
                _this.props.notifyFileUpload(false);
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.props.docDelSuccess || _this.props.strings.DOC_DELETE_SUCCESS });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Upload file to folder in server on upload change
    fileChange(e) {
        e.preventDefault();
        let _this = this;
        let reader = new FileReader();
        let file = e.target.files[0];
        if (file) {
            if (this.props.fetchHeader) {
                this.readSomeLines(file, function onComplete(err) {
                    
                    if (err) {
                        _this.notifyToaster(NOTIFY_ERROR, { message: err });
                    }
                    else {
                        _this.setState({ disableUpload: false });
                    }
                });
            }
            reader.onloadend = () => {
                let deletedFileContent = null;
                if (this.data['FilePath']) {
                    deletedFileContent = {
                        name: this.data['FileName'],
                        type: this.data['MimeType']
                    }
                }
                if (this.state.file)
                    deleteFile(this.state.file.name, true);
                this.setState({
                    file: { name: file.name, type: file.type },
                    deletedFile: deletedFileContent,
                    docPreview: _this.props.docUploadSuccess || _this.props.strings.DOC_UPLOAD_SUCCESS
                });
                this.props.notifyFileUpload(true);
            }
            reader.readAsDataURL(file);
        }
        uploadFile(file).then(function () {
            _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.props.docUploadSuccess || _this.props.strings.DOC_UPLOAD_SUCCESS });
        });
    }

    // only if 'fetchHeader' props pass to fetch csv header row
    readSomeLines(file, onComplete) {
        
        let _this = this;
        const decoder = new encoding.TextDecoder();
        //let decoder = new TextDecoder();
        let offset = 0;
        let results = '';
        let fr = new FileReader();
        fr.onload = function () {
            // Use stream:true in case we cut the file
            // in the middle of a multi-byte character
            results += decoder.decode(fr.result, { stream: true });
            var lines = results.split('\n');
            results = lines.pop(); // In case the line did not end yet.

            if (offset == 0) _this.columnHeader = lines[0].split(',');
        };
        fr.onerror = function () {
            onComplete(fr.error);
        };
        seek();

        function seek() {
            var slice = file.slice(offset, offset + _this.CHUNK_SIZE);
            fr.readAsArrayBuffer(slice);
        }
    }

    // Get value of file and deleted file
    getValues() {
        return {
            file: this.state.file,
            deletedFile: this.state.deletedFile,
            fileId: this.data ? this.data.FileId : null,
            columnHeader: this.columnHeader // only if 'fetchHeader' props pass to fetch csv header row
        }
    }

    // Render component
    render() {
        return (
            <div>
                <div>
                    <span className="control-label">{this.props.label}</span>{this.props.isMandatory ? <span className="mandatory-star">*</span> : null}
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div>
                            <input type="file" name="filePic" id="filePic" accept="*"
                                ref={(fileFile) => { this.file = fileFile }} className="hidden"
                                onChange={this.fileChange} />

                            <Button
                                inputProps={{
                                    name: 'btnUploadFile',
                                    label: this.strings.SELECT_LABEL,
                                    className: 'button2Style button30Style mr10',
                                    disabled: this.props.disabled
                                }}
                                onClick={this.uploadFileClick}></Button>

                            <Button
                                inputProps={{
                                    name: 'btnDeleteFile',
                                    label: this.strings.DELETE_LABEL,
                                    className: 'button1Style button30Style upoload-button-width mt10',
                                    disabled: !this.state.file || this.props.disabled
                                }}
                                onClick={this.deleteFileClick}></Button>

                        </div>
                        <div className="mt10" style={{ fontSize: '13px' }}>{this.state.docPreview}</div>
                    </div>
                </div>
            </div>
        );
    }
}

DocumentUpload.defaultProps = {
    isMandatory: true,
    disabled: false
}

export default DocumentUpload;