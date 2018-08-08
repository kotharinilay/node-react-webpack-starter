'use strict';

/**************************
 * Display page for company
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { uniqBy as _uniqBy } from 'lodash';

import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import Multipicker from '../../../../lib/core-components/Multipicker';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { getAllServiceTypes } from '../../../../services/private/setup';
import { deleteCompanyRecords, getAllCompany } from '../../../../services/private/company';
import { formatDateTime } from '../../../../../shared/format/date';

class CompanyDisplay extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.selectedId = null;
        this.filterSchema = ['servicetype']
        this.objStock = {}
        this.state = {
            columns: [
                { field: 'Id', isKey: true, displayName: 'Company Id' },
                { field: 'AuditLogId', displayName: 'AuditLog Id' },
                { field: 'Name', width: "150px", displayName: 'Company Name', visible: true },
                { field: 'Address', width: "150px", displayName: 'Address', visible: true },
                { field: 'ServiceType', width: "160px", displayName: 'Service Types', visible: true },
                { field: 'Mobile', width: "150px", displayName: 'Mobile', visible: true },
                { field: 'Email', width: "150px", displayName: 'Email', visible: true },
                { field: 'ABN', width: "100px", displayName: 'ABN', visible: true },
                { field: 'ACN', width: "100px", displayName: 'ACN', visible: true },
                { field: 'ValidFromDate', width: "230px", displayName: 'Subscription Start Date', visible: true, format: 'dateformat' },
                { field: 'ValidToDate', width: "230px", displayName: 'Subscription End Date', visible: true, format: 'dateformat' }
            ],
            displayFilter: false,
            isClicked: false,
            serviceTypeFilterData: [],
            filterObj: {},
            clearKey: new Date(),
            selectAll: false,
            selectedData: []
        }

        this.notify = this.props.notify;
        this.strings = this.props.strings;
        this.deleteCompanyClick = this.deleteCompanyClick.bind(this);
        this.deleteCompany = this.deleteCompany.bind(this);
        this.modifyCompany = this.modifyCompany.bind(this);

        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);

        this.rowSelect = this.rowSelect.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getAllServiceTypes().then(function (res) {
            if (res.success) {
                _this.stateSet({ serviceTypeFilterData: res.data })
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        })
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.companyGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Perform delete operation for selected company
    deleteCompany() {
        this.props.hideConfirmPopup();

        let selectedRows = this.state.selectedData;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteCompanyRecords(uuids, auditLogIds, 'C').then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.refs.companyGrid.refreshDatasource();
                _this.refs.contactGrid.onSelectAll(false, []);
                _this.stateSet({ selectedData: [], selectAll: false });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Open delete company confirmation popup
    deleteCompanyClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.state.selectedData.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteCompany
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected company
    modifyCompany() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.state.selectedData.length, true, true)) {
            browserHistory.push('/company/' + this.state.selectedData[0].Id);
        }
    }

    // toggle selection of grid rows
    toggleSelection() {
        let selectAll = !this.state.selectAll;
        if (selectAll) {
            let _this = this;
            getAllCompany(this.state.filterObj).then(function (res) {
                if (res.success) {
                    _this.refs.companyGrid.onSelectAll(selectAll, []);
                    _this.stateSet({ selectedData: res.data, selectAll: selectAll });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.refs.companyGrid.onSelectAll(selectAll, []);
            this.stateSet({ selectedData: [], selectAll: selectAll });
        }
    }

    // Handle grid selection
    rowSelect(selectedRow, row, isSelected) {
        let selectedData = [...this.state.selectedData];
        if (row.Id) {
            if (isSelected) {
                let obj = selectedData.find(r => r.Id == row.Id);
                if (!obj)
                    selectedData.push(row);
            }
            else
                selectedData = selectedData.filter(r => r.Id != row.Id);
        } else {
            if (isSelected)
                row.map(r => selectedData.push(r));
            else {
                row.map(r => {
                    let objIndex = selectedData.findIndex(x => x.Id == r.Id);
                    if (objIndex != -1)
                        selectedData.splice(objIndex, 1);
                });
            }
        }

        selectedData = _uniqBy(selectedData, 'Id');
        if (selectedData.length == 0)
            this.stateSet({ selectedData: [], selectAll: false });
        else
            this.stateSet({ selectedData: selectedData });
    }

    // apply filter on grid data
    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);
        let filterObj = {};
        obj.servicetype.length > 0 ? filterObj['ServiceTypeId'] = obj.servicetype : null;
        this.refs.companyGrid.onSelectAll(false, []);
        this.stateSet({ filterObj: filterObj, selectedData: [], selectAll: false });
    }

    // clear filter on grid data and display all data
    clearFilter() {
        this.refs.companyGrid.onSelectAll(false, []);
        this.stateSet({ clearKey: new Date(), filterObj: {}, selectedData: [], selectAll: false });
    }

    formatPeriod(cell, row) {
        if (row.ValidFromDate && row.ValidToDate) {
            let fromDate = formatDateTime(row.ValidFromDate).ShortDate;
            let toDate = formatDateTime(row.ValidToDate).ShortDate;
            return `${fromDate} to ${toDate}`;
        }
        return '';
    }

    toggleFilter() {
        let filterState = this.state.displayFilter;
        this.setState({ displayFilter: !filterState })
    }

    renderHeader(strings) {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{strings.TITLE}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnAddNew',
                                        label: strings.CONTROLS.FILTER_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.toggleFilter}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnSelectAll',
                                        label: this.state.selectAll == false ? this.strings.COMMON.SELECT_ALL : this.strings.COMMON.CLEAR,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.toggleSelection}
                                ></Button>
                            </li>
                            <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{strings.CONTROLS.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)"
                                                onClick={() => browserHistory.replace('/company/new')}>
                                                {strings.CONTROLS.NEW_COMPANY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyCompany}>
                                                {strings.CONTROLS.MODIFY_COMPANY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.deleteCompanyClick}>
                                                {strings.CONTROLS.DELETE_COMPANY}</a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </div>
                </div>
            </div >);
    }

    renderContent(strings) {
        let gridProps = {
            ...this.state,
            functionName: 'company/getdataset',
            columnVisible: true,

            // Settings for handle Select All button
            selectAll: this.state.selectAll,
            onRowSelect: this.rowSelect,
            selectedAllData: this.state.selectedData
        }

        return (<div className="stock-list">
            <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                <div className="livestock-content">
                    <div className="cattle-text">
                        <span>{strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    <Grid ref="companyGrid" {...gridProps} />
                </div>

                <div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
                    key={this.state.clearKey}>
                    <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                        {strings.FILTER_TITLE}
                        <div className="f-close" onClick={this.toggleFilter}>
                            <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                        </div>
                    </h2>
                    <div className="full-width livestoct-status">
                        <div className="form-group">
                            <Multipicker inputProps={{
                                name: 'servicetype',
                                placeholder: strings.CONTROLS.FILTER_SERVICE_TYPE_PLACEHOLDER,
                                defaultValue: []
                            }}
                                textField="NameCode" valueField="Id"
                                dataSource={this.state.serviceTypeFilterData}
                                isClicked={this.state.isClicked} ref="servicetype" />
                        </div>
                    </div>
                    <div className="f-btn">
                        <a onClick={this.applyFilter} className="ripple-effect filter-btn">
                            {strings.CONTROLS.APPLY_FILTER_LABEL}
                        </a>
                    </div>
                    <div className="f-btn">
                        <a onClick={this.clearFilter} className="ripple-effect filter-btn">
                            {strings.CONTROLS.CLEAR_FILTER_LABEL}
                        </a>
                    </div>
                </div>
            </div>
        </div>);
    }

    // Render company components
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
}

export default CompanyDisplay;