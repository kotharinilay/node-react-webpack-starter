'use strict';

/************************************************
 * Display notifications received for logged in user
 ***********************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, forEach, remove } from 'lodash';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';
require('rc-tabs/assets/index.css');

import Button from '../../../../lib/core-components/Button';
import Input from '../../../../lib/core-components/Input';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import { getForm } from '../../../../lib/wrapper-components/FormActions';

import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';
import { getContactNotifications, removeNotifications, markNotificationAsRead } from '../../../../services/private/footer';
import { localToUTC } from '../../../../../shared/format/date';

// child components
import TabNotification from './tab_notification';

class NotificationBoard extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            tabKey: 'tabUnread',
            key: Math.random(),
            isClicked: false,
            displayFilter: false,
            clearFilterKey: Math.random(),
            AllDataSource: [],
            selectAll: false,
            Content: {
                TagLine: null,
                ReceivedDateTime: null,
                Body: null
            }
        };

        this.filterSchema = ['SearchValue', 'ReceivedFromDate', 'ReceivedToDate'];
        this.strings = this.props.strings;
        this.tabChanged = this.tabChanged.bind(this);
        this.setContentBody = this.setContentBody.bind(this);
        this.fetchNotifications = this.fetchNotifications.bind(this);

        this.renderHeader = this.renderHeader.bind(this);
        this.renderFilter = this.renderFilter.bind(this);
        this.renderContent = this.renderContent.bind(this);

        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.deleteMessages = this.deleteMessages.bind(this);
        this.onCheckChanged = this.onCheckChanged.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        this.fetchNotifications(null);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div className="dash-right">
                {this.renderHeader(this.strings)}
                <div className="clear"></div>
                {this.renderContent(this.strings)}
                <div className="clear"></div>
            </div>
        );
    }

    // tab change event
    tabChanged(key) {
        let dataSource = this.state.AllDataSource;
        dataSource.map((ds) => {
            if (ds.MarkAsRead = ds.readFlag);
        });
        this.stateSet({ tabKey: key, AllDataSource: dataSource });
    }

    // apply search on notification listing
    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);

        if (obj != null) {
            if (!isEmpty(obj.SearchValue) || obj.ReceivedFromDate != null || obj.ReceivedToDate != null) {

                let filterObj = Object.assign({}, obj);

                if (obj.ReceivedFromDate != null) {
                    filterObj.ReceivedFromDate = localToUTC(obj.ReceivedFromDate);
                }
                if (obj.ReceivedToDate != null) {
                    filterObj.ReceivedToDate = localToUTC(obj.ReceivedToDate);
                }

                // compare dates
                if (obj.ReceivedFromDate != null && obj.ReceivedToDate != null && filterObj.ReceivedFromDate > filterObj.ReceivedToDate) {
                    this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.DATE_VALIDATION });
                    return;
                }

                this.fetchNotifications(filterObj);
                return;
            }
        }
        this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
    }

    // clear filter and load all data
    clearFilter() {
        this.stateSet({ clearFilterKey: Math.random() });
        this.fetchNotifications(null);
    }

    // show/hide filter screen
    toggleFilter() {
        let filterState = this.state.displayFilter;
        this.setState({ displayFilter: !filterState });
    }

    // select/clear all checkboxes
    toggleSelection() {

        var s = !this.state.selectAll;
        this.stateSet({ selectAll: s });
        let tab = this.state.tabKey;

        if (tab == "tabUnread") {
            let dataSource = [...this.state.AllDataSource];
            forEach(dataSource, function (f) {
                if (!f.MarkAsRead)
                    f.IsSelected = s;
            });
            this.stateSet({ AllDataSource: dataSource });
        }
        else {
            let dataSource = [...this.state.AllDataSource];
            forEach(dataSource, function (f) {
                f.IsSelected = s;
            });
            this.stateSet({ AllDataSource: dataSource });
        }
    }

    onCheckChanged(value, id) {
        let dataSource = [...this.state.AllDataSource];
        dataSource.map(m => {
            if (m.NotificationReceiverId == id) {
                m.IsSelected = value;
            }
            return m;
        });
        this.stateSet({ AllDataSource: dataSource });
    }

    // delete selected notifications
    deleteMessages() {
        let selected = this.state.AllDataSource.filter(function (f) {
            return f.IsSelected == true;
        });

        if (selected.length == 0) {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.DELETE_WARNING });
            return;
        }

        let _this = this;
        removeNotifications(selected.map(m => m.NotificationReceiverId)).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                let source = _this.state.AllDataSource;
                remove(source, function (f) {
                    return f.IsSelected == true;
                });
                _this.stateSet({
                    AllDataSource: source, Content: { TagLine: null, ReceivedDateTime: null, Body: null }
                });
            }
        });
    }

    // retrieve notifications from api
    fetchNotifications(filterObj) {
        let _this = this;
        getContactNotifications(filterObj).then(function (response) {
            if (response.success == true) {
                forEach(response.data, function (e) {
                    e.IsSelected = false;
                    e.readFlag = e.MarkAsRead;
                });
                _this.stateSet({ AllDataSource: response.data });
            }
        });
    }

    // display content of selected message
    setContentBody(item) {
        let dataSource = this.state.AllDataSource;
        if (item.MarkAsRead == 0) {
            markNotificationAsRead(item.NotificationReceiverId);

            let currItem = dataSource.find((urd) => {
                return urd.NotificationReceiverId == item.NotificationReceiverId;
            });
            currItem.readFlag = 1;
        }
        this.stateSet({ Content: item, AllDataSource: dataSource });
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
                                        name: 'btnSelectAll',
                                        label: this.state.selectAll == false ? this.strings.CONTROLS.SELECTALL_LABEL : this.strings.CONTROLS.CLEAR_LABEL,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.toggleSelection}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnDelete',
                                        label: this.strings.CONTROLS.DELETE_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.deleteMessages}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnFilter',
                                        label: this.strings.CONTROLS.FILTER_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.toggleFilter}
                                ></Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >);
    }

    // render filter screen
    renderFilter() {
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.clearFilterKey}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={this.toggleFilter}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>                
            </h2>
            <div className="clearfix"></div>
            <div className="form-group">
                <Input inputProps={{
                    name: 'SearchValue',
                    hintText: this.strings.CONTROLS.SEARCH_PLACEHOLDER
                }}
                    maxLength={250}
                    isLoading={false}
                    isClicked={this.props.isClicked} ref="SearchValue" />
            </div>
            <div className="form-group">
                <DatetimePicker inputProps={{
                    name: 'receivedFromDate',
                    placeholder: this.strings.CONTROLS.RECEIVED_FROMDATE_PLACEHOLDER
                }}
                    isClicked={this.state.isClicked} ref="ReceivedFromDate" />
            </div>
            <div className="form-group">
                <DatetimePicker inputProps={{
                    name: 'receivedToDate',
                    placeholder: this.strings.CONTROLS.RECEIVED_TODATE_PLACEHOLDER
                }}
                    isClicked={this.state.isClicked} ref="ReceivedToDate" />
            </div>
            <div className="f-btn">
                <Button
                    inputProps={{
                        name: 'btnApplyFilter',
                        label: this.strings.CONTROLS.APPLY_FILTER_LABEL,
                        className: 'button1Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.applyFilter}
                ></Button>
            </div>
            <div className="f-btn mt5">
                <Button
                    inputProps={{
                        name: 'btnClearFilter',
                        label: this.strings.CONTROLS.CLEAR_FILTER_LABEL,
                        className: 'button3Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.clearFilter}
                ></Button>
            </div>
        </div>);
    }

    // render tabs and body content
    renderContent() {

        let markup = {
            __html: this.state.Content.Body
        };
        let tabProps = {
            onCheckChanged: this.onCheckChanged,
            dataSource: this.state.AllDataSource,
            setContentBody: this.setContentBody,
            tabKey: this.state.tabKey
        }
        return (
            <div className="stock-list">
                <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                    <div className="livestock-content">
                        <div className="rows">
                            <div className="col-md-4 notifi-main">
                                <Tabs
                                    activeKey={this.state.tabKey}
                                    onChange={this.tabChanged}
                                    renderTabBar={() => <ScrollableInkTabBar />}
                                    renderTabContent={() => <TabContent animated={false} />} >
                                    <TabPane tab={this.strings.ALL_TAB_LABEL} key="tabAll" style={{
                                        overflow: "hidden"
                                    }}>
                                        <TabNotification {...tabProps} >
                                        </TabNotification>
                                    </TabPane>
                                    <TabPane tab={this.strings.UNREAD_TAB_LABEL} key="tabUnread" style={{
                                        overflow: "hidden"
                                    }}>
                                        <TabNotification {...tabProps}>
                                        </TabNotification>
                                    </TabPane>
                                </Tabs>
                            </div>
                            <div className="col-md-8 ">
                                <div className="notifi-right">
                                    <h3>
                                        {this.state.Content.TagLine}
                                        {this.state.Content.ReceivedDateTime != null ? (<span>{this.state.Content.ReceivedDateTime.toString()}</span>) : null}
                                    </h3>
                                    <Scrollbars autoHide autoHeight autoHeightMax={300}>
                                        <div dangerouslySetInnerHTML={markup} className="notifi-cont"></div>
                                    </Scrollbars>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderFilter()}
                </div>
            </div>
        );
    }
}

export default NotificationBoard;