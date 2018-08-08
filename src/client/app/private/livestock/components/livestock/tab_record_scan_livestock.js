'use strict';

import React, { Component } from 'react';
import { sumBy as _sumBy, countBy as _countBy } from 'lodash';
import Input from '../../../../../lib/core-components/Input';

class TabRecordScanLivestock extends Component {

    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        if (this.props.livestocks != null && this.props.livestocks.length > 0) {
            this.state = {
                NumberOfLivestock: _sumBy(this.props.livestocks, function (f) {
                    if (f.IsMob == 1 || f.IsMob == true) {
                        return f.NumberOfHead;
                    }
                    else {
                        return 1;
                    }
                }).toString(),
                NumberOfMob: this.props.livestocks.filter(function (f) {
                    return f.IsMob == 1 || f.IsMob == true;
                }).length.toString(),
                CurrentWeight: _sumBy(this.props.livestocks, function (f) {
                    return f.CurrentWeight == null ? 0 : f.CurrentWeight
                }).toString()
            };
        }
        else {
            this.state = { NumberOfLivestock: '0', NumberOfMob: '0', CurrentWeight: '0' };
        }
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'numberOfLivestock',
                            hintText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_HINT,
                            floatingLabelText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.NumberOfLivestock}
                            ref="numberOfLivestock" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'numberOfMob',
                            hintText: this.strings.CONTROLS.NUMBER_OF_MOB_HINT,
                            floatingLabelText: this.strings.CONTROLS.NUMBER_OF_MOB_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.NumberOfMob}
                            ref="numberOfMob" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'currentWeight',
                            hintText: this.strings.CONTROLS.CURRENT_WEIGHT_HINT,
                            floatingLabelText: this.strings.CONTROLS.CURRENT_WEIGHT_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.CurrentWeight}
                            ref="currentWeight" />
                    </div>
                </div>
            </div>
        );
    }
}
export default TabRecordScanLivestock;