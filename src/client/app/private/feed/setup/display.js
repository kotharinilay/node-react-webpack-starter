'use strict';

/**************************
 * Display page for feed
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';

import { deleteFeedStockComp } from '../../../../services/private/feed';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class Display extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            columns: [
                { field: 'Id', isKey: true },
                { field: 'Id', width: '35px', isSort: false, isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'Name', displayName: 'Name', visible: true },
                { field: 'AuditLogId', displayName: 'AuditLogId' }
            ], // Columns for feed grid
            subColumns: [
                { field: 'Id', isKey: true },
                { field: 'Name', displayName: 'Name', visible: true },
                { field: 'Value', displayName: 'Value', visible: true, format: 'percentageformat' }
            ] // Columns for feed composition grid
        }

        this.strings = this.props.strings;

        this.deleteFeedClick = this.deleteFeedClick.bind(this);
        this.deleteFeed = this.deleteFeed.bind(this);
        this.modifyFeed = this.modifyFeed.bind(this);
        this.clearSelection = this.clearSelection.bind(this);

        this.rowClickId = [];
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);
    }

    // Handle top search for main grid
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.feedGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Delete feed/feedcomposition/feedstock
    deleteFeed() {
        let selectedRows = this.refs.feedGrid.selectedRows;
        let uuids = [];
        let auditLogIds = [];
        let _this = this;
        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });
        this.props.hideConfirmPopup();

        deleteFeedStockComp(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.refs.feedGrid.refreshDatasource();
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Handle delete click to open confirmation popup
    deleteFeedClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.feedGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteFeed
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Handle click event to modify feed record
    modifyFeed() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.feedGrid.selectedRows.length, true, true)) {
            browserHistory.push('/feed/setup/' + this.refs.feedGrid.selectedRows[0].Id);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.feedGrid.cleanSelected();
    }

    /*--------- Bind nested grid start --------------*/

    // Return for bind nested grid
    expandableRow(row) {
        return this.rowClickId.includes(row.Id);
    }

    // Bind nested grid
    expandComponent(row) {
        let gridProps = {
            selectRowMode: 'none',
            maxHeight: "170px",
            functionName: 'feedcomposition/getdataset',
            columns: this.state.subColumns,
            filterObj: row.Id
        }
        return (<Grid {...gridProps} />);
    }

    // Display expand/collapse icons
    expander(cell, row) {
        let imgPath = this.siteURL + "/static/images/";
        let expandClick = () => this.expandClick(cell);
        return <div onClick={expandClick}>
            <img src={this.rowClickId.includes(row.Id) ? imgPath + "collapse.png" : imgPath + "expand.png"} />
        </div>;
    }

    // Handle icons click by id
    expandClick(cell) {
        let index = this.rowClickId.indexOf(cell);
        if (index != -1)
            this.rowClickId.splice(index, 1);
        else
            this.rowClickId.push(cell);
    }

    /*--------- Bind nested grid end --------------*/

    // Render header area of component
    renderHeader(strings) {
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{strings.TITLE}</span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnClear',
                                    label: this.strings.CONTROLS.CLEAR_LABEL,
                                    className: 'button3Style button30Style',
                                }}
                                onClick={this.clearSelection}>
                            </Button>
                        </li>

                        <li>
                            <a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                            <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                            <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                <li>
                                    <ul>
                                        <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/feed/setup/new')}> {this.strings.CONTROLS.NEW_LABEL}</a></li>
                                        <li><a href="javascript:void(0)" onClick={this.modifyFeed}> {this.strings.CONTROLS.MODIFY_LABEL}</a></li>
                                        <li><a href="javascript:void(0)" onClick={this.deleteFeedClick}> {this.strings.CONTROLS.DELETE_LABEL}</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>);
    }

    // Render content area of component
    renderContent(strings) {
        let gridProps = {
            ...this.state,
            functionName: 'feed/getdataset',
            ref: 'feedGrid',
            expandBy: 'column',
            clickToExpand: true,
            formatter: this.expander,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent
        }

        return (<div className="stock-list">
            <div className="stock-list-cover">
                <div className="livestock-content">
                    <div className="cattle-text">
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    <Grid {...gridProps} />
                </div>
            </div>
        </div>);
    }

    // Render component
    render() {
        let { strings } = this.props;
        return (
            <div className="dash-right">
                {this.renderHeader(strings)}
                <div className="clear"></div>
                {this.renderContent(strings)}
                <div className="clear"></div>
            </div>
        );
    }

}


export default Display;