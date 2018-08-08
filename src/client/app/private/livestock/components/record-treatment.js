'use strict';

/************************************************
 * Record Treatment on selected mob/livestock
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map as _map } from 'lodash';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
//import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

//import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import TabTreatment from './livestock/tab_record_treatment';
import TabSession from './livestock/tab_record_treatment_session';
import TabLivestock from './livestock/tab_record_treatment_livestock';
import { saveTreatmentSession, saveApplyTreatmentSession } from '../../../../services/private/livestock';
import { LocalStorageKeys } from '../../../../../shared/constants';

class RecordTreatment extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.backToLivestock = this.backToLivestock.bind(this);

        if (localStorage.getItem(LocalStorageKeys.LivestockData) != null) {
            let data = JSON.parse(localStorage.getItem(LocalStorageKeys.LivestockData));
            if (data.propertyId != this.props.topPIC.PropertyId || data.data.length == 0)
                this.backToLivestock();
            this.selectedData = data.data;
        }
        else
            this.backToLivestock();

        this.state = {
            isClicked: false,
            tabKey: 'tabTreatment',
            sessionList: true,
            sessionIds: []
        }

        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderTab = this.renderTab.bind(this);

        this.tabChanged = this.tabChanged.bind(this);

        this.saveSession = this.saveSession.bind(this);
        this.newSession = this.newSession.bind(this);
        this.applyTreatment = this.applyTreatment.bind(this);
        this.saveApplyTreatment = this.saveApplyTreatment.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        // let _this = this;
        // getMergeMobDetail(this.livestockIds, this.props.topPIC).then(function (res) {
        //     if (res.success) {
        //         _this.livestockData = res.data.livestock;
        //         let enclosureType = res.data.enclosureType;
        //         _this.stateSet({ livestock: _this.livestockData, species: res.data.speciesName || '', enclosureType: enclosureType });
        //     }
        // });
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData);
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
        if (!this.state.sessionList) {
            this.setState({ sessionList: true, sessionIds: [] });
            return true;
        }      
        browserHistory.replace('/livestock');
    }

    // handle apply button click
    saveSession() {     
        let obj = this.refs.tabTreatment.getValues();
        if (!obj.validSession) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let sessionObj = {
            sessionName: obj.session.sessionname,
            disease: obj.session.disease,
            sessionProducts: obj.sessionProducts
        }
        let _this = this;
        saveTreatmentSession(sessionObj).then(function (res) {            
            if (res.success) {
                _this.setState({ sessionList: true });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SESSION_SAVE_SUCCESS });
            }
        });

    }

    saveApplyTreatment() {        
        let obj = this.refs.tabTreatment.getValues();
        if (!obj.validTreatment) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let treatmentObj = {
            sessionProducts: obj.sessionProducts,
            sessionUpdate: obj.productUpdated,
            treatment: obj.treatment,
            livestock: this.selectedData,
            sessionIds: this.state.sessionIds,
            deteledSessionIds: obj.deteledSessionIds
        }

        let _this = this;
        saveApplyTreatmentSession(treatmentObj).then(function (res) {
            
            if (res.success) {
                _this.setState({ sessionList: true });
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_APPLY_SUCCESS });
            }
        });
    }

    // select sessions from grid and apply treatment on livestock
    applyTreatment() {
        let selectedSession = this.refs.tabSession.getSelectedSession();
        if (gridActionNotify(this.strings, this.notifyToaster, selectedSession.length, true, false)) {
            this.setState({ sessionList: false, sessionIds: selectedSession });
        }
    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    // create new session
    newSession() {
        this.setState({ sessionList: false, sessionIds: [] });
    }

    // Render tab of content area
    renderTab() {
        let tabProps = {
            isClicked: this.state.isClicked,
            notifyToaster: this.notifyToaster,
            topPIC: this.props.topPIC
        }

        let tabTreatmentProps = {
            disableAddChemical: this.state.sessionIds.length > 0 ? true : false,
            sessionIds: this.state.sessionIds || [],
            speciesId: this.selectedData[0].SpeciesId,
            selectedIds: _map(this.selectedData, 'Id'),
            openConfirmPopup: this.props.openConfirmPopup,
            hideConfirmPopup: this.props.hideConfirmPopup,
            findCompany: this.props.findCompany,
            openFindCompany: this.props.openFindCompany,
            findContact: this.props.findContact,
            openFindContact: this.props.openFindContact
        }

        return (
            <Tabs
                activeKey={this.state.tabKey}
                onChange={this.tabChanged}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent animated={false} />} >
                <TabPane tab={this.strings.TAB_TREATMENT_LABEL} key="tabTreatment">
                    {this.state.sessionList ?
                        <TabSession {...tabProps}
                            companyId={this.props.authUser.companyId}
                            strings={{ ...this.strings.TAB_SESSION, COMMON: this.strings.COMMON }}
                            ref="tabSession" /> :
                        <TabTreatment {...tabProps} {...tabTreatmentProps}
                            strings={{ ...this.strings.TAB_TREATMENT, COMMON: this.strings.COMMON }}
                            ref="tabTreatment" />}
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_LIVESTOCK_LABEL} key="tabLivestock">
                    <TabLivestock {...tabProps} data={this.selectedData}
                        strings={{ ...this.strings.TAB_LIVESTOCK, COMMON: this.strings.COMMON }}
                        ref="tabLivestock" />
                    <div className="clearfix">
                    </div>
                </TabPane>
            </Tabs >
        );
    }

    // render content area
    renderContent() {
        let { strings } = this.props;
        return (<div className="stock-list">
            <div className="stock-list-cover">
                <div className="livestock-content">
                    {/*<div className="cattle-text">
                        <span>{this.strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear" ></div>*/}
                    {this.renderTab()}
                </div>
            </div>
        </div>);
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
                                        name: 'btnCancel',
                                        label: this.strings.CANCEL_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.backToLivestock}
                                ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnSave',
                                        label: this.strings.SAVE_LABEL,
                                        className: 'button2Style button30Style mr15',
                                    }}
                                    //redirectUrl='/livestock'
                                    loaderHeight={25}
                                    onClick={this.applyTreatment}
                                ></BusyButton>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)" onClick={this.newSession}>{this.strings.NEW_SESSION_LABEL}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.newSession}>{this.strings.MODIFY_SESSION_LABEL}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.saveSession}>{this.strings.SAVE_SESSION_LABEL}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.saveApplyTreatment}>{this.strings.SAVE_AND_APPLY_LABEL}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.applyTreatment}>{this.strings.APPLY_TREATMENT_LABEL}</a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >);
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

export default RecordTreatment;