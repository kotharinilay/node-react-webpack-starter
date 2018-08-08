'use strict';

/**************************
 * Upload file directly to S3 server
 * **************************** */

import React, { Component } from 'react';
import Button from '../core-components/Button';
import LoadingIndicator from '../core-components/LoadingIndicator';
import LinearProgress from 'material-ui/LinearProgress';
import { getSignedRequest, s3Upload } from '../../services/private/common';
import { NOTIFY_ERROR } from '../../app/common/actiontypes';
import encoding from 'text-encoding';

class DirectFileUpload extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.fileRef = null;
        this.file = null;
        this.chunkCount = 0;
        this.lineCount = 0;
        this.CHUNK_SIZE = 1350000;
        this.chunkFiles = [];
        this.columnHeader = [];
        this.chunkOffset = [];
        this.isNewFile = false;

        this.state = {
            progressText: '',
            fileData: {},
            progress: 0,
            disableUpload: true
        }

        this.uploadFileClick = this.uploadFileClick.bind(this);
        this.selectFileClick = this.selectFileClick.bind(this);
        this.fileChange = this.fileChange.bind(this);
        this.progress_handler = this.progress_handler.bind(this);
        this.uploadFolder = `import-csv/${this.props.importType}/${this.props.firebaseKey}`;
    }

    // Handle select file click event
    selectFileClick() {
        this.fileRef.click();
    }

    // Handle upload file click event
    uploadFileClick(e) {
        e.preventDefault();
        if (this.file) {
            this.setState({ disableUpload: true, progressText: "Upload Initiated..." });
            let _this = this;
            let chunkFiles = [];
            for (var index = 0; index < this.chunkCount; index++) {
                chunkFiles.push({ filename: this.chunkFiles[index].name, filetype: this.chunkFiles[index].type });
            }

            return getSignedRequest(chunkFiles, this.uploadFolder).then(function (res) {
                var promiseArr = [];
                _this.chunkFiles.forEach(function (chunk, index) {
                    promiseArr.push(s3Upload(chunk.formData, this.response.data[index]));
                }, res);

                var len = promiseArr.length;
                var progress = 0;
                Promise.all(promiseArr.map(tick)).then(function (response) {
                    let ret = response.every((res) => {
                        return res.success;
                    })
                    if (ret) {
                        _this.setState({ progressText: 'Upload Completed' });
                        _this.isNewFile = true;
                        _this.props.notifyFileUpload(ret);
                    }
                    else {
                        _this.setState({ progressText: 'Upload Error' });
                        _this.notifyToaster(NOTIFY_ERROR, { message: _this.strings.UPLOAD_FILE_ERROR });
                    }
                });

                function tick(promise) {
                    promise.then(function () {
                        progress++;
                        _this.progress_handler(progress, len);
                    });
                    return promise;
                }
            });
        }
        else {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.FILE_SELECT_VALIDATION_MESSAGE });
        }
    }

    // Upload file to folder in server on upload change
    fileChange(e) {
        e.preventDefault();
        let file = e.target.files[0];
        let _this = this;
        if (file) {
            this.file = file;
            this.chunkCount = 0;
            this.lineCount = 0;
            this.chunkFiles = [];
            this.setState({ fileData: { filename: file.name, filetype: file.type }, progress: 0, progressText: '' });
            this.readSomeLines(file, function (chunk) {

                if (chunk instanceof Array) {
                    _this.chunkCount++;
                    let blob = new Blob([chunk.join('\n')], { type: 'text/csv' });
                    blob.lastModifiedDate = new Date();
                    let chunkName = _this.file.name.substring(0, _this.file.name.lastIndexOf(".")) + "_" + _this.chunkCount + _this.file.name.substring(_this.file.name.lastIndexOf("."));
                    // var chunkObj = new FormData();
                    // // chunkObj.append("Content-Type", 'text/csv');
                    // chunkObj.append("file", blob, chunkName);

                    // // let chunkObj = new File([blob], chunkName, { type: 'text/csv' });
                    _this.chunkFiles.push({ formData: blob, name: chunkName, type: 'text/csv' });
                    _this.chunkOffset.push({ chunk: _this.chunkCount, offset: _this.lineCount + 1 });
                    _this.lineCount += chunk.length;
                }
            }, function onComplete(err) {
                if (err) {
                    _this.notifyToaster(NOTIFY_ERROR, { message: err });
                }
                else {
                    _this.props.notifyFileUpload(false);
                    _this.setState({ disableUpload: false });
                }
            });
        }
        else {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.FILE_SELECT_VALIDATION_MESSAGE });
        }
    }

    readSomeLines(file, forEachLine, onComplete) {
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

            forEachLine(lines);
            if (offset == 0) _this.columnHeader = lines[0].split(',');
            offset += _this.CHUNK_SIZE;
            seek();
        };
        fr.onerror = function () {
            onComplete(fr.error);
        };
        seek();

        function seek() {
            if (offset !== 0 && offset >= file.size) {
                // We did not find all lines, but there are no more lines.
                forEachLine(results); // This is from lines.pop(), before.
                onComplete(); // Done
                return;
            }
            var slice = file.slice(offset, offset + _this.CHUNK_SIZE);
            fr.readAsArrayBuffer(slice);
        }
    }

    progress_handler(progress, len) {
        let completed = Math.round(progress / len * 100);
        this.setState({ progress: completed, progressText: "Uploading..." });
    }

    // Get value of file
    getValues() {
        return {
            file: this.state.fileData,
            columnHeader: this.columnHeader,
            totalLines: this.lineCount,
            chunkOffset: this.chunkOffset
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
                    <div className="col-md-6 col-sm-6">
                        <input type="file" name="uploadFile" id="uploadFile"
                            ref={(fileFile) => { this.fileRef = fileFile }} className="hidden"
                            onChange={this.fileChange} />
                        <label className="mb5" style={{ fontSize: '13px', fontWeight: 'normal' }}>{this.state.fileData.filename}</label>
                        <label className="mb5" style={{ fontSize: '13px', float: 'right', fontWeight: 'normal' }}>{this.state.progressText}</label>
                        <LinearProgress mode='determinate' value={this.state.progress} />
                        <label className="mt5" style={{ float: 'right', fontWeight: 'normal' }}>{this.state.progress}%</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-sm-3">
                        <Button
                            inputProps={{
                                name: 'btnSelectFile',
                                label: this.strings.SELECT_LABEL,
                                className: 'button2Style button30Style upoload-button-width mt10',
                            }}
                            fullWidth={true}
                            onClick={this.selectFileClick}></Button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-sm-3">
                        <Button
                            inputProps={{
                                name: 'btnUploadFile',
                                label: this.strings.UPLOAD_LABEL,
                                className: 'button1Style button30Style upoload-button-width mt10',
                                disabled: this.state.disableUpload,
                            }}

                            fullWidth={true}
                            onClick={this.uploadFileClick}></Button>
                    </div>
                </div>

            </div >
        );
    }
}

export default DirectFileUpload;