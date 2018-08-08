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
import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../common/actiontypes';

class ShowWeightHistory extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
    }

    componentWillMount() {
        let data = localStorage.getItem("livestock_data");

        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            browserHistory.replace('/livestock');
        }
        else {
            let json = JSON.parse(data);
            this.mounted = true;
        }
    }

    componentDidMount() {
        if (this.mounted) {
        }
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
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

                            </li>
                            <li>

                            </li>
                        </ul>
                    </div>
                </div>
            </div>);
    }

    renderContent() {
        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'EID',
                                        hintText: this.strings.CONTROLS.EID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="EID" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'NLISID',
                                        hintText: this.strings.CONTROLS.NLISID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="NLISID" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'VisualTag',
                                        hintText: this.strings.CONTROLS.VISUALTAG_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="VisualTag" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'SocietyId',
                                        hintText: this.strings.CONTROLS.SOCIETYID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="SocietyId" />
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'MobName',
                                        hintText: this.strings.CONTROLS.MOB_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="MobName" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'Enclosure',
                                        hintText: this.strings.CONTROLS.ENCLOSURE_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="Enclosure" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'Species',
                                        hintText: this.strings.CONTROLS.SPECIES_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="Species" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'BirthWeight',
                                        hintText: this.strings.CONTROLS.BIRTHWEIGHT_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="BirthWeight" />
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'CurrentWeight',
                                        hintText: this.strings.CONTROLS.CURRENTWEIGHT_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="CurrentWeight" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'Gain',
                                        hintText: this.strings.CONTROLS.GAIN_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="Gain" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'EntryWeight',
                                        hintText: this.strings.CONTROLS.ENTRYWEIGHT_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="EntryWeight" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'EntryGain',
                                        hintText: this.strings.CONTROLS.ENTRYGAIN_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="EntryGain" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'ExitWeight',
                                        hintText: this.strings.CONTROLS.EXITWEIGHT_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="ExitWeight" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'ExitGain',
                                        hintText: this.strings.CONTROLS.EXITGAIN_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="ExitGain" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'EntryDate',
                                        hintText: this.strings.CONTROLS.ENTRYDATE_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="EntryDate" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'ExitDate',
                                        hintText: this.strings.CONTROLS.EXITDATE_HINT,
                                        disabled: true
                                    }}
                                        initialValue={null}
                                        ref="ExitDate" />
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

export default ShowWeightHistory;