'use strict';

/**************************
 * Display page for setup chemical product
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../../lib/core-components/Button';
import { deleteChemicalProduct as deleteChemicalProductRecords } from '../../../../../services/private/setup';
import { gridActionNotify } from '../../../../../lib/wrapper-components/FormActions';
import { connect } from 'react-redux';
import { openConfirmPopup, hideConfirmPopup } from '../../../../common/actions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';

class ChemicalProductDisplay extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'ChemicalProduct Id', visible: false },
                { field: 'AuditLogId', isKey: false, isSort: false, displayName: 'AuditLog Id', visible: false },
                { field: 'Name', displayName: 'Chemical Product Name', visible: true },
                { field: 'Code', displayName: 'Chemical Product Code', visible: true },
                { field: 'StockOnHand', displayName: 'Stock On Hand', visible: true }
            ],
            functionName: 'chemicalproduct/getdataset'
        }

        this.notify = this.props.notifyToaster;
        this.strings = this.props.strings;
        this.deleteChemicalProductClick = this.deleteChemicalProductClick.bind(this);
        this.deleteChemicalProduct = this.deleteChemicalProduct.bind(this);
        this.modifyChemicalProduct = this.modifyChemicalProduct.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.chemicalproductGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Perform delete operation for selected chemical product
    deleteChemicalProduct() {
        this.props.hideConfirmPopup();
        let selectedRows = this.refs.chemicalproductGrid.selectedRows;
        let uuids = [];
        let auditLogIds = [];
        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteChemicalProductRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.notify(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.refs.chemicalproductGrid.refreshDatasource();
            }
            else if (res.badRequest) {
                _this.notify(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Open delete chemical product confirmation popup
    deleteChemicalProductClick() {
        if (gridActionNotify(this.strings, this.notify, this.refs.chemicalproductGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteChemicalProduct
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected chemical product
    modifyChemicalProduct() {
        if (gridActionNotify(this.strings, this.notify, this.refs.chemicalproductGrid.selectedRows.length, true, true)) {
            browserHistory.push('/setup/chemicalproduct/' + this.refs.chemicalproductGrid.selectedRows[0].Id);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.chemicalproductGrid.cleanSelected();
    }

    // Render chemical product grid
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
                                                <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/setup/chemicalproduct/new')}> {this.strings.CONTROLS.NEW_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.modifyChemicalProduct}> {this.strings.CONTROLS.MODIFY_LABEL}</a></li>
                                                <li><a href="javascript:void(0)" onClick={this.deleteChemicalProductClick}> {this.strings.CONTROLS.DELETE_LABEL}</a></li>
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
                                    <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.CONTROLS.HELP_LABEL}</a>
                                </div>
                                <div className="clear"></div>
                                <Grid ref="chemicalproductGrid" {...this.state} />
                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        topSearch: state.header.topSearch
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        openConfirmPopup: (info) => {
            dispatch(openConfirmPopup(info))
        },
        hideConfirmPopup: (info) => {
            dispatch(hideConfirmPopup(info))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChemicalProductDisplay);