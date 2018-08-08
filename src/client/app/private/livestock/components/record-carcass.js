'use strict';

/****************************************
 * Page for record casrcass action
 * **************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import CarcassTab from './livestock/tab_record_carcass';
import LivestockTab from './livestock/tab_record_carcass_livestock';
import { recordCarcass } from '../../../../services/private/livestock';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';
import { LocalStorageKeys } from '../../../../../shared/constants';

class RecordCarcassDetail extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            key: Math.random(),
            tabKey: 'carcassTab',
            isClicked: false
        }

        this.livestock = {};
        this.strings = this.props.strings;
        this.onCancel = this.onCancel.bind(this);
        this.save = this.save.bind(this);
        this.submitNLIS = this.submitNLIS.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.onReset = this.onReset.bind(this);

        if (localStorage.getItem(LocalStorageKeys.LivestockData)) {
            this.livestock = JSON.parse(localStorage.getItem(LocalStorageKeys.LivestockData)).data[0];
        }
        else {
            browserHistory.replace('/livestock');
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

    submitNLIS() {
        this.save(true);
    }

    onReset() {
        this.stateSet({ key: Math.random() });
    }

    save(isNLISSubmit) {
        let carcassObj = this.refs.carcassTab.getFormValues();
        carcassObj.topPIC = this.props.topPIC;
        carcassObj.isNLISSubmit = isNLISSubmit || false;
        carcassObj.livestock = this.livestock;

        let _this = this;
        return recordCarcass(carcassObj).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
                _this.onCancel();
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                return false;
            }
        }).cache(function () {
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
                                        className: 'button2Style button30Style ripple-effect search-btn'
                                    }}
                                    loaderHeight={25}
                                    redirectUrl='/livestock'
                                    onClick={() => this.save(false)} ></BusyButton>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown">
                                    <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li>
                                                <a href="javascript:void(0)" onClick={this.submitNLIS}>
                                                    {this.strings.CONTROLS.SAVE_NLIS_LABEL}
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
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
            openFindCompany: this.props.openFindCompany,
            isClicked: this.state.isClicked
        }
        return (
            <div className="stock-list" key={this.state.key}>
                <div className="stock-list-cover">
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <InkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={this.strings.CONTROLS.CARCASS_TAB_TITLE} key="carcassTab">
                            <CarcassTab strings={{
                                ...this.strings.TABS['CARCASS-TAB'],
                                COMMON: this.strings.COMMON
                            }}
                                findPIC={this.props.findPIC} livestock={this.livestock}
                                findCompany={this.props.findCompany}
                                {...commonProps} ref='carcassTab' />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={this.strings.CONTROLS.LIVESTOCK_TAB_TITLE} key="livestockTab">
                            <LivestockTab strings={{ ...this.strings.TABS['LIVESTOCK-TAB'], COMMON: this.strings.COMMON }}
                                {...commonProps} livestocks={[this.livestock]} ref="livestockTab" />
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

export default RecordCarcassDetail;