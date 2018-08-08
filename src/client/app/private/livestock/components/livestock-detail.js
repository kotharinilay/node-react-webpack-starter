'use strict';

/**************************
 * Livestock detail component to create and modify 
 * individual livestock/mob
 * **************************** */

import React, { Component } from 'react';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import RadioButton from '../../../../lib/core-components/RadioButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import PrimaryTab from './livestock/tab_primary';
import SecondaryTab from './livestock/tab_other';
import PrimaryMultipleTab from './livestock/tab_primary_multiple';
import SecondaryMultipleTab from './livestock/tab_other_multiple';
import DuplicateEID from './popup/duplicate-EID';
import { browserHistory } from 'react-router';
import { getLivestockById, checkDuplicateEID, saveLivestock, multipleModifyLivestock } from '../../../../services/private/livestock';
import { getPICManagerHierarchy } from '../../../../services/private/property';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';
import { livestockIdentifierCodes, livestockActivityStatusCodes } from '../../../../../shared/constants';
import { bufferToUUID } from '../../../../../shared/uuid';
import { LocalStorageKeys } from '../../../../../shared/constants';

class LivestockDetail extends Component {
    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.data = {};
        this.popupText = null;
        this.notifyToaster = this.props.notifyToaster;

        if (localStorage.getItem(LocalStorageKeys.LivestockData) != null && this.props.params.subdetail != 'add') {
            let data = JSON.parse(localStorage.getItem(LocalStorageKeys.LivestockData));
            if (data.propertyId != this.props.topPIC.PropertyId || data.data.length == 0)
                this.backToLivestock();
            this.selectedData = data.data;
            this.livestockIds = this.selectedData.map((obj) => {
                return obj.Id;
            })
        }
        else if (this.props.params.subdetail == 'modify')
            this.backToLivestock();

        this.state = {
            key: Math.random(),
            tabKey: 'primaryTab',
            isClicked: false,
            isIndividual: this.selectedData ? this.selectedData[0].IsMob == 0 ? '1' : '2' : '1',
            dataFatch: false,
            openDuplicateEID: false,
            conflictDS: {}
        }

        this.backToLivestock = this.backToLivestock.bind(this);
        this.onRadioChange = this.onRadioChange.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.saveLivestock = this.saveLivestock.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onBack = this.onBack.bind(this);
        this.toggleDuplicateEID = this.toggleDuplicateEID.bind(this);
        this.updateConflictDS = this.updateConflictDS.bind(this);
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        if (this.props.params.subdetail == 'add')
            this.stateSet({ dataFatch: true });
        else

            return getLivestockById(this.livestockIds).then(function (res) {
                if (res.success) {
                    _this.data = res.data;
                    _this.stateSet({ dataFatch: true });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.backToLivestock();
    }

    // handle tab change event
    tabChanged(key) {
        this.stateSet({ tabKey: key });
    }

    // Handle cancel button events
    backToLivestock() {
        browserHistory.replace('/livestock');
    }

    onRadioChange(value, text) {
        this.stateSet({ isIndividual: value });
    }

    // update datasource for conflict values from primary tab to other tab
    // while modify multiple livestocks
    updateConflictDS(livestockObj) {
        this.stateSet({ conflictDS: livestockObj });
    }

    saveLivestock() {
        let primaryTabValues = this.refs.primaryTab.getFormValues();
        let otherTabValues = this.refs.otherTab ? this.refs.otherTab.getFormValues() : {};
        if (primaryTabValues && otherTabValues) {
            let inductionData = Object.assign({}, primaryTabValues, otherTabValues);
            inductionData.topPIC = this.props.topPIC;
            let _this = this;

            if (this.props.params.subdetail == 'modify-multiple') {
                Object.keys(inductionData).forEach((key) => {
                    if (inductionData[key] && (inductionData[key] == 'Mixed Value' || inductionData[key] == '-1')) {
                        delete inductionData[key];
                    }
                });

                inductionData.livestockId = this.livestockIds;
                let livestockAuditIds = [];
                this.data.livestocks.forEach(function (element) {
                    livestockAuditIds.push(element.AuditLogId);
                }, this);
                inductionData.livestockAuditId = livestockAuditIds;
                if (inductionData.activitystatus && inductionData.activitystatus != bufferToUUID(this.data.livestocks[0].ActivityStatusId)) {
                    inductionData.activityHistory = true;
                }
                return multipleModifyLivestock(inductionData).then(function (res) {
                    if (res.success) {
                        _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                        return true;
                    }
                    else if (res.badRequest) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                        return false;
                    }
                }).catch(function (err) {
                    _this.props.notifyToaster(NOTIFY_ERROR);
                });
            }
            if (inductionData.type == '1')
                return checkDuplicateEID(inductionData.livestockidentifier, inductionData.identifier, primaryTabValues.livestockId).then(function (res) {

                    let deceasedId, killedId;
                    res.data.activityStatus.forEach(function (ele) {
                        if (ele.SystemCode == livestockActivityStatusCodes['Deceased']) deceasedId = ele.Id;
                        if (ele.SystemCode == livestockActivityStatusCodes['Killed']) killedId = ele.Id;
                    }, _this);
                    if (inductionData.livestockidentifier == livestockIdentifierCodes['EID'] ||
                        inductionData.livestockidentifier == livestockIdentifierCodes['NLISID']) {
                        let isDup = res.data.dupLivestock.filter((livestock) => {
                            return (bufferToUUID(livestock.ActivityStatusId) != deceasedId || bufferToUUID(livestock.ActivityStatusId) != killedId)
                                && !livestock.IsDeleted && inductionData.livestockId != livestock.Id
                        }, _this);
                        if (isDup.length > 0) {

                            let openPopup = isDup.every(function (ele) {
                                return bufferToUUID(ele.CurrentPropertyId) != _this.props.topPIC.PropertyId;
                            }, _this);
                            if (openPopup) {

                                let propertyId = bufferToUUID(isDup[0].CurrentPropertyId);
                                // required data for edit livestock and history while p2p transfer
                                inductionData.livestockId = isDup[0].Id;
                                inductionData.livestockAuditId = isDup[0].AuditLogId;
                                inductionData.propertyHistory = true;
                                inductionData.enclosurename = null;
                                if (inductionData.livestockweight != isDup[0].CurrentWeight)
                                    inductionData.weightHistory = true;
                                if (inductionData.activitystatus != bufferToUUID(isDup[0].ActivityStatusId))
                                    inductionData.activityHistory = true;
                                getPICManagerHierarchy(propertyId, _this.props.topPIC.CompanyId, _this.props.topPIC.RegionId,
                                    _this.props.topPIC.BusinessId).then(function (result) {
                                        _this.data = inductionData;
                                        _this.popupText = result.data;
                                        _this.toggleDuplicateEID(true);
                                    })
                            }
                            else {

                                // restrict save
                                _this.notifyToaster(NOTIFY_ERROR, { message: _this.strings.SAME_PIC_VALIDATION_MESSAGE });
                                return false;
                            }
                        }
                        else {
                            // save
                            return saveLivestock(inductionData).then(function (res) {
                                if (res.success) {
                                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                                    return true;
                                }
                                else if (res.badRequest) {
                                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                                    return false;
                                }
                            }).catch(function (err) {
                                _this.props.notifyToaster(NOTIFY_ERROR);
                            });
                        }
                    }
                    else {
                        let isDup = res.data.dupLivestock.every((livestock) => {
                            return bufferToUUID(livestock.CurrentPropertyId) != _this.props.topPIC.PropertyId && !livestock.IsDeleted
                        }, _this);
                        if (!isDup) {
                            // restrict save
                            _this.notifyToaster(NOTIFY_ERROR, { message: _this.strings.SAME_PIC_VALIDATION_MESSAGE });
                            return false;
                        }
                        else {
                            // save
                            return saveLivestock(inductionData).then(function (res) {
                                if (res.success) {
                                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                                    return true;
                                }
                                else if (res.badRequest) {
                                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                                    return false;
                                }
                            }).catch(function (err) {
                                _this.props.notifyToaster(NOTIFY_ERROR);
                            });
                        }
                    }
                });
            else
                return saveLivestock(inductionData).then(function (res) {
                    if (res.success) {
                        _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SAVE_SUCCESS_MESSAGE });
                        return true;
                    }
                    else if (res.badRequest) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                        return false;
                    }
                }).catch(function (err) {

                    _this.props.notifyToaster(NOTIFY_ERROR);
                });
        }
    }

    onReset() {
        this.setState({ key: Math.random() });
    }

    onBack() {
        browserHistory.replace('/livestock');
    }

    toggleDuplicateEID(isOpen) {
        if (!isOpen) {
            this.setState({ openDuplicateEID: isOpen });
        }
        else {
            this.setState({ openDuplicateEID: isOpen });
        }
    }

    // Render form components
    renderForm() {
        let strings = this.strings;
        let commonProps = {
            selectedTags: this.props.selectedTags,
            topPIC: this.props.topPIC,
            notifyToaster: this.props.notifyToaster,
            isClicked: this.state.isClicked,
            stateSet: this.stateSet,
            subdetail: this.props.params.subdetail
        }
        if (this.state.dataFatch) {
            return (
                <div className="stock-list" key={this.state.key}>
                    <div className="stock-list-cover">
                        <div className={this.props.params.subdetail.indexOf('modify') != -1 ? 'hidden' : ''}>
                            <RadioButton inputGroupProps={{ name: 'type', defaultSelected: '1' }}
                                dataSource={[{ Value: '1', Text: strings.CONTROLS.INDIVIDUAL_LIVESTOCK_LABEL },
                                { Value: '2', Text: strings.CONTROLS.MOB_LABEL }]}
                                onChange={this.onRadioChange}
                                textField="Text" valueField="Value"
                                isClicked={this.state.isClicked} ref="type" />
                        </div>
                        <Tabs
                            activeKey={this.state.tabKey}
                            onChange={this.tabChanged}
                            renderTabBar={() => <InkTabBar />}
                            renderTabContent={() => <TabContent animated={false} />} >
                            <TabPane tab={strings.PRIMARY_TAB_TITLE} key="primaryTab">
                                {this.livestockIds && this.livestockIds.length > 1 ?
                                    <PrimaryMultipleTab strings={{
                                        ...strings.TABS['PRIMARY-TAB'],
                                        COMMON: this.strings.COMMON
                                    }} type={this.state.isIndividual} data={this.data} updateConflictDS={this.updateConflictDS}
                                        {...commonProps} ref='primaryTab' /> :
                                    <PrimaryTab strings={{
                                        ...strings.TABS['PRIMARY-TAB'],
                                        COMMON: this.strings.COMMON
                                    }} type={this.state.isIndividual} data={this.data}
                                        {...commonProps} ref='primaryTab' />
                                }

                                <div className="clearfix">
                                </div>
                            </TabPane>
                            <TabPane tab={strings.OTHER_TAB_TITLE} key="otherTab">
                                {this.livestockIds && this.livestockIds.length > 1 ?
                                    <SecondaryMultipleTab strings={{ ...strings.TABS['OTHER-TAB'], COMMON: this.strings.COMMON }}
                                        {...commonProps} ref="otherTab" data={this.state.conflictDS} /> :
                                    <SecondaryTab strings={{ ...strings.TABS['OTHER-TAB'], COMMON: this.strings.COMMON }}
                                        {...commonProps} ref="otherTab" data={this.data} />
                                }
                                <div className="clearfix">
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            );
        } else {
            return <LoadingIndicator />;
        }
    }

    // Render header area of component
    renderHeader() {
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{this.props.params.subdetail.indexOf('modify') == -1 ? this.strings.ADD_TITLE : this.strings.MODIFY_TITLE}</span>
                </div>
                <div className="l-stock-top-btn setup-top">
                    <Button
                        inputProps={{
                            name: 'btnBack',
                            label: this.strings.CONTROLS.CANCEL_LABEL,
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.onBack} ></Button>
                    <Button
                        inputProps={{
                            name: 'btnReset',
                            label: this.strings.CONTROLS.RESET_LABEL,
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.onReset} ></Button>
                    <BusyButton
                        inputProps={{
                            name: 'btnSave',
                            label: 'Save',
                            className: 'button2Style button30Style'
                        }}
                        loaderHeight={25}
                        redirectUrl={'/livestock'}
                        onClick={this.saveLivestock} ></BusyButton>
                </div>
            </div>
        </div>);
    }

    render() {
        return (
            <div className="row">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderForm()}
                <div className="clear"></div>
                {this.state.openDuplicateEID ?
                    <DuplicateEID
                        notifyToaster={this.props.notifyToaster}
                        strings={{ ...this.strings.DUPLICATE_EID, COMMON: this.strings.COMMON }}
                        toggleDuplicateEID={this.toggleDuplicateEID} data={this.data} popupText={this.popupText} />
                    : null}
            </div>
        );
    }
}

export default LivestockDetail;