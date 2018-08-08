'use strict';

/****************************************
 * Move livestock & Mob to particular
 * Enclosure
 * **************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { countBy as _countBy, sumBy as _sumBy, map as _map, isEmpty as _isEmpty, isUndefined as _isUndefined } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import GpsCoordinate from '../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';

import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../common/actiontypes';
import { LocalStorageKeys } from '../../../../../shared/constants';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getDisposalMethod, recordDeceased, recordDeceasedKillEligible } from '../../../../services/private/livestock';

class RecordDeceased extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: Math.random(),
            isClicked: false,
            disposalMethodReady: false,
            disposalMethods: []
        }
        this.shouldPostNlis = false;
        this.isMob = false;
        this.numberOfLivestock = '0';
        this.deceasedSchema = ['dateOfDeceased', 'disposalMethod', 'deathReason', 'numberOfLivestock'];
        this.disposalMethodCode = null;

        this.strings = this.props.strings;
        this.onReset = this.onReset.bind(this);
        this.validateBeforeSave = this.validateBeforeSave.bind(this);
        this.save = this.save.bind(this);
        this.validateNlis = this.validateNlis.bind(this);
        this.onCancel = this.onCancel.bind(this);

        this.disposalMethodChange = this.disposalMethodChange.bind(this);
    }

    componentWillMount() {
        let data = localStorage.getItem(LocalStorageKeys.LivestockData);

        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            browserHistory.replace('/livestock');
            this.livestocks = [];
            this.numberOfLivestock = '0';
        }
        else {
            let json = JSON.parse(data);
            this.livestocks = json.data;
            this.numberOfLivestock = _sumBy(this.livestocks, (f) => {
                if (f.IsMob == 1) {
                    this.isMob = true
                    return f.NumberOfHead;
                }
                return 1;
            }).toString();
            this.mounted = true;
        }
    }

    componentDidMount() {
        let _this = this;
        getDisposalMethod(_this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({ disposalMethods: res.data, disposalMethodReady: true });
                return;
            }
            _this.stateSet({ disposalMethods: [], disposalMethodReady: true });
        }).catch(function (err) {
            _this.stateSet({ disposalMethods: [], disposalMethodReady: true });
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    disposalMethodChange(value, text) {
        if (value) this.disposalMethodCode = text;
        else this.disposalMethodCode = null;
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
    }

    onReset() {
        this.stateSet({ key: Math.random() });
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    validateBeforeSave(formValues) {
        let isValid = isValidForm(this.deceasedSchema, this.refs);
        if (!isValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        if (parseInt(formValues.numberOfLivestock) == 0) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.ZERO_LIVESTOCK_COUNT });
            return false;
        }
        if (parseInt(formValues.numberOfLivestock) > parseInt(this.numberOfLivestock)) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.MORE_LIVESTOCK_COUNT });
            return false;
        }
        return true;
    }

    save() {
        let formValues = getForm(this.deceasedSchema, this.refs);
        let isValid = this.validateBeforeSave(formValues);

        if (isValid == true) {
            let eventGps = this.refs.GpsCoordinate.GPSValue;
            let _this = this;
            return recordDeceased({
                dateOfDeceased: formValues.dateOfDeceased,
                eventGps: eventGps,
                disposalMethodId: formValues.disposalMethod,
                disposalMethodCode: this.disposalMethodCode,
                deathReason: formValues.deathReason,
                propertyId: this.props.topPIC.PropertyId,
                livestockCount: formValues.numberOfLivestock,
                isMob: this.isMob,
                shouldPostNlis: this.shouldPostNlis,
                livestockIds: this.livestocks.map(function (f) {
                    return f.Id;
                })
            }).then(function (res) {
                if (res.success) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
                    _this.props.hideConfirmPopup();
                    setTimeout(() => {
                        browserHistory.replace('/livestock');
                    }, 1500);
                }
                else {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error.toString() });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    validateNlis() {
        let formValues = getForm(this.deceasedSchema, this.refs);
        let isValid = this.validateBeforeSave(formValues);

        if (isValid == true) {
            let _this = this;
            return recordDeceasedKillEligible(_this.livestocks.map(function (f) {
                return f.Id;
            }), _this.props.topPIC).then(function (res) {
                if (res.success) {

                    let count = res.response.filter(function (i) {
                        return i.EID == null || i.EID == undefined;
                    });
                    if (count.length > 0) {
                        let m = _this.strings.POST_NLIS_CONFIRMATION_MESSAGE;
                        m = m.replace('{X}', count.length);
                        m = m.replace('{T}', res.response.length);
                        // pass custom payload with popup
                        _this.shouldPostNlis = true;
                        let payload = {
                            confirmText: m,
                            strings: _this.strings.CONFIRMATION_POPUP_COMPONENT,
                            onConfirm: _this.save
                        };
                        _this.props.openConfirmPopup(payload);
                    }
                    else {
                        _this.shouldPostNlis = true;
                        _this.save();
                    }
                }
                else {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            })
        }
    }

    onCancel() {
        browserHistory.replace('/livestock');
    }

    renderHeader() {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnCancel',
                                        label: this.strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.onCancel} ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnReset',
                                        label: this.strings.CONTROLS.RESET_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.onReset} ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnSave',
                                        label: this.strings.CONTROLS.SAVE_LABEL,
                                        className: this.isMob == false || this.isMob == 0 ? 'button2Style button30Style ripple-effect search-btn' : 'button2Style button30Style'
                                    }}
                                    loaderHeight={25}
                                    redirectUrl='/livestock'
                                    onClick={() => {
                                        this.shouldPostNlis = false;
                                        this.save();
                                    }} ></BusyButton>
                                {this.isMob == false || this.isMob == 0 ? <span> <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown">
                                    <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                    <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                        <li>
                                            <ul>
                                                <li>
                                                    <a href="javascript:void(0)" onClick={this.validateNlis}>
                                                        {this.strings.CONTROLS.SAVE_NLIS_LABEL}
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </span> : null}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>);
    }

    renderContent() {
        return (
            <div className="stock-list" key={this.state.key}>
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="form-group">
                            <div className="col-md-6">
                                <div className="row">
                                    <NumberInput inputProps={{
                                        name: 'numberOfLivestock',
                                        hintText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_HINT,
                                        floatingLabelText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_FLOATING,
                                        disabled: !this.isMob
                                    }}
                                        isClicked={this.state.isClicked}
                                        eReq={this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_REQ_MESSAGE}
                                        initialValue={this.numberOfLivestock}
                                        ref="numberOfLivestock" />
                                </div>
                                <div className="row">
                                    <Dropdown inputProps={{
                                        name: 'disposalMethod',
                                        hintText: this.state.disposalMethodReady ? this.strings.CONTROLS.DISPOSAL_METHOD_PLACEHOLDER : 'Loading...',
                                        floatingLabelText: this.strings.CONTROLS.DISPOSAL_METHOD_LABEL,
                                        value: null
                                    }}
                                        eReq={this.strings.CONTROLS.DISPOSAL_METHOD_REQ_MESSAGE}
                                        onSelectionChange={this.disposalMethodChange}
                                        textField="NameCode" valueField="Id" dataSource={this.state.disposalMethods}
                                        isClicked={this.state.isClicked} ref="disposalMethod" />
                                </div>
                                <div className="row">
                                    <Input inputProps={{
                                        name: 'deathReason',
                                        hintText: this.strings.CONTROLS.DEATH_REASON_HINT,
                                        floatingLabelText: this.strings.CONTROLS.DEATH_REASON_FLOATING
                                    }}
                                        isClicked={this.state.isClicked}
                                        maxlength={200}
                                        ref="deathReason" />
                                </div>
                                <div className="row">
                                    <DatetimePicker inputProps={{
                                        name: 'dateOfDeceased',
                                        placeholder: this.strings.CONTROLS.DECEASED_DATE_LABEL
                                    }}
                                        eReq={this.strings.CONTROLS.DECEASED_DATE_REQ_MESSAGE}
                                        defaultValue={new Date()}
                                        timeFormat={false}
                                        isClicked={this.state.isClicked} ref="dateOfDeceased" />
                                </div>
                                <div className="row">
                                    <GpsCoordinate strings={{
                                        hintText: this.strings.CONTROLS.EVENTGPS_PLACEHOLDER,
                                        floatingLabelText: this.strings.CONTROLS.EVENTGPS_LABEL, COMMON: this.strings.COMMON
                                    }}
                                        propertyId={this.props.topPIC.PropertyId} ref='GpsCoordinate'
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="row">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default RecordDeceased;