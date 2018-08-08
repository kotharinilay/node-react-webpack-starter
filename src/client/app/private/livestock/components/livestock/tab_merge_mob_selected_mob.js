'use strict';

/**************************
 * tab component of merge mob - Selected Mob
 * **************************** */

import React, { Component } from 'react';
import { groupBy as _groupBy, forEach as _forEach } from 'lodash';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Button from '../../../../../lib/core-components/Button';
import { NOTIFY_WARNING } from '../../../../common/actiontypes';
import { digitDecimal } from '../../../../../../shared/format/number';

class TabSelectedMob extends Component {

    constructor(props) {
        super(props);
        this.strings = this.props.strings;

        let data = [...this.props.data];
        let newData = [];

        _forEach(data, function (value) {
            let obj = newData.find(x => x.MobName == value.MobName);
            if (obj) {
                obj.NumberOfHead += value.NumberOfHead;
                obj.CurrentWeight += value.CurrentWeight;
                obj.Ids.push(value.Id);
            }
            else {
                newData.push({
                    Id: Math.random(),
                    MobName: value.MobName, NumberOfHead: value.NumberOfHead,
                    CurrentWeight: value.CurrentWeight, Ids: [value.Id]
                });
            }
        });

        this.state = {
            data: newData
        }

        this.renderMob = this.renderMob.bind(this);
        this.unselectMob = this.unselectMob.bind(this);
    }

    // handle unselect mob button click
    unselectMob(id) {

        if (this.state.data.length <= 2) {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.REQ_AT_LEAST_TWO });
            return false;
        }

        let mobData = [...this.state.data];
        let obj = mobData.find(x => x.Id == id)
        let ids = [];
        if (obj) {
            ids = obj.Ids;
            mobData.splice(mobData.findIndex(x => x.Id == id), 1);
        }

        this.props.updateDataSource(ids);
        this.setState({ data: mobData });

        // if (this.state.data.length <= 2) {
        //     this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.REQ_AT_LEAST_TWO });
        //     return false;
        // }

        // let mobData = [...this.state.data];

        // let objIndex = mobData.findIndex(x => x.Id == id)
        // if (objIndex != -1)
        //     mobData.splice(objIndex, 1);

        // this.props.updateDataSource(mobData);
        // this.setState({ data: mobData });
    }

    // render repeated mob area
    renderMob(data, index) {
        return (<div className="row">
            <div className="col-md-3">
                <Input inputProps={{
                    name: 'mob' + index,
                    hintText: this.strings.MOB_PLACEHOLDER,
                    floatingLabelText: this.strings.MOB_LABEL,
                    disabled: true
                }}
                    updateOnChange={true}
                    initialValue={data.MobName}
                    ref={"mob" + index} />
            </div>
            <div className="col-md-3">
                <NumberInput inputProps={{
                    name: 'quantity' + index,
                    hintText: this.strings.QUANTITY_PLACEHOLDER,
                    floatingLabelText: this.strings.QUANTITY_LABEL + (this.props.species ? ' (' + this.props.species + ')' : ''),
                    disabled: true
                }}
                    updateOnChange={true}
                    initialValue={data.NumberOfHead.toString()}
                    ref={"quantity" + index} />
            </div>
            <div className="col-md-3">
                <NumberInput inputProps={{
                    name: 'weight' + index,
                    hintText: this.strings.WEIGHT_PLACEHOLDER,
                    floatingLabelText: this.strings.WEIGHT_LABEL,
                    disabled: true
                }}
                    updateOnChange={true}
                    initialValue={digitDecimal(data.CurrentWeight).toString()}
                    numberType="decimal" ref={"weight" + index} />
            </div>
            <div className="col-md-3">
                {this.state.data.length > 2 ? <Button
                    inputProps={{
                        name: 'btnUnselect' + index,
                        label: this.strings.UNSELECT_LABEL,
                        className: 'button2Style button30Style mt15',
                    }}
                    onClick={this.unselectMob.bind(this, data.Id)}
                ></Button> : null}
            </div>
        </div>);
    }

    // render component
    render() {
        return (<div className="col-md-12">
            {this.state.data.map((d, i) => {
                return (<div key={i}>
                    {this.renderMob(d, i)}
                </div>);
            })}
        </div>);
    }
}
export default TabSelectedMob;