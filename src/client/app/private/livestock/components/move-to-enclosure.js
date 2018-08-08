'use strict';

/****************************************
 * Move livestock & Mob to particular
 * Enclosure
 * **************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { sumBy as _sumBy, map as _map, isEmpty as _isEmpty, isUndefined as _isUndefined } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import GpsCoordinate from '../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';

import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../common/actiontypes';
import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { getEnclosureType, getEnclosureByType, moveToEnclosure } from '../../../../services/private/livestock';
import { LocalStorageKeys } from '../../../../../shared/constants';

class MoveToEnclosure extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: Math.random(),
            isClicked: false,
            enclosureTypes: [],
            enclosureTypeReady: false,
            enclosureNames: [],
            enclosureNameReady: false,
            typeKey: Math.random(),
            nameKey: Math.random()
        }
        this.movementSchema = ['numberOfLivestock', 'numberOfMob', 'totalCurrentWeight', 'dateOfMovement', 'enclosureType', 'enclosureName'];

        this.strings = this.props.strings;
        this.onReset = this.onReset.bind(this);
        this.save = this.save.bind(this);
        this.enclosureTypeOnChange = this.enclosureTypeOnChange.bind(this);
        this.enclosureNameOnChange = this.enclosureNameOnChange.bind(this);
    }

    componentWillMount() {
        let data = localStorage.getItem(LocalStorageKeys.LivestockData);

        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            browserHistory.replace('/livestock');
            this.livestocks = [];
            this.numberOfLivestock = "0";
            this.numberOfMob = "0";
            this.totalCurrentWeight = "0";
        }
        else {
            let json = JSON.parse(data);
            this.livestocks = _map(json.data, function (m) {
                return { LivestockId: m.Id, CurrentWeight: m.CurrentWeight };
            });
            this.numberOfLivestock = json.data.length.toString();
            this.numberOfMob = "0";
            let totalWeight = _sumBy(json.data, function (o) {
                return o.CurrentWeight;
            });
            this.totalCurrentWeight = totalWeight ? totalWeight.toString() : '0';
            this.mounted = true;
        }
    }

    componentDidMount() {
        if (this.mounted) {
            let _this = this;
            getEnclosureType(_this.props.topPIC).then(function (response) {
                if (response.success) {
                    _this.stateSet({ enclosureTypes: response.data, enclosureTypeReady: true, enclosureNameReady: true, typeKey: Math.random(), nameKey: Math.random() });
                }
            }).catch(function (err) {
                _this.stateSet({ enclosureTypes: [], enclosureTypeReady: true, enclosureNameReady: true, typeKey: Math.random(), nameKey: Math.random() });
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    componentWillUnmount() {
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
    }

    onReset() {
        this.stateSet({ key: Math.random() });
    }

    save() {
        if (this.livestocks == null || this.livestocks.length == 0) {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.NO_LIVESTOCK_AVAILABLE });
            return;
        }
        let formValues = getForm(this.movementSchema, this.refs);
        if (_isUndefined(formValues.enclosureName) || _isEmpty(formValues.enclosureName)) {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.CONTROLS.ENCLOSURE_NAME_REQ_MESSAGE });
            return;
        }

        let eventGps = this.refs.GpsCoordinate.GPSValue;
        let _this = this;
        return moveToEnclosure(this.livestocks, this.props.topPIC.PropertyId, formValues.enclosureName, formValues.dateOfMovement, eventGps).then(function (response) {
            if (response.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
                setTimeout(() => {
                    browserHistory.replace('/livestock');
                }, 1500);
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: response.error });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        })
    }

    enclosureNameOnChange(value, text) {

        let dataSource = this.state.enclosureNames;

        let current = dataSource.filter(function (f) {
            return f.Id == value;
        }).map(function (f) {
            return f.DefaultGPS;
        });

        if (current.length > 0) {
            this.refs.GpsCoordinate.setGPSValue(current[0]);
        }
        else {
            this.refs.GpsCoordinate.setGPSValue(null);
        }
    }

    enclosureTypeOnChange(value, text) {
        let _this = this;

        _this.stateSet({ enclosureNameReady: false, nameKey: Math.random() });
        getEnclosureByType(_this.props.topPIC.PropertyId, value).then(function (response) {
            _this.stateSet({ enclosureNames: response.data, enclosureNameReady: true, nameKey: Math.random() });
        }).catch(function (err) {
            _this.stateSet({ enclosureNames: [], enclosureNameReady: true, nameKey: Math.random() });
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
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
                                        name: 'btnReset',
                                        label: this.strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={() => browserHistory.replace('/livestock')} ></Button>
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
                                        className: 'button2Style button30Style'
                                    }}
                                    loaderHeight={25}
                                    redirectUrl='/livestock'
                                    onClick={this.save} ></BusyButton>
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
                                    <div className="col-md-6">
                                        <div className="row">
                                            <Input inputProps={{
                                                name: 'numberOfLivestock',
                                                hintText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK,
                                                floatingLabelText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK,
                                                disabled: true
                                            }}
                                                initialValue={this.numberOfLivestock}
                                                ref="numberOfLivestock" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <Input inputProps={{
                                                name: 'numberOfMob',
                                                hintText: this.strings.CONTROLS.NUMBER_OF_MOB,
                                                floatingLabelText: this.strings.CONTROLS.NUMBER_OF_MOB,
                                                disabled: true
                                            }}
                                                initialValue={this.numberOfMob}
                                                ref="numberOfMob" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <Input inputProps={{
                                        name: 'totalCurrentWeight',
                                        hintText: this.strings.CONTROLS.WEIGHT,
                                        floatingLabelText: this.strings.CONTROLS.WEIGHT,
                                        disabled: true
                                    }}
                                        initialValue={this.totalCurrentWeight}
                                        ref="totalCurrentWeight" />
                                </div>
                                <div className="row">
                                    <DatetimePicker inputProps={{
                                        name: 'dateOfMovement',
                                        placeholder: this.strings.CONTROLS.MOVEMENT_DATE
                                    }}
                                        eReq={this.strings.CONTROLS.MOVEMENT_DATE_REQ_MESSAGE}
                                        defaultValue={new Date()}
                                        timeFormat={false}
                                        isClicked={this.state.isClicked} ref="dateOfMovement" />
                                </div>
                                <div className="row">
                                    <Dropdown key={this.state.typeKey} inputProps={{
                                        name: 'enclosureType',
                                        hintText: this.state.enclosureTypeReady ? this.strings.CONTROLS.ENCLOSURE_TYPE_PLACEHOLDER : 'Loading...',
                                        floatingLabelText: this.strings.CONTROLS.ENCLOSURE_TYPE_LABEL,
                                        value: null
                                    }}
                                        eReq={this.strings.CONTROLS.ENCLOSURE_TYPE_REQ_MESSAGE}
                                        onSelectionChange={this.enclosureTypeOnChange}
                                        textField="NameCode" valueField="Id" dataSource={this.state.enclosureTypes}
                                        isClicked={this.state.isClicked} ref="enclosureType" />
                                </div>
                                <div className="row">
                                    <Dropdown key={this.state.nameKey} inputProps={{
                                        name: 'enclosureName',
                                        hintText: this.state.enclosureNameReady ? this.strings.CONTROLS.ENCLOSURE_NAME_PLACEHOLDER : 'Loading...',
                                        floatingLabelText: this.strings.CONTROLS.ENCLOSURE_NAME_LABEL,
                                        value: null
                                    }}
                                        onSelectionChange={this.enclosureNameOnChange}
                                        eReq={this.strings.CONTROLS.ENCLOSURE_NAME_REQ_MESSAGE}
                                        textField="Name" valueField="Id" dataSource={this.state.enclosureNames}
                                        isClicked={this.state.isClicked} ref="enclosureName" />
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
                            <div className="col-md-6"></div>
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

export default MoveToEnclosure;