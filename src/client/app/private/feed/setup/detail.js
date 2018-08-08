'use strict';

/**************************
 * Detail page for feed (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import TabFeed from './tab_feed';
import TabStock from './tab_stock';

import { isUUID } from '../../../../../shared/format/string';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getFeedStockComp, saveFeedStockComp } from '../../../../services/private/feed';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

class Detail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.state = {
            isClicked: false,
            error: null,
            dataFetch: false,
            tabKey: 'tabFeed'
        }

        this.data = null;
        this.saveFeed = this.saveFeed.bind(this);
        this.onBack = this.onBack.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Get details for edit mode
    componentWillMount() {
        this.mounted = true;
        if (!this.addMode && !isUUID(this.props.detail)) {
            this.onBack();
        }
        let _this = this;
        if (!this.addMode) {
            getFeedStockComp(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.data = res.data;
                    _this.stateSet({ dataFetch: true });
                }
                else if (res.badRequest) {
                    _this.stateSet({ dataFetch: true });
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.stateSet({ dataFetch: true });
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.stateSet({ dataFetch: true });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Save (add/edit) records
    saveFeed(e) {
        e.preventDefault();

        let finalObj = {};
        let feedTabObj = this.refs.feedTab.getValues();
        let stockTabObj = this.refs.stockTab != undefined ? this.refs.stockTab.getValues() : { feedStock: [], updateStockDB: false };

        if (feedTabObj != false) {
            finalObj = {
                ...feedTabObj,
                ...stockTabObj
            }

            if (!this.addMode) {
                finalObj.feed.FeedId = this.props.detail;
                finalObj.feed.AuditLogId = this.data.feed.AuditLogId;
            }

            let _this = this;
            return saveFeedStockComp(finalObj).then(function (res) {
                if (res.success) {
                    if (_this.addMode) {
                        _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                    }
                    else {
                        _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.MODIFY_SUCCESS });
                    }
                    return true;
                }
                else if (res.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.setState({ tabKey: 'tabFeed', isClicked: true });
        }
    }

    // Back to display page
    onBack() {
        browserHistory.replace('/feed/setup');
    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    // Render header area of component
    renderHeader() {
        let title = this.strings.ADD_TITLE;
        if (!this.addMode) {
            title = this.strings.MODIFY_TITLE;
        }
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{title}</span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnBack',
                                    label: this.strings.CONTROLS.BACK_LABEL,
                                    className: 'button1Style button30Style'
                                }}
                                onClick={this.onBack} ></Button>
                        </li>
                        <li>
                            <BusyButton
                                inputProps={{
                                    name: 'btnSave',
                                    label: this.strings.CONTROLS.SAVE_LABEL,
                                    className: 'button2Style button30Style'
                                }}
                                loaderHeight={25}
                                redirectUrl='/feed/setup'
                                onClick={this.saveFeed} ></BusyButton>
                        </li>

                    </ul>
                </div>
            </div>
        </div>);
    }

    // Render content area of component
    renderContent() {
        return (<div className="stock-list">
            <div className="stock-list-cover">
                <div className="livestock-content">
                    <div className="cattle-text">
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    {this.renderForm()}
                </div>
            </div>
        </div>);
    }

    // Render form of content area
    renderForm() {
        if (this.state.dataFetch) {
            return (
                <Tabs
                    activeKey={this.state.tabKey}
                    onChange={this.tabChanged}
                    renderTabBar={() => <ScrollableInkTabBar />}
                    renderTabContent={() => <TabContent animated={false} />} >
                    <TabPane tab={this.strings.FEED_TAB_LABEL} key="tabFeed">
                        <TabFeed feedData={!this.addMode ? this.data.feed : null} feedCompositionData={!this.addMode ? this.data.feedComposition : []} strings={{ ...this.strings.FEED, COMMON: this.strings.COMMON }} detail={this.props.detail}
                            hierarchyProps={{ ...this.props.hierarchyProps }} isClicked={this.state.isClicked}
                            notifyToaster={this.props.notifyToaster} ref="feedTab" />
                        <div className="clearfix"></div>
                    </TabPane>
                    <TabPane tab={this.strings.STOCK_TAB_LABEL} key="tabStock">
                        <TabStock stockData={!this.addMode ? this.data.feedStock : []} strings={{ ...this.strings.STOCK, COMMON: this.strings.COMMON }} detail={this.props.detail}
                            hierarchyProps={{ ...this.props.hierarchyProps }} isClicked={this.state.isClicked}
                            notifyToaster={this.props.notifyToaster}
                            openConfirmPopup={this.props.openConfirmPopup}
                            hideConfirmPopup={this.props.hideConfirmPopup}
                            ref="stockTab" />
                        <div className="clearfix"></div>
                    </TabPane>
                </Tabs>
            );
        }
        else {
            return <LoadingIndicator onlyIndicator={true} />;
        }
    }

    // Render component
    render() {
        return (
            <div className="dash-right">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }

}

export default Detail;