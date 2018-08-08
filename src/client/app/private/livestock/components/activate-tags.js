'use strict';

/**************************
 * activate tags component
 * **************************** */

import React, { Component } from 'react';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import PrimaryTab from './livestock/tab_primary';
import SecondaryTab from './livestock/tab_other';
import { browserHistory } from 'react-router';
import { activateTags } from '../../../../services/private/livestock';
import { NOTIFY_ERROR, NOTIFY_SUCCESS } from '../../../common/actiontypes';

class ActivateTag extends Component {
    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.notifyToaster = this.props.notifyToaster;
        this.state = {
            tabKey: 'primaryTab',
            isClicked: false
        }

        this.tabChanged = this.tabChanged.bind(this);
        this.onBack = this.onBack.bind(this);
        this.activateTags = this.activateTags.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        if (!this.props.selectedTags) {
            this.onBack();
        }
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // handle tab change event
    tabChanged(key) {
        this.stateSet({ tabKey: key });
    }

    onBack() {
        browserHistory.replace('/livestock/show-tags');
    }

    activateTags() {
        let primaryTabValues = this.refs.primaryTab.getFormValues();
        let otherTabValues = this.refs.otherTab ? this.refs.otherTab.getFormValues() : {};
        if (primaryTabValues && otherTabValues) {
            let inductionData = Object.assign({}, primaryTabValues, otherTabValues);
            inductionData.topPIC = this.props.topPIC;
            inductionData.selectedTags = this.props.selectedTags;

            let _this = this;
            activateTags(inductionData).then(function (res) {
                if (res.success) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ACTIVATE_SUCCESS });
                    _this.onBack();
                }
                else { _this.notifyToaster(NOTIFY_ERROR) }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR)
            });
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
            detail: 'activate-tags',
            data: {}
        }
        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <InkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={strings.PRIMARY_TAB_TITLE} key="primaryTab">
                            <PrimaryTab strings={{
                                ...strings.TABS['PRIMARY-TAB'],
                                COMMON: this.strings.COMMON
                            }}
                                {...commonProps} ref='primaryTab' />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={strings.OTHER_TAB_TITLE} key="otherTab">
                            <SecondaryTab strings={{ ...strings.TABS['OTHER-TAB'], COMMON: this.strings.COMMON }}
                                {...commonProps} ref="otherTab" />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }

    // Render header area of component
    renderHeader() {
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{this.strings.TITLE}</span>
                </div>
                <div className="l-stock-top-btn setup-top">
                    <Button
                        inputProps={{
                            name: 'btnBack',
                            label: 'Cancel',
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.onBack} ></Button>
                    <BusyButton
                        inputProps={{
                            name: 'btnSave',
                            label: 'Save',
                            className: 'button2Style button30Style'
                        }}
                        loaderHeight={25}
                        redirectUrl={'/livestock'}
                        onClick={this.activateTags} ></BusyButton>
                </div>
            </div>
        </div>);
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderForm()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default ActivateTag;