'use strict';

/**************************
 * Pickup eNVD to add transporter
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import Transporter from './transporter';

import { SET_COMMON_DETAILS } from '../actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import { bufferToUUID } from '../../../../../shared/uuid';
import { nvdTypes, nvdStatusCodes } from '../../../../../shared/constants';
import { formatDateTime } from '../../../../../shared/format/date';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';
import { pickupENVD, getNVDDetail } from '../../../../services/private/envd';

class ENVDPickup extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.backToeNVD = this.backToeNVD.bind(this);

        this.nvdData = {};
        this.commonDetail = {};
        this.infoObj = {};

        this.state = {
            isClicked: false,
            dataFetch: false
        };
        this.saveNVD = this.saveNVD.bind(this);
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
        if (this.props.params.subdetail) {
            if (!isUUID(this.props.params.subdetail)) {
                this.backToeNVD(this.strings.INVALID_ID);
                return;
            }
            this.commonDetail.isModifyNVD = true;
            this.commonDetail.nvdId = this.props.params.subdetail;
        }
        else {
            this.backToeNVD(this.strings.INVALID_ID);
            return;
        }
        this.props.setNVDCommonDetail(SET_COMMON_DETAILS, this.commonDetail);

        if (this.commonDetail.nvdId) {
            let _this = this;
            getNVDDetail(this.commonDetail.nvdId).then(function (res) {
                if (res.success) {
                    _this.ConsignedFromPICId = res.data.nvdData[0].ConsignerPropertyId;
                    _this.ConsignedToPICId = res.data.nvdData[0].ConsigneePropertyId;
                    _this.nvdData = res.data.nvdData[0];

                    // check eNVD is valid for pickup
                    if (_this.nvdData.TransporterCompanyId == null || _this.nvdData.TransporterContactId != null ||
                        (_this.nvdData.StatusCode != nvdStatusCodes.Draft && _this.nvdData.StatusCode != nvdStatusCodes.Pending)) {
                        _this.backToeNVD(_this.strings.INVALID_ID);
                    }

                    _this.commonDetail.nvdType = _this.nvdData.NVDType;
                    _this.commonDetail.nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === _this.commonDetail.nvdType);
                    _this.props.setNVDCommonDetail(SET_COMMON_DETAILS, _this.commonDetail);

                    _this.infoObj = {
                        nvdType: _this.commonDetail.nvdTypeName,
                        mlaVersion: _this.nvdData.MLASchemaVersion,
                        mlaApiVersion: _this.nvdData.MLAApiVersion,
                        nlisUserStatus: _this.nvdData.NLISUserStatus,
                        referenceNumber: _this.nvdData.ReferenceNumber,
                        serialNumber: _this.nvdData.SerialNumber,
                        movementCommenceDate: formatDateTime(_this.nvdData.MovementCommenceDate).DateTime
                    }

                    _this.stateSet({ dataFetch: true });
                }
            });
        }
        else {
            this.stateSet({ dataFetch: true });
        }
    }

    backToeNVD(inValidMsg) {
        this.mounted = false;
        if (inValidMsg)
            this.notifyToaster(NOTIFY_ERROR, { message: inValidMsg });
        browserHistory.replace('/envd');
    }

    saveNVD() {
        let obj = this.refs.transporter.getData();
        if (!obj && !this.state.isClicked) {
            this.stateSet({ isClicked: true });
            return false;
        }
        else if (!obj.transporterContact) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.TRANSPORTER_REQ });
            return false;
        }

        let finalObj = {};
        finalObj.transporter = obj;
        finalObj.nvdId = this.nvdData.Id;
        finalObj.nvdAuditId = bufferToUUID(this.nvdData.NVDAuditId);
        finalObj.nvdDetailId = this.nvdData.NVDDetailId;

        let _this = this;
        return pickupENVD(finalObj).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                return true;
            }
            else if (res.badRequest)
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            else
                _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    render() {
        let strings = this.strings;
        if (this.state.dataFetch) {
            return (
                <div>
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
                                            onClick={() => this.backToeNVD()} ></Button>
                                    </li>
                                    <li>
                                        <BusyButton
                                            inputProps={{
                                                name: 'btnSave',
                                                label: strings.CONTROLS.SAVE_LABEL,
                                                className: 'button2Style button30Style'
                                            }}
                                            loaderHeight={25}
                                            redirectUrl={'/envd'}
                                            onClick={this.saveNVD} ></BusyButton>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="clear"></div>
                    <div className='stock-list mb15'>
                        <div className="stock-list-cover">
                            <div className="row mb10">
                                <div className="col-md-11">
                                    <div className="row mb5">
                                        <div className="col-md-2">
                                            <span><b>{strings.NVD_TYPE_LABEL} </b> {this.infoObj.nvdType}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <span><b>{strings.REFERENCE_NUMBER_LABEL} </b> {this.infoObj.referenceNumber}</span>
                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.MLA_VERSION_LABEL} </b> {this.infoObj.mlaVersion} </span>
                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.MOVEMENT_COMMENCE_DATE_LABEL} </b> {
                                                this.infoObj.movementCommenceDate ?
                                                    formatDateTime(this.infoObj.movementCommenceDate).DateTimeSecond : null}</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <span><b>{strings.NLIS_USER_STATUS_LABEL} </b> {this.infoObj.nlisUserStatus} </span>
                                        </div>
                                        <div className="col-md-4">
                                            <span><b>{strings.SERIAL_NUMBER_LABEL} </b> {this.infoObj.serialNumber}</span>
                                        </div>
                                        <div className="col-md-3">
                                            <span><b>{strings.MLA_API_VERSION_LABEL} </b> {this.infoObj.mlaApiVersion}</span>
                                        </div>
                                        <div className="col-md-3"></div>
                                    </div>
                                </div>
                                <div className="col-md-1">
                                    <a href="javascript:void(0)"><img alt="icon" src={this.siteURL + "/static/images/quest-mark-icon.png"} />Help</a>
                                </div>
                            </div>
                            <div className='row'>
                                <Transporter {...this.props} isClicked={this.state.isClicked}
                                    ConsignedFromPICId={this.ConsignedFromPICId}
                                    ConsignedToPICId={this.ConsignedToPICId}
                                    editData={this.nvdData} isPickupeNVD={true} ref='transporter' />
                            </div>
                        </div>
                    </div>
                </div >
            );
        }
        else {
            return <LoadingIndicator />;
        }
    }
}

export default ENVDPickup;