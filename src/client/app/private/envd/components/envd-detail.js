'use strict';

/**************************
 * e-NVD detail component to create and modify 
 * e-NVD
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { checkEUAccreditation } from '../../../../services/private/envd';
import { SET_COMMON_DETAILS } from '../actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import {
    nvdSteps, speciesCodes, nvdTypes, maturityCodes, nvdStatusCodes,
    MLASchemaVersions, MLAAPIVersion, LocalStorageKeys
} from '../../../../../shared/constants';
import { dateDiffinDays } from '../../../../../shared/format/date';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';
import { saveENVD, getNVDDetail } from '../../../../services/private/envd';
import { formatDateTime } from '../../../../../shared/format/date';

class ENVDDetail extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        // step components to be load
        this.prepare_livestock = null;
        this.consigned_to_property = null;
        this.consignor_declaration = null;
        this.questionnaire = null;
        this.transporter = null;
        this.sale_agent = null;

        // data from steps to be save
        this.prepare_livestock_data = null;
        this.consigned_to_property_data = null;
        this.consignor_declaration_data = null;
        this.questionnaire_data = null;
        this.transporter_data = null;
        this.sale_agent_data = null;

        // data retrieve for update
        this.accreditationQuestionnireData = {};
        this.documentData = {};
        this.livestockSummaryData = {};
        this.lpaQuestionnaireData = {};
        this.nvdData = {};

        this.commonDetail = {};

        if (this.props.params.subdetail) {
            if (!isUUID(this.props.params.subdetail)) {
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_ID });
                browserHistory.replace('/envd');
                return;
            }
            this.commonDetail.isModifyNVD = true;
            this.commonDetail.nvdId = this.props.params.subdetail;
            // this.commonDetail.nvdType = this.getNVDType(json);
            // this.commonDetail.nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === this.commonDetail.nvdType);
        }
        else {
            // get livestock if selected
            let data = localStorage.getItem("livestock_data");
            if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
                this.commonDetail.isLivestockSelected = false;
            }
            else {
                let json = JSON.parse(data);
                this.commonDetail.livestocks = json.data;
                this.commonDetail.propertyId = json.propertyId;
                this.commonDetail.species = json.Species;
                this.commonDetail.isLivestockSelected = true;
                this.commonDetail.nvdType = this.getNVDType(json);
                this.commonDetail.nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === this.commonDetail.nvdType);
                this.commonDetail.mlaSchemaVersion = MLASchemaVersions[this.commonDetail.nvdTypeName];
            }
            this.commonDetail.mlaAPIVersion = MLAAPIVersion;
        }

        this.state = {
            step1State: 'pre-main',
            step2State: 'trans-main',
            step3State: 'trans-main',
            step4State: 'trans-main',
            step5State: 'trans-main',
            step6State: 'trans-main',
            currentStep: 1,
            isClicked: false,
            nvdType: this.commonDetail.nvdTypeName || '',
            mlaSchemaVersion: this.commonDetail.mlaSchemaVersion || '',
            mlaAPIVersion: this.commonDetail.mlaAPIVersion || '',
            enableSave: false,
            dataFetch: false,
            nlisUserStatus: '',
        };

        this.prepare_livestock = require('./prepare_livestock').default;

        this.getLivestockSummary = this.getLivestockSummary.bind(this);
        this.isNTState = this.isNTState.bind(this);
        this.isSAState = this.isSAState.bind(this);
        this.changeStep = this.changeStep.bind(this);
        this.saveNVD = this.saveNVD.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillMount() {
        this.mounted = true;
        this.props.setNVDCommonDetail(SET_COMMON_DETAILS, this.commonDetail);
        if (this.commonDetail.nvdId) {
            let _this = this;
            getNVDDetail(this.commonDetail.nvdId).then(function (res) {
                if (res.success) {

                    _this.accreditationQuestionnireData = res.data.accreditationQuestionnireData;
                    _this.documentData = res.data.documentData;
                    _this.livestockSummaryData = res.data.livestockSummaryData;
                    _this.lpaQuestionnaireData = res.data.lpaQuestionnaireData;
                    _this.nvdData = res.data.nvdData[0];
                    _this.nvdData.disableAll = _this.nvdData.StatusCode == nvdStatusCodes.Delivered;
                    _this.commonDetail.nvdType = _this.nvdData.NVDType;
                    _this.commonDetail.nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === _this.commonDetail.nvdType);
                    _this.commonDetail.mlaSchemaVersion = _this.nvdData.MLASchemaVersion;
                    _this.commonDetail.mlaAPIVersion = _this.nvdData.MLAApiVersion;
                    _this.props.setNVDCommonDetail(SET_COMMON_DETAILS, _this.commonDetail);
                    _this.stateSet({
                        dataFetch: true,
                        nvdType: _this.commonDetail.nvdTypeName,
                        mlaSchemaVersion: _this.commonDetail.mlaSchemaVersion,
                        mlaAPIVersion: _this.commonDetail.mlaAPIVersion,
                        step1State: 'pre-main',
                        step2State: 'consi-pro-main',
                        step3State: 'consi-pro-main',
                        step4State: 'consi-pro-main',
                        step5State: _this.nvdData.HasTransporterAcknowledged == 1 ? 'consi-pro-main' : 'trans-main',
                        step6State: _this.nvdData.HasSaleAgentAcknowledged == 1 ? 'consi-pro-main' : 'trans-main',
                    });
                }
            });
        }
        else {
            this.stateSet({ dataFetch: true });
        }
    }

    getNVDType(data) {
        if (data.Species.SystemCode != speciesCodes.Cattle) {
            if (data.Species.SystemCode == speciesCodes.Goat) return nvdTypes.Goat;
            else if (data.Species.SystemCode == speciesCodes.Sheep) return nvdTypes.Sheep;
        }
        else {
            let res = data.data.every((livestock) => {
                let age = dateDiffinDays(livestock.BirthDate);
                return livestock.MaturityCode == maturityCodes.BobbyCalve ||
                    (livestock.CurrentWeight && livestock.CurrentWeight < 80 && age > 3 && age < 30)
            });
            if (res) return nvdTypes['Bobby Calves'];
            else return nvdTypes.Cattle;
        }
    }

    changeStep(tran, e) {
        if (tran == 'prev') {
            let currStepClass = 'trans-main';
            if (this.commonDetail.isModifyNVD) {
                if (this.state.currentStep == 5) {
                    this.nvdData.HasTransporterAcknowledged == 1 ?
                        currStepClass = 'consi-pro-main' : currStepClass = 'trans-main';
                }
                else if (this.state.currentStep == 6) {
                    this.nvdData.HasSaleAgentAcknowledged == 1 ?
                        currStepClass = 'consi-pro-main' : currStepClass = 'trans-main';
                }
                else {
                    currStepClass = 'consi-pro-main';
                }
            }

            this.stateSet({
                [`step${this.state.currentStep - 1}State`]: 'pre-main',
                [`step${this.state.currentStep}State`]: currStepClass,
                currentStep: this.state.currentStep - 1,
                isClicked: false,
                enableSave: false
            });
        }
        else {
            let isValid = true;
            let currentStep = nvdSteps[this.state.currentStep - 1]
            isValid = this.refs[currentStep].getData();
            if (isValid) {

                this[currentStep + '_data'] = isValid;
                if (currentStep == 'consigned_to_property') {
                    let _this = this;
                    if (!this[nvdSteps[this.state.currentStep - 2] + '_data'].cattleType &&
                        this.props.eNVDCommonDetails.nvdType == nvdTypes.Cattle) {
                        checkEUAccreditation(this[currentStep + '_data'].ConsignedToPICId,
                            this[currentStep + '_data'].DestinationPICId).then(function (res) {
                                if (res.success) {
                                    if (res.data[0].Count > 0) {
                                        let nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === nvdTypes.EUCattle);
                                        let mlaSchemaVersion = MLASchemaVersions[nvdTypeName];
                                        _this.stateSet({ nvdType: nvdTypeName, mlaSchemaVersion: mlaSchemaVersion });
                                        _this.props.setNVDCommonDetail(SET_COMMON_DETAILS, {
                                            nvdType: nvdTypes.EUCattle,
                                            nvdTypeName: nvdTypeName,
                                            mlaSchemaVersion: mlaSchemaVersion
                                        });
                                    }
                                }
                            });
                    }
                }
                let loadStep = nvdSteps[this.state.currentStep];
                if (this[loadStep] == null)
                    this[loadStep] = require('./' + loadStep).default;
                this.stateSet({
                    [`step${this.state.currentStep + 1}State`]: 'pre-main',
                    [`step${this.state.currentStep}State`]: 'consi-pro-main',
                    currentStep: this.state.currentStep + 1,
                    isClicked: false,
                    enableSave: this.state.currentStep + 1 == 6 ? true : false
                });
            }
            else
                this.stateSet({
                    isClicked: true
                });
        }
    }

    cancelClick() {
        localStorage.removeItem(LocalStorageKeys.LivestockData);
        browserHistory.replace('/envd');
    }

    saveNVD() {
        let currentStep = nvdSteps[this.state.currentStep - 1]
        let isValid = this.refs[currentStep].getData();
        if (isValid) {
            this[currentStep + '_data'] = isValid;

            let finalObj = { addMode: true };
            finalObj[nvdSteps[0]] = this[nvdSteps[0] + '_data'];
            finalObj[nvdSteps[1]] = this[nvdSteps[1] + '_data'];
            finalObj[nvdSteps[2]] = this[nvdSteps[2] + '_data'];
            finalObj[nvdSteps[3]] = this[nvdSteps[3] + '_data'];
            finalObj[nvdSteps[4]] = this[nvdSteps[4] + '_data'];
            finalObj[nvdSteps[5]] = this[nvdSteps[5] + '_data'];

            Object.assign(finalObj, { storeData: this.props.eNVDCommonDetails });

            if (this.commonDetail.isModifyNVD) {
                finalObj.addMode = false;
                finalObj.ReferenceNumber = this.nvdData.ReferenceNumber;
                finalObj.LastNVDStatusId = this.nvdData.LastNVDStatusId;
                finalObj.nvdId = this.nvdData.Id;
                finalObj.NVDType = this.nvdData.NVDType;
                finalObj.nvdAuditId = this.nvdData.NVDAuditId;
                finalObj.nvdDetailId = this.nvdData.NVDDetailId;
                finalObj.nvdAccreditationQuestionnaireAuditId = this.nvdData.NVDAccreditationQuestionnaireAuditLogId;
                finalObj.nvdLPAQuestionnaireAuditId = this.nvdData.NVDLPAQuestionnaireAuditLogId;
            }
            return this.handleAddEdit(finalObj)
        }
        else
            this.stateSet({
                isClicked: true
            });
    }

    handleAddEdit(obj) {
        let _this = this;
        return saveENVD(obj).then(function (res) {
            ;
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                browserHistory.replace('/envd');
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                return false;
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR);
                return false;
            }
        });
    }

    getLivestockSummary() {
        let data = this.refs.prepare_livestock ? this.refs.prepare_livestock.getData() : null;
        return data ? data.livestockSummaryData : [];
    }

    isNTState() {
        let step1 = this[nvdSteps[0] + '_data'];
        let step2 = this[nvdSteps[1] + '_data'];
        return step1.suburb.stateSystemCode == 'NT' || step2.consignedtoSuburbData.stateSystemCode == 'NT' || step2.destinationSuburbData.stateSystemCode == 'NT';
    }

    isSAState() {
        let step1 = this[nvdSteps[0] + '_data'];
        let step2 = this[nvdSteps[1] + '_data'];
        return step1.suburb.stateSystemCode == 'SA' || step2.consignedtoSuburbData.stateSystemCode == 'SA' || step2.destinationSuburbData.stateSystemCode == 'SA';
    }

    renderStep1() {
        return (<this.prepare_livestock {...this.props} isClicked={this.state.isClicked}
            initialDetail={this.commonDetail} changeParentState={this.stateSet} ref='prepare_livestock'
            editData={{ nvdData: this.nvdData, livestockSummaryData: this.livestockSummaryData }} />);
    }

    renderStep2() {
        return (<this.consigned_to_property {...this.props} isClicked={this.state.isClicked}
            ConsignedFromPICId={this.prepare_livestock_data.ConsignedFromPICId}
            editData={this.nvdData} ref='consigned_to_property' />);
    }

    renderStep3() {
        return (<this.consignor_declaration {...this.props} isClicked={this.state.isClicked}
            editData={this.nvdData} ref='consignor_declaration' companyId={this.props.authUser.CompanyId}
            companyName={this.props.authUser.CompanyName}
            PropertyManagerId={this.prepare_livestock_data.PropertyManagerId}
            ConsignedFromPICId={this.prepare_livestock_data.ConsignedFromPICId} />);
    }

    renderStep4() {
        return (<this.questionnaire {...this.props} isSAState={this.isSAState()} isNTState={this.isNTState()} livestockSummaryData={this.getLivestockSummary()} isClicked={this.state.isClicked}
            editData={{
                nvdData: this.nvdData, lpaQuestionnaireData: this.lpaQuestionnaireData,
                accreditationQuestionnireData: this.accreditationQuestionnireData,
                livestockSummaryData: this.livestockSummaryData, documentData: this.documentData
            }} ref='questionnaire' />);
    }

    renderStep5() {
        return (<this.transporter {...this.props} isClicked={this.state.isClicked}
            ConsignedFromPICId={this.prepare_livestock_data.ConsignedFromPICId}
            ConsignedToPICId={this.consigned_to_property_data.ConsignedToPICId}
            editData={this.nvdData} ref='transporter' />);
    }

    renderStep6() {
        return (<this.sale_agent {...this.props} isClicked={this.state.isClicked}
            editData={this.nvdData} ref='sale_agent'
            ConsignedFromPIC={this.prepare_livestock_data.ConsignedFromPIC} />);
    }

    renderForm() {
        let strings = this.strings;
        if (this.state.dataFetch) {
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
                                                label: strings.CONTROLS.CANCEL_LABEL,
                                                className: 'button1Style button30Style',
                                            }}
                                            onClick={this.cancelClick} ></Button>
                                    </li>
                                    {this.state.currentStep == 4 ? <li>
                                        <Button
                                            inputProps={{
                                                name: 'btnUseLastAnswers',
                                                label: strings.CONTROLS.USE_LAST_ANSWERS_LABEL,
                                                className: 'button3Style button30Style'
                                            }}
                                            onClick={() => this.refs.questionnaire.useLastAnswersClick(this.prepare_livestock_data.ConsignedFromPICId)} ></Button>
                                    </li> : null}
                                    <li>
                                        <a href="javascript:void(0)" onClick={() => { this.changeStep('prev', event) }}
                                            className={"ripple-effect filter-btn prev-btn" + (this.state.currentStep == 1 ? " hidden" : "")}>
                                            <img src={this.siteURL + "/static/images/prev-arrow.png"} alt="next" />
                                            {strings.CONTROLS.PREVIOUS_LABEL}
                                        </a>
                                    </li>
                                    <li>
                                        {this.state.enableSave ? <BusyButton
                                            inputProps={{
                                                name: 'btnSave',
                                                label: strings.CONTROLS.SAVE_LABEL,
                                                className: 'button2Style button30Style ' + (this.nvdData.disableAll ? 'hidden' : ''),
                                                disabled: this.nvdData.disableAll
                                            }}
                                            loaderHeight={25}
                                            redirectUrl={'/envd'}
                                            onClick={this.saveNVD} ></BusyButton> :
                                            <a href="javascript:void(0)" onClick={() => { this.changeStep('next', event) }}
                                                className={"ripple-effect filter-btn next-btn" + (this.state.currentStep == 6 ? " hidden" : "")}>
                                                {strings.CONTROLS.NEXT_LABLE}
                                                <img src={this.siteURL + "/static/images/next-arrow.png"} alt="next" />
                                            </a>
                                        }
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="clear"></div>
                    <div className='stock-list'>
                        <div className="stock-list-cover">
                            <div className="row mb10">
                                <div className="col-md-11">
                                    <div className="row mb5">
                                        <div className="col-md-2">
                                            <span><b>{strings.NVD_TYPE_LABEL} </b> {this.state.nvdType}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <span><b>{strings.REFERENCE_NUMBER_LABEL} </b> {this.nvdData.ReferenceNumber}</span>

                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.MLA_VERSION_LABEL} </b> {this.state.mlaSchemaVersion} </span>

                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.COMMENCE_DATE_LABEL} </b> {
                                                this.nvdData.MovementCommenceDate ?
                                                    formatDateTime(this.nvdData.MovementCommenceDate).DateTimeSecond : null}</span>

                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <span><b>{strings.NLIS_UER_STATUS_LABEL} </b> {this.state.nlisUserStatus} </span>
                                        </div>
                                        <div className="col-md-4">
                                            <span><b>{strings.SERIAL_NUMBER} </b> {this.nvdData.SerialNumber}</span>
                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.MLA_API_VERSION_LABEL} </b> {this.state.mlaAPIVersion} </span>
                                        </div>
                                        <div className="col-md-3">
                                        </div>
                                    </div>
                                </div>
                                <div className=" col-md-1">
                                    <div className="cattle-text">
                                        <a href="javascript:void(0)"><img alt="icon" src={this.siteURL + "/static/images/quest-mark-icon.png"} />{this.strings.HELP_LABEL}</a>
                                    </div>
                                </div>
                            </div>
                            <div className="wizard-scroll">
                                <div className="wizard-main">
                                    <div className={this.state.step1State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                        </div>
                                        <h3>{strings.CONTROLS.STEP1_LABEL}</h3>
                                    </div>
                                    <div className={this.state.step2State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />

                                        </div>
                                        <h3>{strings.CONTROLS.STEP2_LABEL}</h3>
                                    </div>
                                    <div className={this.state.step3State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                        </div>
                                        <h3>{strings.CONTROLS.STEP3_LABEL}</h3>
                                    </div>
                                    <div className={this.state.step4State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                        </div>
                                        <h3>{strings.CONTROLS.STEP4_LABEL}</h3>
                                    </div>
                                    <div className={this.state.step5State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                        </div>
                                        <h3>{strings.CONTROLS.STEP5_LABEL}</h3>
                                    </div>
                                    <div className={this.state.step6State}>
                                        <div className="pro-circle">
                                            <img className="consi-pro" src={this.siteURL + "/static/images/tick-mark.png"} alt="tick" />
                                            <img src={this.siteURL + "/static/images/quest-mark.png"} alt="tick" />
                                        </div>
                                        <h3>{strings.CONTROLS.STEP6_LABEL}</h3>
                                    </div>
                                </div>
                            </div>
                            {this.prepare_livestock ?
                                <div className={this.state.currentStep == 1 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep1()}
                                </div> : null
                            }
                            {this.consigned_to_property ?
                                <div className={this.state.currentStep == 2 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep2()}
                                </div> : null
                            }
                            {this.consignor_declaration ?
                                <div className={this.state.currentStep == 3 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep3()}
                                </div> : null
                            }
                            {this.questionnaire ?
                                <div className={this.state.currentStep == 4 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep4()}
                                </div> : null
                            }
                            {this.transporter ?
                                <div className={this.state.currentStep == 5 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep5()}
                                </div> : null
                            }
                            {this.sale_agent ?
                                <div className={this.state.currentStep == 6 ? 'col-md-12' : 'col-md-12 hidden'}>
                                    {this.renderStep6()}
                                </div> : null
                            }
                        </div>
                    </div>
                </div >
            );
        }
        else {
            return <LoadingIndicator />;
        }
    }

    render() {
        return (
            this.renderForm()
        );
    }
}

export default ENVDDetail;