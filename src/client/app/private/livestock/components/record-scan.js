'use strict';

/****************************************
 * Move livestock & Mob to particular
 * Enclosure
 * **************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map as _map } from 'lodash';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import ResultTab from './livestock/tab_record_scan_result';
import LivestockTab from './livestock/tab_record_scan_livestock';

import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../common/actiontypes';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { recordScanResult } from '../../../../services/private/livestock';
import { LocalStorageKeys } from '../../../../../shared/constants';

class RecordScan extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            key: Math.random(),
            tabKey: 'resultTab',
            isClicked: false
        }

        this.livestocks = [];
        this.speciesId = null;
        this.strings = this.props.strings;
        this.onCancel = this.onCancel.bind(this);
        this.onReset = this.onReset.bind(this);
        this.save = this.save.bind(this);
        this.tabChanged = this.tabChanged.bind(this);

        if (localStorage.getItem(LocalStorageKeys.LivestockData)) {
            this.livestocks = JSON.parse(localStorage.getItem(LocalStorageKeys.LivestockData)).data;
            if (this.livestocks.length > 0)
                this.speciesId = this.livestocks[0].SpeciesId;
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    // handle tab change event
    tabChanged(key) {
        this.stateSet({ tabKey: key });
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
        let formValues = getForm(this.refs.resultTab.recordScanSchema, this.refs.resultTab.refs);
        let isValid = isValidForm(this.refs.resultTab.recordScanSchema, this.refs.resultTab.refs);

        if (this.refs.resultTab.scanOnPIC == null || this.refs.resultTab.scanOnPIC == '') {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SCAN_PIC_REQUIRE_MSG });
            return;
        }

        if (!isValid) {
            if (!this.refs.resultTab.state.isClicked)
                this.refs.resultTab.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return;
        }

        formValues['ScanOnPIC'] = this.refs.resultTab.scanOnPIC;
        formValues['ScanOnPropertyId'] = this.refs.resultTab.scanOnPropertyId;
        formValues['ServiceProvider'] = this.refs.resultTab.serviceProvider;

        let _this = this;
        return recordScanResult(_this.props.topPIC, this.refs.resultTab.refs.GpsCoordinate.GPSValue, {
            ScanResult: formValues,
            Livestocks: _this.livestocks
        }).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
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
        let commonProps = {
            topPIC: this.props.topPIC,
            notifyToaster: this.props.notifyToaster,
            stateSet: this.stateSet,
            openFindPIC: this.props.openFindPIC,
            openFindCompany: this.props.openFindCompany
        }
        return (
            <div className="stock-list" key={this.state.key}>
                <div className="stock-list-cover">
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <InkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={this.strings.RESULT_TAB_TITLE} key="resultTab">
                            <ResultTab strings={{
                                ...this.strings.TABS['RESULT-TAB'],
                                COMMON: this.strings.COMMON
                            }}
                                findPIC={this.props.findPIC}
                                findCompany={this.props.findCompany}
                                SpeciesId={this.speciesId}
                                {...commonProps} ref='resultTab' />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={this.strings.LIVESTOCK_TAB_TITLE} key="livestockTab">
                            <LivestockTab strings={{ ...this.strings.TABS['LIVESTOCK-TAB'], COMMON: this.strings.COMMON }}
                                {...commonProps} livestocks={this.livestocks} ref="livestockTab" />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                    </Tabs>
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

export default RecordScan;