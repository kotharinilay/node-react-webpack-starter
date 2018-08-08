'use strict';

/************************************************
 * Merge Mob
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map as _map, filter as _filter, includes as _includes, uniq as _uniq } from 'lodash';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import TabSelectedMob from './livestock/tab_merge_mob_selected_mob';
import TabResultMob from './livestock/tab_merge_mob_result_mob';
import TabResultMobAttr from './livestock/tab_merge_mob_result_mob_attr';
import { LocalStorageKeys } from '../../../../../shared/constants';
import { getMergeMobDetail, mergeMob } from '../../../../services/private/livestock';

class MergeMob extends Component {

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
            
            this.isIndividual = this.selectedData[0].IsMob == 0;
            this.livestockIds = _map(this.selectedData, 'Id');
            this.livestockData = [];
        }
        else
            this.backToLivestock();

        this.state = {
            key: Math.random(),
            isClicked: false,
            tabKey: 'tabSelectedMob',
            species: null,
            dataSource: this.selectedData,
            livestock: [],
            enclosureType: []
        }

        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderTab = this.renderTab.bind(this);

        this.tabChanged = this.tabChanged.bind(this);

        this.saveMergeMob = this.saveMergeMob.bind(this);
        this.resetMergeMob = this.resetMergeMob.bind(this);
        this.updateOnUnselect = this.updateOnUnselect.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getMergeMobDetail(this.livestockIds, this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.livestockData = res.data.livestock;
                let enclosureType = res.data.enclosureType;
                _this.stateSet({ livestock: _this.livestockData, species: res.data.speciesName || '', enclosureType: enclosureType });
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
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
    resetMergeMob() {
        this.setState({ key: Math.random(), tabKey: 'tabSelectedMob', isClicked: false, dataSource: this.selectedData });
        if (this.refs.tabResultMobAttr)
            this.refs.tabResultMobAttr.setState({ key: Math.random() });
    }

    // handle save button click
    saveMergeMob() {
        let { tabResultMob, tabResultMobAttr } = this.refs;
        let tabResultMobObj = tabResultMob ? tabResultMob.getValues() : null;
        let tabResultMobAttrObj = tabResultMobAttr ? tabResultMobAttr.getValues() : null;

        if (!tabResultMobObj) {
            this.setState({ tabKey: 'tabResultMob', isClicked: true });
            return false;
        }
        if (!tabResultMobAttrObj) {
            this.setState({ tabKey: 'tabResultMobAttr', isClicked: true });
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.VERIFY_ATTRIBUTES });
            return false;
        }

        let finalObj = {
            isSelected: tabResultMobObj.mob.id ? true : false,
            isIndividual: this.isIndividual,
            resultMob: tabResultMobObj,
            resultMobAttr: tabResultMobAttrObj,
            selectedMobNames: _uniq(_map(this.selectedData, 'MobName'))
        }

        let _this = this;
        return mergeMob(finalObj).then(function (res) {
            if (res.success) {
                _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS });
                return true;
            }
            else {
                _this.notifyToaster(NOTIFY_ERROR);
                return false;
            }
        });

    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    // update datasource after unselecting mob
    updateOnUnselect(ids) {
        let selectedData = _filter([...this.state.dataSource], function (x) {
            return !_includes(ids, x.Id);
        });
        this.livestockIds = _map(selectedData, 'Id');
        let livestockData = _filter([...this.state.livestock.livestocks], function (x) {
            return !_includes(ids, x.UUID);
        });
        this.stateSet({ dataSource: selectedData, livestock: { livestocks: livestockData } });
        if (this.refs.tabResultMobAttr)
            this.refs.tabResultMobAttr.setState({ key: Math.random() });
    }

    // Render tab of content area
    renderTab() {
        let tabProps = {
            isClicked: this.state.isClicked,
            notifyToaster: this.notifyToaster
        }
        let selectedMobData = {
            data: this.selectedData,
            species: this.state.species
        }
        let resultMobData = {
            data: this.state.dataSource,
            propertyId: this.props.topPIC.PropertyId,
            enclosureType: this.state.enclosureType,
            species: this.state.species
        }
        let resultMobAttrData = {
            data: this.state.livestock,
            livestockIds: this.livestockIds,
            isIndividual: this.isIndividual ? '1' : '2',
            topPIC: this.props.topPIC
        }

        return (
            <Tabs
                activeKey={this.state.tabKey}
                onChange={this.tabChanged}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent animated={false} />} >
                <TabPane tab={this.strings.TAB_SELECTED_MOB_LABEL} key="tabSelectedMob">
                    <TabSelectedMob {...selectedMobData} {...tabProps}
                        strings={{ ...this.strings.TAB_SELECTED_MOB, COMMON: this.strings.COMMON }}
                        updateDataSource={this.updateOnUnselect}
                        ref="tabSelectedMob" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_RESULT_MOB_LABEL} key="tabResultMob">
                    <TabResultMob {...resultMobData} isClicked={this.state.isClicked}
                        strings={{ ...this.strings.TAB_RESULT_MOB, COMMON: this.strings.COMMON }}
                        {...tabProps} ref="tabResultMob" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_RESULT_MOB_ATTR_LABEL} key="tabResultMobAttr">
                    {this.state.species ?
                        <TabResultMobAttr {...resultMobAttrData} isClicked={this.state.isClicked}
                            strings={{ ...this.strings.TAB_RESULT_MOB_ATTR, COMMON: this.strings.COMMON }}
                            primaryStrings={{ ...this.strings.TABS['PRIMARY-TAB'], COMMON: this.strings.COMMON }}
                            secondaryStrings={{ ...this.strings.TABS['OTHER-TAB'], COMMON: this.strings.COMMON }}
                            {...tabProps} ref="tabResultMobAttr" /> : <LoadingIndicator />}
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
                    <div className="cattle-text">
                        <span>{this.strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear" ></div>
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
                                    onClick={this.resetMergeMob}
                                ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnSave',
                                        label: this.strings.CONTROLS.SAVE_LABEL,
                                        className: 'button2Style button30Style',
                                    }}
                                    redirectUrl='/livestock'
                                    loaderHeight={25}
                                    onClick={this.saveMergeMob}
                                ></BusyButton>
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

export default MergeMob;