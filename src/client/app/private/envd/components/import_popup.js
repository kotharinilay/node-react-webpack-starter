'use strict';

/**************************
 * Import tags from CSV file
 * **************************** */

import React from 'react';
import PureComponent from '../../../../lib/wrapper-components/PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Dropdown from '../../../../lib/core-components/Dropdown';
import RadioButton from '../../../../lib/core-components/RadioButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import Grid from '../../../../lib/core-components/Grid';
import DocumentUpload from '../../../../lib/wrapper-components/DocumentUpload';
import { NOTIFY_SUCCESS, NOTIFY_WARNING, NOTIFY_ERROR } from '../../../../app/common/actiontypes';

// import { validateTags, importTags } from '../../../../services/private/import-desk';
import { validateCSV } from '../../../../services/private/envd';
import { nvdDeliveryImportColumns } from '../../../../../shared/csv';
import { livestockIdentifierDS, varianceTypes, nvdImportTypes } from '../../../../../shared/constants';

class ImportCSV extends PureComponent {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.identifier = null;

        this.fileUploaded = false;
        this.validated = false;
        this.finish = false;

        this.state = {
            isOpen: true,
            displayMsg: false,
            step1State: 'pre-main',
            step2State: 'trans-main',
            step3State: 'trans-main',
            currentStep: 1,
            importStatus: 0, // 0 - Loading..., 1 - Success, 2 - Error
            isClicked: false,
            isLastStep: false
        };

        this.mappingGridData = [];
        this.issues = [];
        this.importFile = null;
        this.popupData = null;
        this.mappingColums = [
            { field: 'index', displayName: 'index', visible: false, editable: false, isKey: true },
            { field: 'CSVColumns', displayName: 'CSV Columns', visible: true, editable: false },
            {
                field: 'mapColumn', displayName: 'Data to Import', visible: true,
                editable: { type: 'select', options: { values: nvdDeliveryImportColumns } }
            }
        ];
        this.invalidDataColumns = [
            { field: 'index', displayName: 'index', visible: false, isKey: true },
            { field: 'line', width: '150px', displayName: 'Line Number', visible: true },
            { field: 'issue', displayName: 'Issues', visible: true }
        ];
        this.hideModal = this.hideModal.bind(this);
        this.finishClick = this.finishClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.changeStep = this.changeStep.bind(this);
        this.notifyFileUpload = this.notifyFileUpload.bind(this);
        this.renderStep2 = this.renderStep2.bind(this);
        this.validateClick = this.validateClick.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    // To hide modal popup
    hideModal() {
        if (!this.finish) this.popupData = null;
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.toggleImportPopup(_this.popupData);
        }, 1000);
    }

    finishClick() {
        this.finish = true;
        this.hideModal();
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.hideModal();
            e.preventDefault();
        }
    }

    notifyFileUpload(res) {
        this.fileUploaded = res;
    }

    changeStep(tran, e) {
        if (tran == 'prev') {
            this.setState({
                [`step${this.state.currentStep - 1}State`]: 'pre-main',
                [`step${this.state.currentStep}State`]: 'trans-main',
                currentStep: this.state.currentStep - 1,
                isLastStep: false
            });
        }
        else {
            let isValid = false;
            if (this.state.currentStep == 1) isValid = this.step1Validation();
            if (this.state.currentStep == 2) isValid = this.step2Validation();

            if (isValid)
                this.setState({
                    [`step${this.state.currentStep + 1}State`]: 'pre-main',
                    [`step${this.state.currentStep}State`]: 'consi-pro-main',
                    currentStep: this.state.currentStep + 1,
                    isLastStep: this.state.currentStep == 2 ? true : false
                });
        }
    }

    step1Validation() {
        if (!this.refs.livestockidentifier.fieldStatus.valid) {
            this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        if (!this.fileUploaded) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.UPLOAD_FILE_VALIDAITON_MESSAGE });
            return false;
        };
        this.identifier = this.refs.livestockidentifier.fieldStatus.value;
        this.importtype = this.refs.importtype.fieldStatus.value;
        return true;
    }

    step2Validation() {
        if (!this.validated) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VALIDATION_REQ_MESSASAGE });
            return false;
        };
        return true;
    }

    validateClick() {
        this.issues = [];
        let mapping = this.refs.importMappingGrid.props.gridData;
        // this.setState({ displayMsg: false, validateClick: true });
        let _this = this;
        this.popupData = {
            importFile: this.importFile,
            identifier: this.identifier,
            importtype: this.importtype
        }
        validateCSV(mapping, this.importFile, this.identifier, this.props.nvdDetail, this.importtype).then(function (res) {
            if (res.success) {
                _this.validated = true;
                if (res.issues) {
                    _this.issues = res.data;
                    _this.popupData.canUpdateDelivery = false;
                }
                else {
                    _this.popupData.canUpdateDelivery = true;
                    _this.popupData.additionalData = res.data;
                }
                _this.stateSet({ displayMsg: true, issues: _this.issues });
            }
        });
    }

    renderStep1() {
        return (
            <div>
                <RadioButton inputGroupProps={{ name: 'importtype', defaultSelected: nvdImportTypes.Variance }}
                    dataSource={[{ Value: nvdImportTypes.Variance, Text: this.strings.CONTROLS.VARIANCE_IMPORT_LABEL },
                    { Value: nvdImportTypes.DeliveredLivestock, Text: this.strings.CONTROLS.DELIVERED_IMPORT_LABEL }]}
                    textField="Text" valueField="Value" horizontalAlign={true}
                    isClicked={this.state.isClicked} ref="importtype" />
                <Dropdown inputProps={{
                    name: 'livestockidentifier',
                    hintText: this.strings.CONTROLS.LIVESTOCKIDENTIFIER_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.LIVESTOCKIDENTIFIER_LABEL,
                    value: this.identifier
                }}
                    eReq={this.strings.CONTROLS.LIVESTOCKIDENTIFIER_REQ_MESSAGE}
                    textField="Text" valueField="Value" dataSource={livestockIdentifierDS}
                    isClicked={this.state.isClicked} ref="livestockidentifier" />
                <DocumentUpload
                    strings={this.strings.COMMON} fetchHeader={true}
                    notifyToaster={this.notifyToaster}
                    notifyFileUpload={this.notifyFileUpload}
                    label={this.strings.CONTROLS.UPLOAD_CSV_LABEL}
                    ref="csvFile" />
            </div>
        );
    }

    renderStep2() {
        if (this.refs.csvFile) {
            this.uploadedFileData = this.refs.csvFile.getValues();
            if (this.uploadedFileData.file) this.importFile = this.uploadedFileData.file;
            let columnData = this.uploadedFileData.columnHeader;
            if (columnData.length > 0) {
                this.mappingGridData = [];
            }
            let importTagMapColumns = nvdDeliveryImportColumns.toString().replace(/ +/g, "").toLowerCase().split(',');
            columnData.forEach(function (element, i) {
                let tempEle = element.replace(/ +/g, "").toLowerCase();
                let findIndex = importTagMapColumns.indexOf(tempEle);
                if (findIndex != -1)
                    this.mappingGridData.push({ index: i, CSVColumns: element, mapColumn: nvdDeliveryImportColumns[findIndex] });
                else
                    this.mappingGridData.push({ index: i, CSVColumns: element, mapColumn: 'Select map column' });
            }, this);
        }

        return (<div className="row">
            <Grid ref="importMappingGrid" columns={this.mappingColums} pagination={false}
                height="300px" isRemoteData={false} selectRowMode="none"
                gridData={this.mappingGridData} cellEdit={{ mode: 'click', blurToSave: true }} />

            <BusyButton
                inputProps={{
                    name: 'btnValidate',
                    label: this.strings.CONTROLS.VALIDATE_LABEL,
                    className: 'button2Style button30Style mt10',
                }}
                loaderHeight={25}
                onClick={this.validateClick}></BusyButton>
            <br />
            {this.state.displayMsg ? this.state.issues.length > 0 ? <Grid isRemoteData={false} selectRowMode="none"
                columns={this.invalidDataColumns} gridData={this.state.issues} /> : this.strings.VALIDATE_SUCCESS
                : null}
        </div>
        );
    }

    renderStep3() {
        return (<div className="mt30">
            {this.issues.length > 0 ?
                this.strings.INVALID_CSV : this.strings.VALID_CSV}
        </div>);
    }

    render() {
        let strings = this.strings;
        return (
            <Modal isOpen={this.state.isOpen} keyboard={false} size='modal-lg'>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <div className="live-detail-main">
                        <div className="configure-head">
                            <span>{strings.TITLE}</span>
                        </div>
                        <div className="l-stock-top-btn configure-right wizard-right">
                            <ul>
                                <li>
                                    <a href="javascript:void(0)" onClick={() => { this.changeStep('prev', event) }}
                                        className={"ripple-effect filter-btn prev-btn" + (this.state.currentStep == 1 ? " disable-link" : "")}>
                                        <img src={this.siteURL + "/static/images/prev-arrow.png"} alt="next" />
                                        {strings.CONTROLS.PREVIOUS_LABEL}
                                    </a>
                                </li>
                                {this.state.isLastStep ?
                                    <li>
                                        <Button
                                            inputProps={{
                                                name: 'btnFinish',
                                                label: strings.CONTROLS.FINISH_LABEL,
                                                className: 'button1Style button30Style',
                                            }}
                                            onClick={this.finishClick} ></Button>
                                    </li>
                                    :
                                    <li>
                                        <a href="javascript:void(0)" onClick={() => { this.changeStep('next', event) }}
                                            className={"ripple-effect filter-btn next-btn" + (this.state.currentStep == 3 ? " disable-link" : "")}>
                                            {strings.CONTROLS.NEXT_LABLE}
                                            <img src={this.siteURL + "/static/images/next-arrow.png"} alt="next" />
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="clear"></div>
                </ModalHeader>
                <ModalBody>
                    <div className='stock-list'>
                        <div className="stock-list-cover">
                            <div className="wizard-main">
                                <div className={this.state.step1State}>
                                    <div className="pro-circle">
                                        <div className="grn-circle">
                                            <img src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                        </div>
                                    </div>
                                    <h3>{strings.STEP1}</h3>
                                </div>
                                <div className={this.state.step2State}>
                                    <div className="purple-circle">
                                        <div className="prl-circle">
                                            <img src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                        </div>
                                    </div>
                                    <h3>{strings.STEP2}</h3>
                                </div>
                                <div className={this.state.step3State}>
                                    <div className="quest-circle">
                                        <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                    </div>
                                    <h3>{strings.STEP3}</h3>
                                </div>
                            </div>
                            <div className='col-md-12'>
                                {this['renderStep' + this.state.currentStep]()}
                            </div>
                        </div>
                    </div>
                    <div className='clearfix'></div>
                </ModalBody>
            </Modal>
        );
    }
}

export default ImportCSV;