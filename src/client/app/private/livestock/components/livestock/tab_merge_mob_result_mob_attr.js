'use strict';

/**************************
 * tab component of merge mob - Result Mob Attributes
 * **************************** */

import React, { Component } from 'react';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import PrimaryMultipleTab from './tab_primary_multiple';
import SecondaryMultipleTab from './tab_other_multiple';

import { bufferToUUID } from '../../../../../../shared/uuid';
import { NOTIFY_WARNING } from '../../../../common/actiontypes';

class TabResultMobAttr extends Component {

    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.data = { ...this.props.data };
        this.livestockIds = [...this.props.livestockIds];

        this.state = {
            key: Math.random(),
            tabKey: 'primaryTab'
        }

        this.updateConflictDS = this.updateConflictDS.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
        this.getValues = this.getValues.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // update datasource for conflict values from primary tab to other tab
    // while modify multiple livestocks
    updateConflictDS(livestockObj) {
        this.stateSet({ conflictDS: livestockObj });
    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    getValues() {
        this.data = { ...this.props.data };
        this.livestockIds = [...this.props.livestockIds];

        let primaryTabValues = this.refs.primaryTab.getFormValues();
        let otherTabValues = this.refs.otherTab ? this.refs.otherTab.getFormValues() : null;

        if (!otherTabValues) {
            this.setState({ tabKey: 'otherTab' });
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.VERIFY_ATTRIBUTES });
            return false;
        }

        if (primaryTabValues && otherTabValues) {
            let inductionData = Object.assign({}, primaryTabValues, otherTabValues);
            inductionData.topPIC = this.props.topPIC;

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
            return inductionData;
        }
        else
            return false;
    }

    render() {

        this.data = { ...this.props.data };
        let commonProps = {
            topPIC: this.props.topPIC,
            notifyToaster: this.notifyToaster,
            isClicked: this.props.isClicked,
            stateSet: this.stateSet
        }

        return (
            <div key={this.state.key} className="row">
                <div className="col-md-12">
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <ScrollableInkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={this.strings.PRIMARY_TAB_TITLE} key="primaryTab">
                            <PrimaryMultipleTab
                                strings={this.props.primaryStrings}
                                type={this.props.isIndividual}
                                data={this.data}
                                updateConflictDS={this.updateConflictDS}
                                {...commonProps} ref='primaryTab' />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={this.strings.OTHER_TAB_TITLE} key="otherTab">
                            <SecondaryMultipleTab strings={this.props.secondaryStrings}
                                {...commonProps} ref="otherTab" data={this.state.conflictDS} />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }
}
export default TabResultMobAttr;