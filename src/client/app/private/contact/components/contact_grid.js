'use strict';

/**************************
 * Display page for contact
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { uniqBy as _uniqBy } from 'lodash';

import SetPassword from './set_password';
import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import Dropdown from '../../../../lib/core-components/Dropdown';
import CompanyHierarchy from '../../../common/companyhierarchy/index';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { getAllState } from '../../../../services/private/setup';
import { deleteContactRecords, getAllContactDataset } from '../../../../services/private/contact';
import { formatDateTime } from '../../../../../shared/format/date';

class ContactGrid extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.selectedId = null;
        this.filterSchema = ['stateFilter', 'isPrivate', 'isActive']

        this.state = {
            columns: [
                { field: 'Id', isKey: true, displayName: 'Contact Id' },
                { field: 'Id', width: '35px', isSort: false, displayName: '', isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'AuditLogId', displayName: 'AuditLog Id' },
                { field: 'Name', displayName: 'Name', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Email', displayName: 'Email', visible: true },
                { field: 'Mobile', displayName: 'Mobile No', visible: true },
                { field: 'UserName', displayName: 'User Name', visible: true },
                { field: 'IsActive', displayName: 'Active', visible: true, format: 'activecolformat' }
            ],
            subColumns: [
                { field: 'UUID', isKey: true, isSort: false, displayName: 'Property Id' },
                { field: 'PIC', displayName: 'PIC', visible: true },
                { field: 'Name', displayName: 'Property Name', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Role', displayName: 'Role', visible: true },
                { field: 'ValidFromDate', displayName: 'ValidFromDate' },
                { field: 'ValidToDate', displayName: 'ValidToDate' },
                { field: '', displayName: 'Period', visible: true, formatter: this.formatPeriod },
            ],
            displayFilter: false,
            isClicked: false,
            stateFilterData: [],
            filterObj: {
                companyId: this.props.companyId ||
                (this.props.hierarchyProps.isSiteAdmin == 0 ? this.props.hierarchyProps.companyId : undefined)
            },
            clearKey: new Date(),
            openSetPassword: false,
            selectedData: []
        }

        this.strings = this.props.strings;
        //this.deleteContactClick = this.deleteContactClick.bind(this);
        this.deleteContact = this.deleteContact.bind(this);
        //this.modifyContact = this.modifyContact.bind(this);

        this.rowClickId = [];
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleSetPassword = this.toggleSetPassword.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.rowSelect = this.rowSelect.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        
        if (nextProps.topSearch == undefined)
            return;
        this.refs.contactGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getAllState().then(function (res) {
            if (res.success) {
                _this.stateSet({ stateFilterData: res.data })
            }
        })
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Perform delete operation for selected contact
    deleteContact() {
        this.props.hideConfirmPopup();

        let selectedRows = this.state.selectedData;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteContactRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.props.toggleButtonText(false);
                _this.refs.contactGrid.onSelectAll(false, []);
                _this.refs.contactGrid.refreshDatasource();
                _this.setState({ selectedData: [] });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // apply filter on grid data
    applyFilter() {
        
        let obj = getForm(this.filterSchema, this.refs);
        let hierarchyValues = this.refs.hierarchy.getValues();
        let filterObj = {};
        obj.stateFilter ? filterObj['st.Id'] = obj.stateFilter : null;
        this.refs.isPrivate.fieldStatus.dirty ? filterObj['c.IsPrivate'] = (obj.isPrivate ? 1 : 0) : null;
        this.refs.isActive.fieldStatus.dirty ? filterObj['c.IsActive'] = (obj.isActive ? 1 : 0) : null;
        if (hierarchyValues) {
            hierarchyValues.companyId ? filterObj['c.CompanyId'] = hierarchyValues.companyId : null;
            hierarchyValues.regionId ? filterObj['RegionId'] = hierarchyValues.regionId : null;
            hierarchyValues.businessId ? filterObj['BusinessId'] = hierarchyValues.businessId : null;
        }
        if (Object.keys(filterObj).length < 1)
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
        else {
            this.refs.contactGrid.onSelectAll(false, []);
            this.props.toggleButtonText(false);
            this.stateSet({ filterObj: filterObj, selectedData: [] });
        }
    }

    // clear filter on grid data and display all data
    clearFilter() {
        this.refs.contactGrid.onSelectAll(false, []);
        this.props.toggleButtonText(false);
        this.stateSet({
            clearKey: new Date(), selectedData: [], filterObj: {
                companyId: this.props.companyId ||
                (this.props.hierarchyProps.isSiteAdmin == 0 ? this.props.hierarchyProps.companyId : undefined)
            }
        });
    }

    toggleSetPassword(isOpen) {
        if (!isOpen) {
            this.refs.contactGrid.onSelectAll(false, []);
            this.props.toggleButtonText(false);
            this.setState({ openSetPassword: isOpen, selectedData: [] });
        }
        else {
            if (gridActionNotify(this.strings, this.props.notifyToaster, this.state.selectedData.length, true, true)) {
                this.selectedId = this.state.selectedData[0].Id;
                this.setState({ openSetPassword: isOpen });
            }
        }
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
        let displayFilter = this.state.displayFilter;
        this.setState({ displayFilter: !displayFilter });
    }

    // toggle selection of grid rows
    toggleSelection() {
        let selectAll = !this.props.selectAll;
        if (selectAll) {
            let _this = this;
            getAllContactDataset(this.state.filterObj).then(function (res) {
                if (res.success) {
                    _this.refs.contactGrid.onSelectAll(selectAll, []);
                    _this.props.toggleButtonText(selectAll);
                    _this.stateSet({ selectedData: res.data });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.refs.contactGrid.onSelectAll(selectAll, []);
            this.props.toggleButtonText(selectAll);
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
            functionName: 'user/accessiblepics',
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

    renderContent(strings) {
        let gridProps = {
            ...this.state,
            functionName: 'contact/getdataset',
            expandBy: 'column',
            clickToExpand: true,
            formatter: this.expander,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            columnVisible: true,

            // Settings for handle Select All button
            selectAll: this.props.selectAll,
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
                    <Grid ref="contactGrid" {...gridProps} />
                </div>
                {this.renderFilter(strings)}
            </div>
        </div>);
    }

    renderFilter(strings) {
        return (
            <div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
                key={this.state.clearKey}>
                <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                    {strings.FILTER_LABEL}
                    <div className="f-close" onClick={this.toggleFilter}>
                        <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                    </div>
                </h2>
                <CompanyHierarchy
                    inputProps={{
                        id: this.props.companyId || null,
                        name: null,
                        type: this.props.companyId ? 'C' : null
                    }}
                    {...this.props.hierarchyProps}
                    companyDisabled={this.props.companyId ? true : false}
                    propertyVisible={false} companyReq={false} businessReq={false}
                    isClicked={this.state.isClicked} strings={{ ...strings.COMMON }} ref="hierarchy" />
                <div className="livestoct-status">
                    <div className="form-group">
                        <Dropdown inputProps={{
                            name: 'stateFilter',
                            hintText: strings.CONTROLS.FILTER_STATE_LABEL,
                            floatingLabelText: strings.CONTROLS.FILTER_STATE_PLACEHOLDER,
                            value: this.state.filterObj.stateId ? this.state.filterObj.stateId : null
                        }}
                            textField="StateName" valueField="Id" dataSource={this.state.stateFilterData}
                            isClicked={this.state.isClicked} ref="stateFilter" />
                    </div>
                </div>
                <div className="livestoct-status">
                    <div className="form-group">
                        <ToggleSwitch inputProps={{
                            label: strings.CONTROLS.FILTER_PRIVATE_LABEL,
                            labelPosition: "right",
                            name: 'isPrivate',
                            defaultToggled: this.state.filterObj.isPrivate ? this.state.filterObj.isPrivate : false,
                            style: { float: 'left', width: '50%' }
                        }}
                            isClicked={this.state.isClicked} ref="isPrivate" />
                        <ToggleSwitch inputProps={{
                            label: strings.CONTROLS.FILTER_ACTIVE_LABEL,
                            labelPosition: "right",
                            name: 'isActive',
                            defaultToggled: this.state.filterObj.isActive ? this.state.filterObj.isActive : false,
                            style: { width: '50%' }
                        }}
                            isClicked={this.state.isClicked} ref="isActive" />
                    </div>
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
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderContent(this.strings)}
                <div className="clear"></div>
                {this.state.openSetPassword ?
                    <SetPassword
                        notifyToaster={this.props.notifyToaster}
                        strings={{ ...this.strings.SET_PASSWORD, COMMON: this.strings.COMMON }}
                        toggleSetPassword={this.toggleSetPassword} selectedId={this.selectedId} />
                    : null}
            </div>
        );
    }
}

export default ContactGrid;