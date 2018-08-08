'use strict';

/**************************
 * Display page for setup breed type
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import { deleteBreedType as deleteBreedTypeRecords } from '../../../../services/private/setup';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class BreedTypeDisplay extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Breed Type Id', visible: false },
                { field: 'AuditLogId', isKey: false, isSort: false, displayName: 'AuditLog Id', visible: false },
                { field: 'BreedTypeCode', displayName: 'Breed Type Code', isKey: false, visible: true },
                { field: 'BreedTypeName', displayName: 'Breed Type Name', isKey: false, visible: true },
                { field: 'SystemCode', displayName: 'System Code', isKey: false, visible: true }
            ],
            functionName: 'breedtype/getdataset'
        }

        this.strings = this.props.strings;
        this.deleteBreedTypeClick = this.deleteBreedTypeClick.bind(this);
        this.deleteBreedType = this.deleteBreedType.bind(this);
        this.modifyBreedType = this.modifyBreedType.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }

        this.refs.breedTypeGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Perform delete operation for selected breed type
    deleteBreedType() {
        this.props.hideConfirmPopup();
        let selectedRows = this.refs.breedTypeGrid.selectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.UUID);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteBreedTypeRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.refs.breedTypeGrid.refreshDatasource();
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: (_this.strings.DELETE_SUCCESS).replace('{{deletedCount}}', res.deletedCount).replace('{{totalCount}}', res.totalCount) });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Open delete breed type confirmation popup
    deleteBreedTypeClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.breedTypeGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteBreedType
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected breed type
    modifyBreedType() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.breedTypeGrid.selectedRows.length, true, true)) {
            browserHistory.push('/adminsetup/breedtype/' + this.refs.breedTypeGrid.selectedRows[0].UUID);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.breedTypeGrid.cleanSelected();
    }

    // Render breed type grid
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
                                                <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/adminsetup/breedtype/new')}> {this.strings.CONTROLS.NEW_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.modifyBreedType}> {this.strings.CONTROLS.MODIFY_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.deleteBreedTypeClick}> {this.strings.CONTROLS.DELETE_LABEL}</a></li>
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
                                <Grid ref="breedTypeGrid" {...this.state} />
                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default BreedTypeDisplay;