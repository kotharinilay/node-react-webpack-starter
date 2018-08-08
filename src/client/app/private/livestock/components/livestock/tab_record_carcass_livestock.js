'use strict';

import React, { Component } from 'react';
import { sumBy as _sumBy, countBy as _countBy } from 'lodash';
import Input from '../../../../../lib/core-components/Input';

import { getLivestockByCondition } from '../../../../../services/private/livestock';

class TabRecordCarcassLivestock extends Component {

    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        if (this.props.livestocks != null && this.props.livestocks.length > 0) {
            let livestock = this.props.livestocks;
            this.state = {
                NumberOfLivestock: livestock.NumberOfHead ? livestock.NumberOfHead.toString() : '1',
                CurrentWeight: livestock.CurrentWeight ? livestock.CurrentWeight.toString() : '0',
                EID: livestock.EID || '',
                VisualTag: livestock.VisualTag || '',
                NLISID: livestock.NLISID || '',
                SocietyId: livestock.SocietyId || '',
                MobName: livestock.MobName || ''
            };
        }
        else {
            this.state = {
                NumberOfLivestock: '0', EID: '', CurrentWeight: '0', VisualTag: '', NLISID: '',
                SocietyId: '', MobName: ''
            };
        }
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
    }

    componentWillMount() {
        
        this.mounted = true;
        let _this = this;
        let condition = `l.UUID = '${this.props.livestocks[0].Id}'`;
        let columns = `l.EID, l.VisualTag, l.NLISID, l.SocietyId, l.NumberOfHead, l.CurrentWeight`;
        return getLivestockByCondition(columns, '', condition).then(function (res) {
            if (res.success) {

                let data = res.response[0];
                _this.stateSet({
                    EID: data.EID || '',
                    VisualTag: data.VisualTag || '',
                    SocietyId: data.SocietyId || '',
                    NLISID: data.NLISID || ''
                })
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
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'eid',
                            hintText: this.strings.CONTROLS.EID_HINT,
                            floatingLabelText: this.strings.CONTROLS.EID_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.EID} updateOnChange={true}
                            ref="eid" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'mob',
                            hintText: this.strings.CONTROLS.MOB_HINT,
                            floatingLabelText: this.strings.CONTROLS.MOB_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.MobName} updateOnChange={true}
                            ref="mob" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'visualtag',
                            hintText: this.strings.CONTROLS.VISUALTAG_HINT,
                            floatingLabelText: this.strings.CONTROLS.VISUALTAG_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.VisualTag} updateOnChange={true}
                            ref="visualtag" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'numberOfLivestock',
                            hintText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_HINT,
                            floatingLabelText: this.strings.CONTROLS.NUMBER_OF_LIVESTOCK_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.NumberOfLivestock} updateOnChange={true}
                            ref="numberOfLivestock" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'nlisid',
                            hintText: this.strings.CONTROLS.NLISID_HINT,
                            floatingLabelText: this.strings.CONTROLS.NLISID_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.NLISID} updateOnChange={true}
                            ref="nlisid" />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'currentWeight',
                            hintText: this.strings.CONTROLS.CURRENT_WEIGHT_HINT,
                            floatingLabelText: this.strings.CONTROLS.CURRENT_WEIGHT_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.CurrentWeight} updateOnChange={true}
                            ref="currentWeight" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'societyid',
                            hintText: this.strings.CONTROLS.SOCIETYID_HINT,
                            floatingLabelText: this.strings.CONTROLS.SOCIETYID_FLOATING,
                            disabled: true
                        }}
                            initialValue={this.state.SocietyId} updateOnChange={true}
                            ref="societyid" />
                    </div>
                </div>
            </div>
        );
    }
}
export default TabRecordCarcassLivestock;