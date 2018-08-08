'use strict';

/**************************
 * Import property from CSV file
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Button from '../../../../../lib/core-components/Button';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';
import Grid from '../../../../../lib/core-components/Grid';
import BusyButton from '../../../../../lib/wrapper-components/BusyButton';
import DirectFileUpload from '../../../../../lib/wrapper-components/DirectFileUpload';
import StatusGrid from './status-grid';

import { NOTIFY_SUCCESS, NOTIFY_WARNING, NOTIFY_ERROR } from '../../../../../app/common/actiontypes';
import { validateProperty, importProperty } from '../../../../../services/private/import-desk';
import { propertyColumns } from '../../../../../../shared/csv';

class ImportProperty extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.step1 = true;
        this.step2 = false;
        this.step3 = false;

        this.firebaseKey = new Date().getTime() + Math.random().toString(36).substring(7);
        this.fileUploaded = false;
        this.validated = false;
        this.state = {
            displayMsg: false,
            step1State: 'pre-main',
            step2State: 'trans-main',
            step3State: 'trans-main',
            currentStep: 1,
            importStatus: 0 // 0 - Loading..., 1 - Success, 2 - Error
        };

        this.totalLines = 0;
        this.chunkOffset = [];
        this.mappingGridData = [];
        this.mappingColums = [
            { field: 'index', displayName: 'index', visible: false, editable: false, isKey: true },
            { field: 'CSVColumns', displayName: 'CSV Columns', visible: true, editable: false },
            {
                field: 'mapColumn', displayName: 'Data to Import', visible: true,
                editable: { type: 'select', options: { values: propertyColumns } }
            }
        ];

        this.changeStep = this.changeStep.bind(this);
        this.notifyFileUpload = this.notifyFileUpload.bind(this);
        this.renderStep2 = this.renderStep2.bind(this);
        this.validateClick = this.validateClick.bind(this);
        this.importCSVClick = this.importCSVClick.bind(this);
        this.resetPage = this.resetPage.bind(this);

    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillMount() {
        this.mounted = true;
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    resetPage() {
        this.fileUploaded = false;
        this.validated = false;
        this.totalLines = 0;
        this.chunkOffset = [];
        this.mappingGridData = [];

        this.step1 = true;
        this.step2 = false;
        this.step3 = false;

        this.setState({
            displayMsg: false,
            step1State: 'pre-main',
            step2State: 'trans-main',
            step3State: 'trans-main',
            currentStep: 1,
            importStatus: 0
        });
    }

    notifyFileUpload(res) {
        if (res) {
            this.fileUploaded = true;
        }
        else {
            this.fileUploaded = false;
        }
    }

    changeStep(tran, e) {
        if (tran == 'prev') {
            this.setState({
                [`step${this.state.currentStep - 1}State`]: 'pre-main',
                [`step${this.state.currentStep}State`]: 'trans-main',
                currentStep: this.state.currentStep - 1
            });
        }
        else {
            let isValid = false;
            if (this.state.currentStep == 1) isValid = this.step1Validation();
            if (this.state.currentStep == 2) isValid = this.step2Validation();

            if (isValid) {
                this['step' + (this.state.currentStep + 1)] = true;
                this.setState({
                    [`step${this.state.currentStep + 1}State`]: 'pre-main',
                    [`step${this.state.currentStep}State`]: 'consi-pro-main',
                    currentStep: this.state.currentStep + 1
                });
            }
        }
    }

    step1Validation() {
        if (!this.fileUploaded) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.UPLOAD_FILE_VALIDAITON_MESSAGE });
            return false;
        };
        return true;
    }

    step2Validation() {
        if (this.validated && this.refs.statusGrid.importDataCount == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.VALIDATION_NO_RECORDS_FOUND });
            return false;
        }
        if (!this.validated) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VALIDATION_REQ_MESSASAGE });
            return false;
        };

        let payload = {
            confirmText: this.strings.IMPORT_CONFIRMATION_MESSAGE,
            strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
            onConfirm: this.importCSVClick
        };
        this.props.openConfirmPopup(payload);
        return false;
    }

    validateClick() {
        let mapping = this.refs.importPropertyMappingGrid.props.gridData;
        this.refs.statusGrid.setState({ invalidData: [] });
        this.setState({ displayMsg: false, validateClick: true });
        let _this = this;
        return validateProperty(mapping, this.firebaseKey, this.uploadedFileData).then(function (res) {
            if (res.success) {
                _this.validated = true;
                if (!_this.state.displayMsg)
                    _this.stateSet({ displayMsg: true });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.VALIDATION_SUCCESS });
                return true;
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR);
                return false;
            }
        });
    }

    importCSVClick() {
        this.props.hideConfirmPopup();
        let _this = this;
        importProperty(this.uploadedFileData, this.firebaseKey).then(function (res) {
            if (res.success) {
                _this.stateSet({ importStatus: 1 });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.IMPORT_SUCCESS });
            }
            else {
                _this.stateSet({ importStatus: 2 });
                _this.notifyToaster(NOTIFY_ERROR);
            }
        });
        this['step' + (this.state.currentStep + 1)] = true;
        this.setState({
            [`step${this.state.currentStep + 1}State`]: 'pre-main',
            [`step${this.state.currentStep}State`]: 'consi-pro-main',
            currentStep: this.state.currentStep + 1
        });
    }

    renderStep1() {
        return (
            <div className={this.state.currentStep == 1 ? '' : 'hidden'}>
                <DirectFileUpload label={this.strings.UPLOAD_CSV_LABEL} strings={this.strings.COMMON}
                    firebaseKey={this.firebaseKey} importType='import-property'
                    notifyToaster={this.props.notifyToaster} notifyFileUpload={this.notifyFileUpload} ref='fileData' />
            </div>);
    }

    renderStep2() {
        if (this.step2) {
            if (this.refs.fileData && this.refs.fileData.isNewFile) {
                this.uploadedFileData = this.refs.fileData.getValues();
                this.totalLines = this.uploadedFileData.totalLines;
                this.chunkOffset = this.uploadedFileData.chunkOffset;
                let columnData = this.uploadedFileData.columnHeader;
                if (columnData.length > 0) {
                    this.mappingGridData = [];
                }
                let columns = propertyColumns.toString().replace(/ +/g, "").toLowerCase().split(',');
                columnData.forEach(function (element, i) {
                    let tempEle = element.replace(/ +/g, "").toLowerCase();
                    let findIndex = columns.indexOf(tempEle);
                    if (findIndex != -1)
                        this.mappingGridData.push({ index: i, CSVColumns: element, mapColumn: propertyColumns[findIndex] });
                    else
                        this.mappingGridData.push({ index: i, CSVColumns: element, mapColumn: 'Select map column' });
                }, this);
                this.refs.fileData.isNewFile = false;
            }

            return (
                <div className={this.state.currentStep == 2 ? '' : 'hidden'}>
                    <span className="control-label picture-lbl">
                        {this.totalLines - 1} records found from CSV file. Mapping data mat result into different records after validation.
                </span>
                    <Grid ref="importPropertyMappingGrid" columns={this.mappingColums} pagination={false}
                        height="300px" isRemoteData={false} selectRowMode="none"
                        gridData={this.mappingGridData} cellEdit={{ mode: 'click', blurToSave: true }} />

                    <BusyButton
                        inputProps={{
                            name: 'btnValidate',
                            label: this.strings.VALIDATE_LABEL,
                            className: 'button2Style button30Style mt10',
                        }}
                        loaderHeight={25}
                        onClick={this.validateClick}></BusyButton>
                    <br />

                    <StatusGrid ref="statusGrid" displayMsg={this.state.displayMsg} totalRecords={this.totalLines} path={'import-property/' + this.firebaseKey + '/'} />
                </div>);
        }
        else return null;
    }

    renderStep3() {
        if (this.step3) {
            return (<div className={this.state.currentStep == 3 ? 'mt30' : 'mt30 hidden'}>
                {this.state.importStatus == 0 ?
                    <LoadingIndicator /> :
                    <div>
                        <div>{this.state.importStatus == 1 ? this.strings.IMPORT_SUCCESS : this.strings.IMPORT_ERROR}</div>
                        <Button
                            inputProps={{
                                name: 'btnTryAnother',
                                label: this.state.importStatus == 1 ? this.strings.UPLOAD_ANOTHER_FILE_LABEL : this.strings.TRY_AGAIN_LABEL,
                                className: 'button2Style button30Style mt20',
                            }}
                            onClick={this.resetPage} ></Button></div>}
            </div>);
        }
        else return null;
    }

    render() {
        let strings = this.strings;
        return (
            <div className="row">
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head">
                            <span>{strings.TITLE}</span>
                        </div>
                        <div className="l-stock-top-btn configure-right wizard-right">
                            <ul>
                                <li>
                                    <Button
                                        inputProps={{
                                            name: 'btnCancel',
                                            label: strings.CANCEL_LABEL,
                                            className: 'button1Style button30Style',
                                        }}
                                        onClick={() => browserHistory.replace('/importdesk')} ></Button>
                                </li>
                                {this.state.currentStep != 1 ? <li>
                                    <a href="javascript:void(0)" onClick={(event) => { this.changeStep('prev', event) }}
                                        className={"ripple-effect filter-btn prev-btn" + (this.state.currentStep == 1 ? " disable-link" : "")}>
                                        <img src={this.siteURL + "/static/images/prev-arrow.png"} alt="next" />
                                        {strings.PREVIOUS_LABEL}
                                    </a>
                                </li> : null}
                                <li>
                                    <a href="javascript:void(0)" onClick={(event) => { this.changeStep('next', event) }}
                                        className={"ripple-effect filter-btn next-btn" + (this.state.currentStep == 3 ? " disable-link" : "")}>
                                        {strings.NEXT_LABLE}
                                        <img src={this.siteURL + "/static/images/next-arrow.png"} alt="next" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="clear"></div>
                <div className='stock-list'>
                    <div className="stock-list-cover">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="javascript:void(0)"><img alt="icon" src={this.siteURL + "/static/images/quest-mark-icon.png"} />Help</a>
                        </div>
                        <div className="wizard-main">
                            <div className={this.state.step1State}>
                                <div className="pro-circle">
                                    <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                    <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                </div>
                                <h3>{strings.STEP1}</h3>
                            </div>
                            <div className={this.state.step2State}>
                                <div className="pro-circle">
                                    <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                    <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                </div>
                                <h3>{strings.STEP2}</h3>
                            </div>
                            <div className={this.state.step3State}>
                                <div className="pro-circle">
                                    <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                    <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                </div>
                                <h3>{strings.STEP3}</h3>
                            </div>
                        </div>
                        <div className='col-md-9'>
                            {this.renderStep1()}
                            {this.renderStep2()}
                            {this.renderStep3()}
                        </div>
                        <div className="col-md-3 guide-main">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{this.strings[`STEP${this.state.currentStep}_GUIDE_TEXT`]}</div>
                            <br />
                            <a style={{ color: '#006db7' }} href={this.siteURL + "/static/csv-templates/import-property.csv"} download>{this.strings.DOWNLOAD_CSV_LINK}</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ImportProperty;