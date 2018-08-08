'use strict';

/**************************
 * Display page for setup chemical category
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import { deleteChemicalCategory as deleteChemicalCategoryRecords } from '../../../../services/private/setup';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class ChemicalCategoryDisplay extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Chemical Category Id', visible: false },
                { field: 'AuditLogId', isKey: false, isSort: false, displayName: 'AuditLog Id', visible: false },
                { field: 'ChemicalCategoryCode', displayName: 'Chemical Category Code', isKey: false, visible: true },
                { field: 'ChemicalCategoryName', displayName: 'Chemical Category Name', isKey: false, visible: true },
                { field: 'SystemCode', displayName: 'System Code', isKey: false, visible: true }
            ],
            functionName: 'chemicalcategory/getdataset'
        }

        this.strings = this.props.strings;
        this.deleteChemicalCategoryClick = this.deleteChemicalCategoryClick.bind(this);
        this.deleteChemicalCategory = this.deleteChemicalCategory.bind(this);
        this.modifyChemicalCategory = this.modifyChemicalCategory.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }

        this.refs.chemicalCategoryGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Perform delete operation for selected chemical category
    deleteChemicalCategory() {
        this.props.hideConfirmPopup();
        let selectedRows = this.refs.chemicalCategoryGrid.selectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteChemicalCategoryRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.refs.chemicalCategoryGrid.refreshDatasource();
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Open delete chemical category confirmation popup
    deleteChemicalCategoryClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.chemicalCategoryGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteChemicalCategory
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected chemical category
    modifyChemicalCategory() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.chemicalCategoryGrid.selectedRows.length, true, true)) {
            browserHistory.push('/adminsetup/chemicalcategory/' + this.refs.chemicalCategoryGrid.selectedRows[0].Id);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.chemicalCategoryGrid.cleanSelected();
    }

    // Render chemical category grid
    render() {
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
                                                <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/adminsetup/chemicalcategory/new')}> {this.strings.CONTROLS.NEW_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.modifyChemicalCategory}> {this.strings.CONTROLS.MODIFY_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.deleteChemicalCategoryClick}> {this.strings.CONTROLS.DELETE_LABEL}</a></li>
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
                                <Grid ref="chemicalCategoryGrid" {...this.state} />
                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>

            </div>
        );
    }
}

export default ChemicalCategoryDisplay;