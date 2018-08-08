'use strict';

/**************************
 * tab component of merge mob - Result Mob
 * **************************** */

import React, { Component } from 'react';
import { map as _map, max as _max } from 'lodash';

import NumberInput from '../../../../../lib/core-components/NumberInput';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import AutoComplete from '../../../../../lib/core-components/AutoComplete-Static';

import { getEnclosureByType } from '../../../../../services/private/livestock';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { livestockEventDateFilter } from '../../../../../../shared/index';
import { moment } from '../../../../../../shared/format/date';
import { digitDecimal } from '../../../../../../shared/format/number';

class TabResultMob extends Component {

    constructor(props) {
        super(props);
        this.mounted = false;
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.stateSet = this.stateSet.bind(this);

        let ds = [];
        _map(this.props.data, (d, i) => {
            let obj = ds.find(x => x.mob == d.MobName);
            if (!obj)
                ds.push({ id: d.Id, mob: d.MobName });
        });
        this.state = {
            data: this.props.data,
            dataSource: ds
        }

        this.schema = ['mob', 'dateofmerge', 'quantity', 'weight', 'enclosuretype', 'enclosurename'];
        this.totalQuantity = 0;
        this.totalWeight = 0;
        this.inductionDateArr = [];
        this.birthDateArr = [];

        this.updateResultMob = this.updateResultMob.bind(this);
        this.onEnclosureTypeChange = this.onEnclosureTypeChange.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.length != this.props.data.length) {
            let ds = [];
            _map(nextProps.data, (d, i) => {
                ds.push({ id: d.Id, mob: d.MobName });
            });
            this.setState({ data: nextProps.data, dataSource: ds });
        }
    }

    updateResultMob() {
        this.totalQuantity = 0;
        this.totalWeight = 0;
        this.inductionDateArr = [];
        this.birthDateArr = [];

        _map(this.state.data, (d) => {
            if (d.InductionDate) this.inductionDateArr.push(moment(d.InductionDate));
            if (d.BirthDate) this.birthDateArr.push(moment(d.BirthDate));
            this.totalQuantity += parseInt(d.NumberOfHead || 0);
            this.totalWeight += parseInt(d.CurrentWeight || 0);
        });
    }

    // handle change event of enclosure type
    onEnclosureTypeChange(value, text) {
        if (value) {
            let _this = this;
            getEnclosureByType(this.props.propertyId, value).then(function (res) {
                if (res.success) {
                    _this.stateSet({ enclosureName: res.data });
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    getValues() {
        let isFormValid = isValidForm(this.schema, this.refs);
        if (!isFormValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let obj = getForm(this.schema, this.refs);
        return obj;
    }

    render() {
        this.updateResultMob();
        let data = [...this.state.data];
        return (<div className="col-md-12">
            <div className="row">
                <div className="col-md-6">
                    <AutoComplete inputProps={{
                        name: 'mob',
                        hintText: this.strings.MOB_PLACEHOLDER,
                        floatingLabelText: this.strings.MOB_LABEL,
                        className: "inputStyle inputStyle2"
                    }}
                        updateOnChange={true}
                        eInvalid={null}
                        eReq={this.strings.MOB_REQ_MESSAGE}
                        dataSource={this.state.dataSource}
                        textField="mob" valueField="id"
                        isClicked={this.props.isClicked} ref="mob" />
                </div>
                <div className="col-md-6">
                    <DateTimePicker inputProps={{
                        name: 'dateofmerge',
                        placeholder: this.strings.MERGE_DATE_PLACEHOLDER,
                        label: this.strings.MERGE_DATE_LABEL
                    }}
                        dateFilter={livestockEventDateFilter(_max(this.inductionDateArr), _max(this.birthDateArr), true)}
                        defaultValue={new Date()}
                        isClicked={this.props.isClicked} ref="dateofmerge" />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <NumberInput inputProps={{
                        name: 'quantity',
                        hintText: this.strings.QUANTITY_PLACEHOLDER,
                        floatingLabelText: this.strings.QUANTITY_LABEL + (this.props.species ? ' (' + this.props.species + ')' : ''),
                        disabled: true
                    }}
                        updateOnChange={true}
                        initialValue={this.totalQuantity.toString()}
                        ref="quantity" />
                </div>
                <div className="col-md-6">
                    <NumberInput inputProps={{
                        name: 'weight',
                        hintText: this.strings.WEIGHT_PLACEHOLDER,
                        floatingLabelText: this.strings.WEIGHT_LABEL,
                        disabled: true
                    }}
                        updateOnChange={true}
                        initialValue={digitDecimal(this.totalWeight).toString()}
                        numberType="decimal" ref="weight" />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Dropdown inputProps={{
                        name: 'enclosuretype',
                        hintText: this.strings.ENCLOSURE_TYPE_PLACEHOLDER,
                        floatingLabelText: this.strings.ENCLOSURE_TYPE_LABEL,
                        value: null
                    }}
                        onSelectionChange={this.onEnclosureTypeChange}
                        textField="NameCode" valueField="Id" dataSource={this.props.enclosureType}
                        isClicked={this.props.isClicked} ref="enclosuretype" />
                </div>
                <div className="col-md-6">
                    <Dropdown inputProps={{
                        name: 'enclosurename',
                        hintText: this.strings.ENCLOSURE_NAME_PLACEHOLDER,
                        floatingLabelText: this.strings.ENCLOSURE_NAME_LABEL,
                        value: null
                    }}
                        textField="Name" valueField="Id" dataSource={this.state.enclosureName}
                        isClicked={this.props.isClicked} ref="enclosurename" />
                </div>
            </div>
        </div>);
    }
}
export default TabResultMob;