'use strict';

/**************************
 * Display page for setup dose by measure
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import { saveDoseByMeasure as saveDoseByMeasureData, getDoseByMeasure } from '../../../../services/private/setup';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { connect } from 'react-redux';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class DoseByMeasure extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Uom Id', visible: false },
                { field: 'UomCode', displayName: 'Unit of Measure Code', isKey: false, visible: true },
                { field: 'UomName', displayName: 'Unit of Measure Name', isKey: false, visible: true },
                { field: 'SystemCode', displayName: 'System Code', isKey: false, visible: true }
            ],
            functionName: 'uom/getdataset'
        }

        this.strings = this.props.strings;
        this.saveDoseByMeasure = this.saveDoseByMeasure.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.initialState = this.initialState.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.uomGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    componentDidMount() {
        this.initialState();
    }

    // set initial selected uom
    initialState() {
        let _this = this;
        return getDoseByMeasure(1).then(function (res) {
            if (res.success) {
                let selectedRow = [];
                let selectedObj = [];
                res.data.map((row) => {
                    selectedRow.push(row['uom.UUID']);
                    selectedObj.push({ Id: row['uom.UUID'] });
                });
                _this.refs.uomGrid.setSelected(selectedRow, selectedObj);
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Perform delete operation for selected Unit of Measure
    saveDoseByMeasure() {
        let selectedRows = this.refs.uomGrid.selectedRows;
        let uuids = [];
        //let auditLogIds = [];
        selectedRows.map(function (r) {
            uuids.push(r.Id);
        });

        let _this = this;
        return saveDoseByMeasureData(uuids, true).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                return false;
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Clear grid selection
    clearSelection() {
        this.initialState();
    }

    // Render Unit of Measure grid
    render() {
        return (
            <div>
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head setup-head"> <span>{this.strings.TITLE}</span> </div>
                        <div className="l-stock-top-btn setup-top">
                            <ul>
                                <li>
                                    <BusyButton
                                        inputProps={{
                                            name: 'btnAddNew',
                                            label: this.strings.CONTROLS.SAVE_LABEL,
                                            className: 'button1Style button30Style',
                                        }}
                                        loaderHeight={25}
                                        onClick={this.saveDoseByMeasure}
                                    ></BusyButton>
                                </li>
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
                                    <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                                </div>
                                <div className="clear"></div>
                                <Grid ref="uomGrid" {...this.state} />
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

export default connect(
    mapStateToProps,
    null
)(Decorator('SetupDoseByMeasere', DoseByMeasure));