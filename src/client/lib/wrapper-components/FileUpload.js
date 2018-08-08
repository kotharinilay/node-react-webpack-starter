'use strict';

/**************************
 * Upload image file with delete functionality
 * **************************** */

import React, { Component } from 'react';
import Button from '../core-components/Button';
import SignaturePad from '../core-components/SignaturePad';
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
                (this.props.isSignature ? this.siteURL + '/static/images/no-signature-icon.png' : this.siteURL + '/static/images/no-image-available.png'),
            signatureData: null
        }

        this.file = null;
        this.pictureMaxSize = 2 * 1024 * 1024;

        this.uploadFileClick = this.uploadFileClick.bind(this);
        this.deleteFileClick = this.deleteFileClick.bind(this);
        this.fileChange = this.fileChange.bind(this);
        this.openSignaturePad = this.openSignaturePad.bind(this);
        this.saveSignature = this.saveSignature.bind(this);
    }

    componentWillMount() {
        if (this.data.FilePath && this.props.isSignaturePad) {
            let _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.data.FilePath, true);
            xhr.responseType = "blob";
            xhr.onload = function (e) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var res = event.target.result;
                    _this.setState({ signatureData: res });
                }
                var file = this.response;
                reader.readAsDataURL(file);
            };
            xhr.send();
        }
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
                    filePreview: _this.siteURL + '/static/images/no-image-available.png',
                    signatureData: null
                });

                if (_this.props.getDataOnUpload)
                    _this.props.getDataOnUpload({
                        file: null,
                        deletedFile: deletedFile,
                        fileId: _this.data ? _this.data.FileId : null
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
                        filePreview: reader.result,
                        signatureData: reader.result
                    });
                    if (this.props.getDataOnUpload)
                        this.props.getDataOnUpload({
                            file: { name: file.name, type: file.type },
                            deletedFile: deletedFileContent,
                            fileId: this.data ? this.data.FileId : null
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

    // Open signature popup
    openSignaturePad() {
        this.refs.signPad.openModal();
    }

    saveSignature(data, name) {
        let deletedFile = null;
        if (this.data['FilePath']) {
            deletedFile = {
                name: this.data['FileName'],
                type: this.data['MimeType']
            }
        }

        if (this.state.file)
            deleteFile(this.state.file.name, true);

        this.setState({
            file: { name: name, type: "image/png" },
            deletedFile: deletedFile,
            filePreview: data,
            signatureData: data
        });

        if (this.props.getDataOnUpload)
            this.props.getDataOnUpload({
                file: { name: name, type: "image/png" },
                deletedFile: deletedFile,
                fileId: this.data ? this.data.FileId : null
            });

    }

    // Render component
    render() {

        let imgClass = this.props.isSignature ? 'col-sm-5 pull-left sign-box' : '   pull-left';

        return (
            <div>
                <div>
                    <span className="control-label picture-lbl">{this.props.label || ''}</span>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className={imgClass}>
                            <img className={this.props.isSignature ? "no-signature-image animated-img-bg" : "no-image animated-img-bg"} src={this.state.filePreview} alt="no image" />
                        </div>
                        <div className="col-sm-7 mt-10">
                            <input type="file" name="filePic" id="filePic" accept="image/*"
                                ref={(fileFile) => { this.file = fileFile }} className="hidden"
                                onChange={this.fileChange} />
                            <Button
                                inputProps={{
                                    name: 'btnUploadFile',
                                    label: this.strings.UPLOAD_LABEL,
                                    className: 'button2Style button30Style upoload-button-width mr10',
                                    disabled: this.props.isDisabled
                                }}
                                onClick={this.uploadFileClick}></Button>
                            {this.props.isSignaturePad ? null : <br />}
                            <Button
                                inputProps={{
                                    name: 'btnDeleteFile',
                                    label: this.strings.DELETE_LABEL,
                                    className: 'button1Style button30Style upoload-button-width mt10',
                                    disabled: !this.state.file || this.props.isDisabled
                                }}
                                onClick={this.deleteFileClick}></Button>

                            {this.props.isSignaturePad ?

                                <Button
                                    inputProps={{
                                        name: 'btnDeleteFile',
                                        label: 'Signature Pad',
                                        className: 'button1Style button30Style mt10 btnsignature',
                                        disabled: this.props.isDisabled
                                    }}
                                    onClick={this.openSignaturePad}></Button>
                                : null}
                        </div>
                        {this.props.isSignaturePad ?
                            <SignaturePad
                                signatureData={this.state.signatureData}
                                saveSign={this.saveSignature}
                                strings={this.strings}
                                deleteSign={this.deleteFileClick}
                                ref="signPad" /> : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default FileUpload;