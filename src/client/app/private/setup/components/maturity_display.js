'use strict';

/**************************
 * Display page for setup maturity
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import { deleteMaturity as deleteMaturityRecords } from '../../../../services/private/setup';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class MaturityDisplay extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Species Id', visible: false },
                { field: 'Id', width: '35px', isSort: false, displayName: '', isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'SpeciesNameCode', displayName: 'Species', isKey: false, visible: true }
            ],
            subColumns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Maturity Id' },
                { field: 'AuditLogId', isKey: false, isSort: false, displayName: 'AuditLog Id', visible: false },
                { field: 'MaturityCode', displayName: 'Maturity Code', visible: true },
                { field: 'MaturityName', displayName: 'Maturity Name', visible: true },
                { field: 'SystemCode', displayName: 'System Code', visible: true }
            ],
            refreshDetails: new Date()
        }

        this.strings = this.props.strings;
        this.deleteMaturityClick = this.deleteMaturityClick.bind(this);
        this.deleteMaturity = this.deleteMaturity.bind(this);
        this.modifyMaturity = this.modifyMaturity.bind(this);
        this.clearSelection = this.clearSelection.bind(this);

        this.rowClickId = [];
        this.detailSelectedRows = [];
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);
        this.onDetailRowSelect = this.onDetailRowSelect.bind(this);
        this.firstExpandFlag = true;
        this.autoExpandClick = this.autoExpandClick.bind(this);
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (this.props.searchText != nextProps.searchText) {
            this.refs.maturityGrid.onSearchChange(nextProps.searchText);
        }
    }

    // Perform delete operation for selected maturity
    deleteMaturity() {
        this.props.hideConfirmPopup();

        let selectedRows = this.detailSelectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteMaturityRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.refs.maturityGrid.refreshDatasource();
                _this.setState({ refreshDetails: new Date() });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Oopen delete maturity confirmation popup
    deleteMaturityClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.detailSelectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteMaturity
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected maturity
    modifyMaturity() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.detailSelectedRows.length, true, true)) {
            browserHistory.push('/adminsetup/maturity/' + this.detailSelectedRows[0].Id);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.maturityGrid.cleanSelected();
    }

    /*--------- Bind nested grid start --------------*/
    // Return for bind nested grid
    expandableRow(row) {
        return this.rowClickId.includes(row.Id);
    }

    // Bind nested grid
    expandComponent(row) {
        let gridProps = {
            maxHeight: "170px",
            functionName: 'maturity/detaildataset',
            columns: this.state.subColumns,
            filterObj: { SpeciesId: row.Id },
            onRowSelect: this.onDetailRowSelect
        }
        return (<Grid key={this.state.refreshDetails} {...gridProps} />);
    }

    // Display expand/collapse icons
    expander(cell, row) {
        let imgPath = this.siteURL + "/static/images/";
        let expandClick = () => this.expandClick(cell);
        return <div onClick={expandClick} ref={this.autoExpandClick}>
            <img src={this.rowClickId.includes(row.Id) ? imgPath + "collapse.png" : imgPath + "expand.png"} />
        </div>;
    }

    autoExpandClick(e) {
        if (this.firstExpandFlag) {
            e.click();
            this.firstExpandFlag = false;
        }
    }

    // Handle icons click by id
    expandClick(cell) {
        let index = this.rowClickId.indexOf(cell);
        if (index != -1)
            this.rowClickId.splice(index, 1);
        else
            this.rowClickId.push(cell);
    }

    onDetailRowSelect(detailSelectedRows) {
        this.detailSelectedRows = detailSelectedRows;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }

        this.refs.maturityGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    /*--------- Bind nested grid end --------------*/

    // Render maturity components
    render() {
        let gridProps = {
            ...this.state,
            selectRowMode: 'none',
            functionName: 'maturity/getdataset',
            expandBy: 'column',
            clickToExpand: true,
            formatter: this.expander,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent
        }

        return (
            <div>
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head setup-head"> <span>{this.strings.TITLE}</span> </div>
                        <div className="l-stock-top-btn setup-top">
                            <ul>
                                <li>
                                    <Button
                                        inputProps={{
                                            name: 'btnClear',
                                            label: this.strings.CONTROLS.CLEAR_LABEL,
                                            className: 'button3Style button30Style',
                                        }}
                                        onClick={this.clearSelection}
                                    ></Button>
                                </li>
                                <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                                    <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                    <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                        <li>
                                            <ul>
                                                <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/adminsetup/maturity/new')}> {this.strings.CONTROLS.NEW_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.modifyMaturity}> {this.strings.CONTROLS.MODIFY_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.deleteMaturityClick}> {this.strings.CONTROLS.DELETE_LABEL}</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="setup-main">
                    <div className="stock-list">
                        <div className="stock-list-cover">
                            <div className="livestock-content">
                                <div className="cattle-text">
                                    <span>{this.strings.DESCRIPTION}</span>
                                    <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.CONTROLS.HELP_LABEL}</a>
                                </div>
                                <div className="clear"></div>
                                <Grid ref="maturityGrid" {...gridProps} />
                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MaturityDisplay;