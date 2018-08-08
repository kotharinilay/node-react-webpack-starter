'use strict';

/************************************************
 * Split Mob
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map, sortBy, sum } from 'lodash';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import GPS_Coordinate from '../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';

import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { getSplitMobDetail, getEnclosureByType, splitMob } from '../../../../services/private/livestock';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';
import { livestockEventDateFilter } from '../../../../../shared/index';
import { isUUID } from '../../../../../shared/format/string';
import { digitDecimal } from '../../../../../shared/format/number';

class SplitMob extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            key: Math.random(),
            isClicked: false,
            dataFetch: false,
            splitMobData: [
                { Index: Math.random().toString().split('.')[1], enclosureName: [] },
                { Index: Math.random().toString().split('.')[1], enclosureName: [] }
            ]
        };

        this.mob = null;
        this.enclosureType = [];
        this.params = this.props.params;

        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderMob = this.renderMob.bind(this);
        this.renderSplitMob = this.renderSplitMob.bind(this);

        this.splitMob = this.splitMob.bind(this);
        this.resetSplitMob = this.resetSplitMob.bind(this);
        this.addMobToSplit = this.addMobToSplit.bind(this);
        this.backToLivestock = this.backToLivestock.bind(this);
        //this.getMinDate = this.getMinDate.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        if (!this.params.subdetail)
            this.backToLivestock();
        else if (!isUUID(this.params.subdetail))
            this.backToLivestock();
        else {
            let _this = this;
            getSplitMobDetail(this.params.subdetail, this.props.topPIC).then(function (res) {
                if (res.success) {
                    if (!res.data.livestock.Id)
                        _this.backToLivestock();
                    else if (res.data.livestock.NumberOfHead < 2)
                        _this.backToLivestock();

                    _this.mob = res.data.livestock;

                    _this.mob.CurrentWeight = _this.mob.CurrentWeight || 0;
                    _this.mob.NumberOfHead = _this.mob.NumberOfHead || 1;

                    _this.enclosureType = res.data.enclosureType;
                    _this.stateSet({ dataFetch: true });
                }
                else if (res.badRequest) {
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
                    _this.stateSet({ dataFetch: true });
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
                _this.stateSet({ dataFetch: true });
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.backToLivestock();
    }

    // Handle cancel button events
    backToLivestock() {
        browserHistory.replace('/livestock');
    }

    // reset page
    resetSplitMob() {
        this.setState({ key: Math.random() });
    }

    // handle change event of enclosure type
    onEnclosureTypeChange(index, value, text) {
        if (value) {
            let _this = this;
            getEnclosureByType(_this.props.topPIC.PropertyId, value).then(function (res) {
                if (res.success) {
                    let splitMobData = [..._this.state.splitMobData];
                    let obj = splitMobData.find(i => i.Index == index);
                    if (obj)
                        obj.enclosureName = res.data;
                    _this.stateSet({ splitMobData: splitMobData });
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // split mob/handle save button click event
    splitMob() {
        let splitMobSchema = [];
        this.state.splitMobData.map(d => {
            splitMobSchema.push('mob' + d.Index);
            splitMobSchema.push('qty' + d.Index);
            splitMobSchema.push('weight' + d.Index);
            splitMobSchema.push('enclosurename' + d.Index);
        });

        let isFormValid = isValidForm(splitMobSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let totalQuantity = 0;
        let result = [];
        this.state.splitMobData.map(d => {
            let schema = [];
            schema.push('mob' + d.Index);
            schema.push('qty' + d.Index);
            schema.push('weight' + d.Index);
            schema.push('enclosurename' + d.Index);
            let data = getForm(schema, this.refs);

            totalQuantity += parseInt(data['qty' + d.Index]);

            result.push({
                Mob: data['mob' + d.Index],
                Quantity: data['qty' + d.Index],
                Weight: data['weight' + d.Index],
                Enclosure: data['enclosurename' + d.Index]
            });
        });

        if (totalQuantity != this.mob.NumberOfHead) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.LIVESTOCK_QTY_NOT_MATCH });
            return false;
        }

        let finalObj = {
            data: result,
            defaultGPS: this.refs.gpsCords.GPSValue,
            dateOfSplit: this.refs.dateofsplit.fieldStatus.value,
            id: this.params.subdetail,
            PIC: this.props.topPIC.PIC,
            selectedMob: this.mob
        }

        let _this = this;
        return splitMob(finalObj).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS });
                return true;
            }
            else if (res.badRequest) {
                _this.notifyToaster(NOTIFY_ERROR, { message: res.error });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // add mob to split
    addMobToSplit() {
        let splitMobData = [...this.state.splitMobData];
        if (splitMobData.length < this.mob.NumberOfHead) {
            splitMobData.push({ Index: Math.random().toString().split('.')[1], enclosureName: [] });
            this.setState({ splitMobData: splitMobData });
        }
        else
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.EXCEEDED_SPLIT_MOB });
    }

    // remove new split mob
    removeSplit(index) {
        let splitMobData = [...this.state.splitMobData];

        let objIndex = splitMobData.findIndex(x => x.Index == index)
        if (objIndex != -1)
            splitMobData.splice(objIndex, 1);

        this.setState({ splitMobData: splitMobData });
    }

    // validate quantity
    validateQuantity(index, input) {
        let refList = [];
        let totalQuantity = 0;
        this.state.splitMobData.map(d => {
            refList.push({ qty: this.refs['qty' + d.Index], weight: this.refs['weight' + d.Index] });
            let qty = this.refs['qty' + d.Index].fieldStatus.value;
            totalQuantity += qty ? parseInt(qty) : 0;
        });

        if (input == 0)
            return this.strings.CONTROLS.INVALID_QUANTITY;
        else if (totalQuantity > this.mob.NumberOfHead)
            return this.strings.CONTROLS.EXCEEDED_QUANTITY;
        else {
            refList.map(ref => {
                let qty = ref.qty.fieldStatus.value;
                if (qty && qty != 0) {
                    ref.qty.updateInputStatus();
                    if (!ref.weight.fieldStatus.dirty && !ref.weight.fieldStatus.visited) {
                        let weight = digitDecimal((this.mob.CurrentWeight / this.mob.NumberOfHead) * qty);
                        ref.weight.fieldStatus.value = weight;
                        ref.weight.setState({ value: weight });
                    }
                }
            });
            return null;
        }
    }

    // render header part
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
                                        name: 'btnAddMobToSplit',
                                        label: this.strings.CONTROLS.ADD_MOB_TO_SPLIT_LABEL,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.addMobToSplit}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnCancel',
                                        label: this.strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.backToLivestock}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnReset',
                                        label: this.strings.CONTROLS.RESET_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.resetSplitMob}
                                ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnSave',
                                        label: this.strings.CONTROLS.SAVE_LABEL,
                                        className: 'button2Style button30Style',
                                    }}
                                    loaderHeight={25}
                                    redirectUrl="/livestock"
                                    onClick={this.splitMob}
                                ></BusyButton>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >);
    }

    // render mob area
    renderMob() {
        let { strings } = this.props;
        return (<div>
            <div className="row">
                <div className="col-md-4">
                    <Input inputProps={{
                        name: 'mob',
                        hintText: strings.CONTROLS.MOB_PLACEHOLDER,
                        floatingLabelText: strings.CONTROLS.MOB_LABEL,
                        disabled: true
                    }}
                        maxLength={50} initialValue={this.mob ? this.mob.Mob : ''}
                        isClicked={this.state.isClicked} ref="mob" />
                </div>
                <div className="col-md-4">
                    <NumberInput inputProps={{
                        name: 'livestockquantity',
                        hintText: strings.CONTROLS.LIVESTOCKQUANTITY_PLACEHOLDER,
                        floatingLabelText: strings.CONTROLS.LIVESTOCKQUANTITY_LABEL + (this.mob ? ' (' + this.mob.SpeciesName + ')' : ''),
                        disabled: true
                    }}
                        maxLength={10}
                        initialValue={this.mob ? this.mob.NumberOfHead.toString() : ''}
                        isClicked={this.state.isClicked} ref="livestockquantity" />
                </div>
                <div className="col-md-4">
                    <NumberInput inputProps={{
                        name: 'livestockweight',
                        hintText: strings.CONTROLS.LIVESTOCK_WEIGHT_PLACEHOLDER,
                        floatingLabelText: strings.CONTROLS.LIVESTOCK_WEIGHT_LABEL,
                        disabled: true
                    }}
                        initialValue={this.mob ? this.mob.CurrentWeight.toString() : ''}
                        maxLength={5} numberType="decimal"
                        isClicked={this.state.isClicked} ref="livestockweight" />
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <DateTimePicker inputProps={{
                        name: 'dateofsplit',
                        placeholder: strings.CONTROLS.SPLIT_DATE_PLACEHOLDER,
                        label: strings.CONTROLS.SPLIT_DATE_LABEL
                    }}
                        dateFilter={livestockEventDateFilter(this.mob.InductionDate, this.mob.BirthDate)}
                        defaultValue={new Date()}
                        isClicked={this.state.isClicked} ref="dateofsplit" />
                </div>
                <div className="col-md-4">
                    <GPS_Coordinate strings={{
                        hintText: strings.CONTROLS.INDUCTIONGPS_PLACEHOLDER,
                        floatingLabelText: strings.CONTROLS.INDUCTIONGPS_LABEL,
                        COMMON: strings.COMMON
                    }}
                        propertyId={this.props.topPIC.PropertyId} ref='gpsCords'
                        initialCords={this.mob ? this.mob.DefaultGPS : null} />
                </div>
            </div>
        </div>);
    }

    // render split mob area
    renderSplitMob() {
        let { strings } = this.props;
        return (this.state.splitMobData.map((data, i) => {
            return (<div key={data.Index}>
                <div style={{ borderBottom: '1px solid #769277', margin: '40px 0 15px 0', lineHeight: '35px' }}>
                    {strings.RESULT_MOB_LABEL} ({i + 1})
                    {i > 1 ? < Button
                        inputProps={{
                            name: 'btnRemoveSplit' + data.Index,
                            label: strings.CONTROLS.REMOVE_SPLIT_LABEL,
                            className: 'button2Style button30Style pull-right',
                        }}
                        onClick={this.removeSplit.bind(this, data.Index)}
                    ></Button> : null}
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <Input inputProps={{
                            name: 'mob' + data.Index,
                            hintText: strings.CONTROLS.NEW_MOB_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.NEW_MOB_LABEL
                        }}
                            eReq={strings.CONTROLS.MOB_REQ_MESSAGE}
                            maxLength={50}
                            isClicked={this.state.isClicked} ref={"mob" + data.Index} />
                    </div>
                    <div className="col-md-4">
                        <NumberInput inputProps={{
                            name: 'qty' + data.Index,
                            hintText: strings.CONTROLS.LIVESTOCKQUANTITY_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCKQUANTITY_LABEL + (this.mob ? ' (' + this.mob.SpeciesName + ')' : '')
                        }}
                            eReq={strings.CONTROLS.REQ_QUANTITY}
                            maxLength={10} eClientValidation={this.validateQuantity.bind(this, data.Index)}
                            isClicked={this.state.isClicked} ref={"qty" + data.Index} />
                    </div>
                    <div className="col-md-4">
                        <NumberInput inputProps={{
                            name: 'weight' + data.Index,
                            hintText: strings.CONTROLS.LIVESTOCK_WEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_WEIGHT_LABEL
                        }}
                            maxLength={5} numberType="decimal"
                            isClicked={this.state.isClicked} ref={"weight" + data.Index} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <Dropdown inputProps={{
                            name: 'enclosuretype' + data.Index,
                            hintText: strings.CONTROLS.ENCLOSURE_TYPE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.ENCLOSURE_TYPE_LABEL,
                            value: null
                        }}
                            onSelectionChange={this.onEnclosureTypeChange.bind(this, data.Index)}
                            textField="NameCode" valueField="Id" dataSource={this.enclosureType}
                            isClicked={this.state.isClicked} ref={"enclosuretype" + data.Index} />
                    </div>
                    <div className="col-md-4">
                        <Dropdown inputProps={{
                            name: 'enclosurename' + data.Index,
                            hintText: strings.CONTROLS.ENCLOSURE_NAME_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.ENCLOSURE_NAME_LABEL,
                            value: null
                        }}
                            textField="Name" valueField="Id" dataSource={data.enclosureName}
                            isClicked={this.state.isClicked} ref={"enclosurename" + data.Index} />
                    </div>
                </div>
            </div >);
        }));
    }

    // render content area
    renderContent() {
        let { strings } = this.props;
        if (this.state.dataFetch) {
            return (<div className="stock-list">
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="clear" ></div>
                        {this.renderMob()}
                        {this.renderSplitMob()}
                    </div>
                </div>
            </div>);
        }
        else return <LoadingIndicator />;
    }

    // render component
    render() {
        return (
            <div className="row" key={this.state.key}>
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default SplitMob;