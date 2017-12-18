'use strict';

/*********************************************
 * Dashboard screen to display widgets
 * as per logged in user preference
 * ***************************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import { sortBy, map, debounce, find } from 'lodash';

import WidgetContainer from './WidgetContainer';
import AbsoluteGrid from '../../../../../../assets/js/react-absolute-grid/AbsoluteGrid';
import { getPreferredWidgets, updatePreferredWidgets } from '../../../../services/private/dashboard';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

class Home extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.onMoveDebounced = this.onMoveDebounced.bind(this);
        this.onMove = this.onMove.bind(this);
        this.hideWidget = this.hideWidget.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.state = { widgets: [] };
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // get widgets per user, prepare widget array
    componentWillMount() {
        this.mounted = true;
        var _this = this;

        getPreferredWidgets().then(function (data) {
            if (data.success) {
                var widgets = sortBy(data.widgets, "Order").map(function (m, i) {
                    return {
                        key: i,
                        filter: 0,
                        name: m.Key,
                        titleColor: m.Bgclass,
                        sort: m.Order
                    };
                });
                _this.stateSet({ widgets: widgets });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // update sort-order of source and destination widgets
    // to inter-change position while dragging
    onMove = function (source, target) {
        var widgets = this.state.widgets;

        source = find(widgets, { key: parseInt(source, 10) });
        target = find(widgets, { key: parseInt(target, 10) });

        var targetSort = target.sort;
        var sourceSort = source.sort;

        source.sort = targetSort;
        target.sort = sourceSort;

        this.stateSet({ widgets: widgets });
    }

    // custom event called when drag-end event is called by widget
    // this will update latest sort order to database
    onDragEnd = function () {
        const widgets = sortBy(this.state.widgets, "sort");

        let data = [];
        map(widgets, (item, index) => {
            data.push(item.name, index + 1);
        });

        var _this = this;
        updatePreferredWidgets(data).then().catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Important:
    // setTimeout is introduced here as 
    // before deleting state is set from BaseDisplayObject
    // to avoid setState error while unmounting
    hideWidget(name) {
        var _this = this;
        setTimeout(function () {
            var remainingItems = sortBy(_this.state.widgets.filter(
                function (item) {
                    return item.name != name
                }), "sort");

            let data = [];
            map(remainingItems, (item, index) => {
                data.push(item.name, index + 1);
            });

            _this.stateSet({ widgets: remainingItems });
            updatePreferredWidgets(data).then().catch(function () {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }, 500);
    }

    // delays invoking func until after wait milliseconds have elapsed
    onMoveDebounced = debounce(this.onMove, 40);

    render() {
        return (
            <div className="dash-right">
                <div className="dash-right-top">
                    <div className="notify">
                        <span><em className="notify-count">13</em><b>New </b>messages</span>
                    </div>
                    <div className="configure-right">
                        <div className="configure-cover">
                            <Link to="/dashboard/configure">
                                <div className="configure">
                                    <img src={this.siteURL + "/static/images/configure-icon.png"} className="configure-img" />
                                    <img src={this.siteURL + "/static/images/configure-icon-ho.png"} className="configure-ho-img" />
                                    <span>Configure</span>
                                </div>
                            </Link>
                        </div>
                        <span className="left-trial-text"><b>29 Days</b> left in trial</span>
                        <a className="btn ripple-effect btn-danger" href="javascript:void(0)">BUY NOW</a>
                    </div>
                </div>
                <div className="mt30">
                    {
                        this.state.widgets.length > 0 ?
                            <AbsoluteGrid
                                items={this.state.widgets}
                                responsive={true}
                                displayObject={<WidgetContainer hideWidget={this.hideWidget} />}
                                onMove={this.onMoveDebounced}
                                dragEnabled={true}
                                verticalMargin={90}
                                itemWidth={400}
                                ref="AbsoluteGrid"
                                onDragEnd={this.onDragEnd} />

                            : <div className="stock-list">
                                <div className="stock-list-cover"><h3>No widgets configured or available to display.</h3></div></div>
                    }
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

export default Home;