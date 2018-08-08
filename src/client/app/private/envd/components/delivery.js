'use strict';

/*************************************
 * e-NVD update delivery
 * *************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from './../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import GPS_Coordinate from '../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import ImportPopup from './import_popup';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getNVDDeliveryInitialData, updateDelivery } from '../../../../services/private/envd';
import { getEnclosureType } from '../../../../services/private/livestock';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import { formatDateTime, isAfter, isBetween } from '../../../../../shared/format/date';
import { bufferToUUID } from '../../../../../shared/uuid';
import { LocalStorageKeys, nvdTypes, varianceTypes, nvdImportTypes } from '../../../../../shared/constants';

class UpdateDelivery extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        if (!isUUID(this.props.params.subdetail)) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_ID });
            browserHistory.replace('/envd');
            return;
        }
        else {
            let data = localStorage.getItem(LocalStorageKeys.eNVDData);
            let json = JSON.parse(data);
            this.nvdData = json.data[0];
        }
        this.popupData = null;
        this.enclosureName = '';
        this.deliverySchema = ['deliverydate', 'deliveryLivestockNumber', 'suspectQuantity', 'condemnedQuantity',
            'welfareactivity', 'welfareactivitytime', 'comment'];
        this.state = {
            dataFetch: false,
            canAddEnclosure: false,
            isNewEnclosure: false,
            enclosure: [],
            enclosureReady: false,
            enclosuretypes: [],
            enclosuretypesReady: false,
            isClicked: false,
            openImportPopup: false,
            disableLivestockNumber: Math.random()
        };

        this.renderForm = this.renderForm.bind(this);
        this.toggleCreateEnclosure = this.toggleCreateEnclosure.bind(this);
        this.updateDelivery = this.updateDelivery.bind(this);
        this.enclosureChange = this.enclosureChange.bind(this);
        this.toggleImportPopup = this.toggleImportPopup.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.livestockCountChange = this.livestockCountChange.bind(this);
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
        let _this = this;
        getNVDDeliveryInitialData(this.props.params.subdetail).then(function (res) {
            if (res.success) {
                Object.assign(_this.nvdData, res.data.data[0][0]);
                
                _this.nvdData.NVDTypeText = Object.keys(nvdTypes).find(key => nvdTypes[key] === _this.nvdData.NVDType);
                _this.nvdData.NVDLivestocks = res.data.data[4];
                _this.nvdData.NVDLivestockSummary = res.data.data[5];
                _this.stateSet({
                    dataFetch: true, enclosure: res.data.data[1], enclosureReady: true,
                    canAddEnclosure: res.data.data[2].length > 0 || res.data.data[3].length > 0 ? true : false
                });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    toggleCreateEnclosure() {
        let isNewEnclosure = this.state.isNewEnclosure;
        if (!isNewEnclosure && this.state.enclosuretypes.length < 1) {
            let topPIC = this.props.topPIC;
            topPIC.PropertyId = this.nvdData.DestinationPropertyId;
            let _this = this;
            getEnclosureType(topPIC).then(function (res) {
                if (res.success) {
                    _this.stateSet({ enclosuretypes: res.data, enclosuretypesReady: true });
                }
            })
        }
        this.setState({ isNewEnclosure: !isNewEnclosure });
    }

    enclosureChange(value, text) {
        this.enclosureName = text;
    }

    livestockCountChange() {
        this.refs.condemnedQuantity.updateInputStatus();
        this.refs.suspectQuantity.updateInputStatus();
        this.refs.deliveryLivestockNumber.updateInputStatus();
        let condemnedQuantity = this.refs.condemnedQuantity.fieldStatus.value;
        let suspectQuantity = this.refs.suspectQuantity.fieldStatus.value;
        let deliveryLivestockNumber = this.refs.deliveryLivestockNumber.fieldStatus.value;
        let deliverQuantity = (parseInt(condemnedQuantity) || 0) + (parseInt(suspectQuantity) || 0) +
            (parseInt(deliveryLivestockNumber) || 0);
        if (deliverQuantity != this.nvdData.TotalLivestockQty) {
            this.nvdData.varianceQty = deliverQuantity - this.nvdData.TotalLivestockQty;
            this.nvdData.varianceType = this.nvdData.varianceQty > 0 ? varianceTypes.More : varianceTypes.Less;
        }
    }

    updateDelivery() {
        
        if (this.popupData && !this.popupData.canUpdateDelivery) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.IMPORT_CSV_VALIDATION });
            return false;
        }
        if (this.state.isNewEnclosure) {
            if (this.deliverySchema.indexOf('enclosuretype') == -1) {
                this.deliverySchema.push('enclosuretype');
                this.deliverySchema.push('enclosurename');
            }
            if (this.deliverySchema.indexOf('enclosure') != -1) {
                this.deliverySchema.splice(this.deliverySchema.indexOf('enclosure'), 1);
            }
        }
        else {
            if (this.deliverySchema.indexOf('enclosure') == -1) {
                this.deliverySchema.push('enclosure');
            }
            if (this.deliverySchema.indexOf('enclosuretype') != -1) {
                this.deliverySchema.splice(this.deliverySchema.indexOf('enclosuretype'), 1);
                this.deliverySchema.splice(this.deliverySchema.indexOf('enclosurename'), 1);
            }
        }
        let isValid = isValidForm(this.deliverySchema, this.refs);
        if (!isValid) {
            this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let updateDeliveryValues = getForm(this.deliverySchema, this.refs);
        updateDeliveryValues.popupData = this.popupData;
        let gps = this.refs.gps.GPSValue;
        if (!updateDeliveryValues.enclosurename) updateDeliveryValues.enclosurename = this.enclosureName;
        updateDeliveryValues.gps = gps;
        updateDeliveryValues.isNewEnclosure = this.state.isNewEnclosure;
        let deliverQuantity = (parseInt(updateDeliveryValues.deliveryLivestockNumber) || 0) +
            (parseInt(updateDeliveryValues.suspectQuantity) || 0) +
            (parseInt(updateDeliveryValues.condemnedQuantity) || 0);
        if (deliverQuantity != this.nvdData.TotalLivestockQty) {
            updateDeliveryValues.isVarianceQty = true;
            updateDeliveryValues.varianceQty = deliverQuantity - this.nvdData.TotalLivestockQty;
            updateDeliveryValues.varianceType = updateDeliveryValues.varianceQty > 0 ? varianceTypes.More : varianceTypes.Less;
        }

        // validations
        if (!isAfter(updateDeliveryValues.deliverydate, this.nvdData.MovementCommenceDate)) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.DELIVERY_DATE_INVALID_MESSAGE });
            return false;
        }
        if (!isBetween(updateDeliveryValues.welfareactivitytime, this.nvdData.MovementCommenceDate,
            updateDeliveryValues.deliverydate)) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.WELFARE_ACTIVITY_TIME_INVALID_MESSAGE });
            return false;
        }
        if (this.nvdData.IsMobNVD == 0) {
            if (updateDeliveryValues.isVarianceQty && !updateDeliveryValues.popupData) {
                this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VARIANCE_DETAIL_REQ_MESSAGE });
                return false;
            }
            if (updateDeliveryValues.popupData && updateDeliveryValues.popupData.importtype == nvdImportTypes.Variance) {
                if (updateDeliveryValues.popupData.additionalData.varianceType != updateDeliveryValues.varianceType) {
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VARIANCE_MISSMATCH });
                    return false;
                }
                if (updateDeliveryValues.popupData.additionalData.deceaseLivestock &&
                    Math.abs(updateDeliveryValues.varianceQty) != updateDeliveryValues.popupData.additionalData.deceaseLivestock.length) {
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VARIANCE_MISSMATCH });
                    return false;
                }
                else if (updateDeliveryValues.popupData.additionalData.inductLivestock &&
                    Math.abs(updateDeliveryValues.varianceQty) != updateDeliveryValues.popupData.additionalData.inductLivestock.length) {
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.VARIANCE_MISSMATCH });
                    return false;
                }
            }
        }

        let _this = this;
        return updateDelivery(updateDeliveryValues, this.nvdData).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
                return true;
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR);
            }
        }).catch(function () {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    cancelClick() {
        localStorage.removeItem(LocalStorageKeys.eNVDData);
        browserHistory.replace('/envd')
    }

    toggleImportPopup(popupData) {
        
        this.popupData = popupData;
        let stateObj = {
            openImportPopup: !this.state.openImportPopup
        }
        if (this.popupData && this.popupData.importtype == nvdImportTypes.DeliveredLivestock) {
            stateObj.disableLivestockNumber = true;
        }
        this.stateSet(stateObj);
    }

    renderForm() {
        let strings = this.strings.CONTROLS;
        if (this.state.dataFetch) {
            return (
                <div>
                    <div className="dash-right-top">
                        <div className="live-detail-main">
                            <div className="configure-head">
                                <span>{this.strings.TITLE}</span>
                            </div>
                            <div className="l-stock-top-btn configure-right wizard-right">
                                <ul>
                                    {this.nvdData.IsMobNVD != 1 ?
                                        <li>
                                            <Button
                                                inputProps={{
                                                    name: 'btnImport',
                                                    label: strings.IMPORT_CSV_LABEL,
                                                    className: 'button1Style button30Style',
                                                }}
                                                onClick={this.toggleImportPopup} ></Button>
                                        </li> : null}
                                    <li>
                                        <Button
                                            inputProps={{
                                                name: 'btnCancel',
                                                label: strings.CANCEL_LABEL,
                                                className: 'button1Style button30Style',
                                            }}
                                            onClick={this.cancelClick} ></Button>
                                    </li>
                                    <li>
                                        <BusyButton
                                            inputProps={{
                                                name: 'btnSave',
                                                label: strings.SAVE_LABEL,
                                                className: 'button2Style button30Style'
                                            }}
                                            loaderHeight={25}
                                            redirectUrl='/envd'
                                            onClick={this.updateDelivery}></BusyButton>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="clear"></div>
                    <div className='stock-list mb15'>
                        <div className="stock-list-cover mb15">
                            <div className="cattle-text">
                                <div className='col-md-12'>
                                    <span><b>{strings.NVD_TYPE_LABEL} </b> {this.nvdData.NVDTypeText}</span>
                                    <span><b>{strings.MLA_VERSION_LABEL} </b> </span>
                                    <span><b>{strings.MLA_API_VERSION_LABEL} </b> </span>
                                    <span><b>{strings.NLIS_UER_STATUS_LABEL} </b> {
                                        this.nvdData.NLISUsername && this.nvdData.NLISPassword ?
                                            this.strings.NLIS_UER_ENTERED : this.strings.NLIS_UER_NOT_ENTERED
                                    } </span>
                                </div>
                                <div className='col-md-12'>
                                    <span><b>{strings.REFERENCE_NUMBER_LABEL} </b> {this.nvdData.ReferenceNumber}</span>
                                    <span><b>{strings.SERIAL_NUMBER} </b> {this.nvdData.SerialNumber}</span>
                                    <span><b>{strings.COMMENCE_DATE_LABEL} </b> {formatDateTime(this.nvdData.MovementCommenceDate).DateTimeSecond}</span>
                                </div>
                                <a href="javascript:void(0)"><img alt="icon" src={this.siteURL + "/static/images/quest-mark-icon.png"} />Help</a>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className='col-md-6'>
                                        <div className='col-md-12'>
                                            <DateTimePicker inputProps={{
                                                name: 'deliverydate',
                                                placeholder: strings.DELIVERY_DATE_PLACEHOLDER,
                                                label: strings.DELIVERY_DATE_LABEL
                                            }}
                                                dateFormat='DD/MM/YYYY' updateOnChange={true}
                                                dateFilter={{ minDate: new Date(-8640000000000000), maxDate: new Date() }}
                                                defaultValue={new Date()}
                                                isClicked={this.state.isClicked} ref='deliverydate' />
                                        </div>
                                        <div className='col-md-12'>
                                            <NumberInput inputProps={{
                                                name: 'totalLivestockNumber',
                                                hintText: strings.TOTAL_LIVESTOCK_PLACEHOLDER,
                                                floatingLabelText: strings.TOTAL_LIVESTOCK_LABEL,
                                                disabled: true
                                            }}
                                                maxLength={5} initialValue={this.nvdData.TotalLivestockQty}
                                                isClicked={this.state.isClicked} ref="totalLivestockNumber" />
                                        </div>
                                        <div key={this.state.disableLivestockNumber}>
                                            <div className='col-md-12'>
                                                <NumberInput inputProps={{
                                                    name: 'deliveryLivestockNumber',
                                                    hintText: strings.DELIVERY_LIVESTOCK_PLACEHOLDER,
                                                    floatingLabelText: strings.DELIVERY_LIVESTOCK_LABEL,
                                                    disabled: this.popupData ?
                                                        this.popupData.importtype == nvdImportTypes.DeliveredLivestock :
                                                        false
                                                }}
                                                    maxLength={5} initialValue={this.nvdData.TotalLivestockQty}
                                                    onChangeInput={this.livestockCountChange}
                                                    isClicked={this.state.isClicked} ref="deliveryLivestockNumber" />
                                            </div>
                                            <div className='col-md-12'>
                                                <NumberInput inputProps={{
                                                    name: 'suspectQuantity',
                                                    hintText: strings.SUSPECT_QUANTITY_PLACEHOLDER,
                                                    floatingLabelText: strings.SUSPECT_QUANTITY_LABEL,
                                                    disabled: this.popupData ?
                                                        this.popupData.importtype == nvdImportTypes.DeliveredLivestock :
                                                        false
                                                }}
                                                    maxLength={5} initialValue=''
                                                    onChangeInput={this.livestockCountChange}
                                                    isClicked={this.state.isClicked} ref="suspectQuantity" />
                                            </div>
                                            <div className='col-md-12'>
                                                <NumberInput inputProps={{
                                                    name: 'condemnedQuantity',
                                                    hintText: strings.CONDEMNED_QUANTITY_PLACEHOLDER,
                                                    floatingLabelText: strings.CONDEMNED_QUANTITY_LABEL,
                                                    disabled: this.popupData ?
                                                        this.popupData.importtype == nvdImportTypes.DeliveredLivestock :
                                                        false
                                                }}
                                                    maxLength={5} initialValue=''
                                                    onChangeInput={this.livestockCountChange}
                                                    isClicked={this.state.isClicked} ref="condemnedQuantity" />
                                            </div>
                                        </div>
                                        {this.state.isNewEnclosure ?
                                            <div>
                                                <div className='col-md-12'>
                                                    <Dropdown inputProps={{
                                                        name: 'enclosuretype',
                                                        hintText: this.state.enclosuretypesReady ? strings.ENCLOSURE_TYPE_PLACEHOLDER : 'Loading...',
                                                        floatingLabelText: strings.ENCLOSURE_TYPE_LABEL,
                                                        value: null
                                                    }}
                                                        eReq={strings.ENCLOSURE_TYPE_REQ_MESSAGE}
                                                        textField="NameCode" valueField="Id" dataSource={this.state.enclosuretypes}
                                                        isClicked={this.state.isClicked} ref="enclosuretype" />
                                                </div>
                                                <div className='col-md-12'>
                                                    <Input inputProps={{
                                                        name: 'enclosurename',
                                                        hintText: strings.ENCLOSURE_NAME_PLACEHOLDER,
                                                        floatingLabelText: strings.ENCLOSURE_NAME_LABEL
                                                    }}
                                                        eReq={strings.ENCLOSURE_NAME_REQ_MESSAGE}
                                                        maxLength={50} initialValue=''
                                                        isClicked={this.state.isClicked} ref="enclosurename" />
                                                </div>
                                                <div className='col-md-12'>
                                                    <Button
                                                        inputProps={{
                                                            name: 'btnCancelUser',
                                                            label: strings.CANCEL_LABEL,
                                                            className: 'button1Style button30Style'
                                                        }}
                                                        onClick={this.toggleCreateEnclosure} ></Button>
                                                </div>
                                            </div>
                                            :
                                            <div>
                                                <div className='col-md-12'>
                                                    <Dropdown inputProps={{
                                                        name: 'enclosure',
                                                        hintText: this.state.enclosureReady ? strings.ENCLOSURE_PLACEHOLDER : 'Loading...',
                                                        floatingLabelText: strings.ENCLOSURE_LABEL,
                                                        value: null
                                                    }}
                                                        eReq={strings.ENCLOSURE_REQ_MESSAGE}
                                                        textField="Name" valueField="Id" dataSource={this.state.enclosure}
                                                        onSelectionChange={this.enclosureChange}
                                                        isClicked={this.state.isClicked} ref="enclosure" />
                                                </div>
                                                {this.state.canAddEnclosure ?
                                                    <div className='col-md-12'>
                                                        <Button
                                                            inputProps={{
                                                                name: 'btnCreateEnclosure',
                                                                label: strings.CREATE_ENCLOSURE_LABEL,
                                                                className: 'button1Style button30Style'
                                                            }}
                                                            onClick={this.toggleCreateEnclosure} ></Button>
                                                    </div> : null}
                                            </div>
                                        }
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'welfareactivity',
                                                hintText: strings.WELFARE_ACTIVITY_PLACEHOLDER,
                                                floatingLabelText: strings.WELFARE_ACTIVITY_LABEL
                                            }}
                                                maxLength={200} initialValue='' multiLine={true}
                                                isClicked={this.state.isClicked} ref="welfareactivity" />
                                        </div>
                                        <div className='col-md-12'>
                                            <DateTimePicker inputProps={{
                                                name: 'welfareactivitytime',
                                                placeholder: strings.WELFARE_ACTIVITY_TIME_PLACEHOLDER,
                                                label: strings.WELFARE_ACTIVITY_TIME_LABEL
                                            }}
                                                dateFormat='DD/MM/YYYY'
                                                dateFilter={{ minDate: new Date(-8640000000000000), maxDate: new Date() }}
                                                defaultValue={new Date()}
                                                isClicked={this.state.isClicked} ref='welfareactivitytime' />
                                        </div>
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'comment',
                                                hintText: strings.COMMENT_PLACEHOLDER,
                                                floatingLabelText: strings.COMMENT_LABEL
                                            }}
                                                maxLength={200} initialValue='' multiLine={true}
                                                isClicked={this.state.isClicked} ref="comment" />
                                        </div>
                                        <div className="col-md-12">
                                            <GPS_Coordinate strings={{
                                                hintText: strings.GPS_PLACEHOLDER,
                                                floatingLabelText: strings.GPS_LABEL,
                                                COMMON: this.strings.COMMON
                                            }}
                                                propertyId={this.props.topPIC.PropertyId} ref='gps'
                                                initialCords={this.nvdData.GPS || null} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        <div className="col-md-12 mt10">
                                            <b>Consigned From</b>
                                            <br />
                                            <br />
                                        </div>
                                        <div className="col-md-12">
                                            {this.nvdData.ConsignerPIC}
                                            <br />
                                            {this.nvdData.ConsignerPropertyName}
                                            <br />
                                            {this.nvdData.ConsignerPropertyAddress}
                                            <br />
                                            {this.nvdData.ConsignerAddress}
                                            <br />
                                            <br />
                                            <br />
                                            <br />
                                        </div>
                                        <div className="col-md-12">
                                            <b>Sale Agent</b>
                                            <br />
                                        </div>
                                        <div className="col-md-12">
                                            {this.nvdData.SaleAgentName}
                                            <br />
                                            {this.nvdData.SaleAgentCompanyName}
                                            <br />
                                            {this.nvdData.SaleAgentAddress}
                                            <br />
                                            {this.nvdData.SaleAgentSuburb}
                                            <br />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return <LoadingIndicator />;
        }
    }

    render() {
        return (
            <div>
                {this.renderForm()}
                <div className="clear"></div>
                {this.state.openImportPopup ?
                    <ImportPopup
                        notifyToaster={this.notifyToaster}
                        strings={{ ...this.strings.IMPORT_POPUP, COMMON: this.strings.COMMON }}
                        toggleImportPopup={this.toggleImportPopup}
                        nvdDetail={this.nvdData} />
                    : null}
            </div>
        );
    }
}

export default UpdateDelivery;