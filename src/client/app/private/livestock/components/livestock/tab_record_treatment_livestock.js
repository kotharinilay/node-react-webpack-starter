'use strict';

/**************************
 * livestock tab component of record treatment
 * **************************** */

import React, { Component } from 'react';
import { uniq as _uniq, map as _map } from 'lodash';

import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';

import { digitDecimal } from '../../../../../../shared/format/number';
import { getSpeciesModifyDetails } from '../../../../../services/private/setup';

class TabLivestock extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.data = {
            livestockCount: '0',
            mobCount: '0',
            mobName: '',
            weight: '0'
        }

        this.state = {
            species: ''
        }

    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let mobArr = [];

        let mobCount = 0;
        let livestockCount = 0;
        let totalWeight = 0;

        _map(this.props.data, d => {
            if (d.IsMob == 1) {
                mobArr.push(d.MobName);
                mobCount += d.NumberOfHead;
            }
            else
                livestockCount += d.NumberOfHead;
            totalWeight += d.CurrentWeight;
        });

        this.data = {
            livestockCount: livestockCount.toString(),
            mobCount: mobCount.toString(),
            mobName: _uniq(mobArr).length == 1 ? mobArr[0] : "",
            weight: digitDecimal(totalWeight).toString()
        }
        let _this = this;
        getSpeciesModifyDetails(this.props.data[0].SpeciesId).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    species: res.data.SpeciesName
                });
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-4">
                        <NumberInput inputProps={{
                            name: 'livestock',
                            hintText: this.strings.LIVESTOCK_COUNT_LABEL,
                            floatingLabelText: this.strings.LIVESTOCK_COUNT_LABEL + (this.state.species ? ' (' + this.state.species + ')' : ''),
                            disabled: true
                        }}
                            initialValue={this.data.livestockCount} />
                    </div>
                    <div className="clearfix"></div>

                    <div className="col-md-4">
                        <NumberInput inputProps={{
                            name: 'mob',
                            hintText: this.strings.MOB_COUNT_LABEL,
                            floatingLabelText: this.strings.MOB_COUNT_LABEL,
                            disabled: true
                        }}
                            initialValue={this.data.mobCount} />
                    </div>
                    {this.data.mobName ?
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'mobName',
                                hintText: this.strings.MOB_LABEL,
                                floatingLabelText: this.strings.MOB_LABEL,
                                disabled: true
                            }}
                                initialValue={this.data.mobName}
                                ref="mob" />
                        </div> : null}
                    <div className="clearfix"></div>

                    <div className="col-md-4">
                        <NumberInput inputProps={{
                            name: 'weight',
                            hintText: this.strings.WEIGHT_LABEL,
                            floatingLabelText: this.strings.WEIGHT_LABEL,
                            disabled: true
                        }}
                            updateOnChange={true}
                            initialValue={this.data.weight}
                            numberType="decimal" />
                    </div>
                    <div className="clearfix"></div>
                </div>
            </div>);
    }
}

export default TabLivestock;