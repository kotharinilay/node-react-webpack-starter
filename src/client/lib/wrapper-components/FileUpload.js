'use strict';

/**************************
 * Upload image file with delete functionality
 * **************************** */

import React, { Component } from 'react';
import Button from '../core-components/Button';
import { deleteFile, uploadFile } from '../../services/private/common';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../app/common/actiontypes';

class FileUpload extends Component {
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
            filePreview: this.data && this.data['FilePath'] ?
                this.data['FilePath'] + '?' + new Date() :
                this.siteURL + '/static/images/no-image-available.png'
        }

        this.file = null;
        this.pictureMaxSize = 2 * 1024 * 1024;

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
                    filePreview: _this.siteURL + '/static/images/no-image-available.png'
                });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.props.picDelSuccess });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Upload file to folder in server on upload change
    fileChange(e) {
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];
        if (file) {
            if (file.size > this.pictureMaxSize) {
                this.notifyToaster(NOTIFY_ERROR, { message: this.strings.UPLOAD_FILE_SIZE_EXCESS_MESSAGE });
                return;
            } else if (file.type.indexOf('image') == -1 || file.type.indexOf('image/x-icon') != -1) {
                this.notifyToaster(NOTIFY_ERROR, { message: this.strings.PICTURE_TYPE_VIOLATION_MESSAGE });
                return;
            } else {
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
                        filePreview: reader.result
                    });
                }
            }
            reader.readAsDataURL(file);
        }
        uploadFile(file);
    }

    // Get value of file and deleted file
    getValues() {
        return {
            file: this.state.file,
            deletedFile: this.state.deletedFile,
            fileId: this.data ? this.data.FileId : null
        }
    }

    // Render component
    render() {
        return (
            <div>
                <div>
                    <span className="control-label picture-lbl">{this.props.label}</span>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="pull-left mr20">
                            <img className="no-image" src={this.state.filePreview} alt="no image" />
                        </div>
                        <div>
                            <input type="file" name="filePic" id="filePic" accept="image/*"
                                ref={(fileFile) => { this.file = fileFile }} className="hidden"
                                onChange={this.fileChange} />
                            <div>
                                <Button
                                    inputProps={{
                                        name: 'btnUploadFile',
                                        label: this.strings.UPLOAD_LABEL,
                                        className: 'button2Style button30Style upoload-button-width',
                                    }}
                                    onClick={this.uploadFileClick}></Button>
                            </div>
                            <div>
                                <Button
                                    inputProps={{
                                        name: 'btnDeleteFile',
                                        label: this.strings.DELETE_LABEL,
                                        className: 'button1Style button30Style upoload-button-width mt10',
                                        disabled: !this.state.file
                                    }}
                                    onClick={this.deleteFileClick}></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FileUpload;