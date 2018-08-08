'use strict';

/**************************
 * Display page for property
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { uniqBy as _uniqBy } from 'lodash';

import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';

import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { handleExpander } from '../../../../lib/index';
import { hexToRgba } from '../../../../../shared/index';

import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { getPropertyFilterData, deletePropertyRecords, getAllProperty } from '../../../../services/private/property';

class DisplayGrid extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.companyId = this.props.companyId || (this.props.hierarchyProps.isSiteAdmin == 0 ? this.props.hierarchyProps.companyId : null);
        this.state = {
            columns: [
                { field: 'Id', isKey: true, displayName: 'Property Id' },
                { field: 'Id', width: '35px', isSort: false, displayName: '', isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'PIC', displayName: 'PIC', visible: true, formatter: this.fenceFormat.bind(this) },
                { field: 'Name', displayName: 'Name', visible: true },
                { field: 'PropertyManager', displayName: 'Manager', visible: true, formatter: this.concatManager },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'CompanyName', displayName: 'Company', visible: true, format: 'emptyFormat' },
                { field: 'RegionName', displayName: 'Region', visible: true, format: 'emptyFormat' },
                { field: 'BusinessName', displayName: 'Business', visible: true, format: 'emptyFormat' }
            ],
            subColumns: [
                { field: 'Id', isKey: true, displayName: 'Id' },
                { field: 'Name', displayName: 'Name', visible: true, formatter: this.fenceFormat.bind(this) },
                { field: 'EnclosureTypeName', displayName: 'Type', visible: true }
            ],
            displayFilter: false,
            isClicked: false,
            stateData: [],
            propertyTypeData: [],
            filterObj: { companyId: this.companyId },
            clearFilterKey: Math.random(),
            sortOrder: 'asc',
            sortColumn: 'PIC',
            selectedData: []
        }

        this.strings = this.props.strings;
        this.filterSchema = ['state', 'propertyType'];

        this.deleteProperty = this.deleteProperty.bind(this);

        this.rowClickId = [];
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.closeFilter = this.closeFilter.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.rowSelect = this.rowSelect.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // get filter data for property grid filtering
    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getPropertyFilterData().then(function (res) {
            if (res.success) {
                _this.stateSet({ stateData: res.data.state, propertyTypeData: res.data.propertyType });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // concate manager columns
    concatManager(cell, row) {
        let manager = row['PropertyManager'] ? row['PropertyManager'] + (row['AsstPropertyManager'] ? "<br />" + row['AsstPropertyManager'] : "") : "-";
        return "<div>" + manager + "</div>";
    }

    // display marker in PIC column
    fenceFormat(cell, row) {
        let fenceImg = "<img src='" + this.siteURL + "/static/images/map-marker.png' alt='Fence' style='margin-right:2px;'/>";

        if (row.PropertyFence != null) {
            let propertyFence = JSON.parse(row.PropertyFence);
            if (propertyFence.FenceCoordinate && propertyFence.FenceCoordinate.length > 0)
                return fenceImg + cell;
            else
                return "<span style='margin-right:18px;'></span> " + cell;
        }
        return "<span style='margin-right:18px;'></span> " + cell;
    }

    // Set row background color
    setBGColor(row) {
        let colorObj = JSON.parse(row["ColorCode"]);
        return hexToRgba(colorObj.color, colorObj.alpha);
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.propertyGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // Perform delete operation for selected property
    deleteProperty() {
        this.props.hideConfirmPopup();

        let selectedRows = this.state.selectedData;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deletePropertyRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.refs.propertyGrid.onSelectAll(false, []);
                _this.props.toggleButtonText(false);
                _this.refs.propertyGrid.refreshDatasource();
                _this.setState({ selectedData: [] });
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: (_this.strings.DELETE_SUCCESS).replace('{{deletedCount}}', res.deletedCount).replace('{{totalCount}}', res.totalCount) });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        });
    }

    // apply filter on grid data
    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);
        if (obj.state || obj.propertyType) {
            this.refs.propertyGrid.onSelectAll(false, []);
            this.props.toggleButtonText(false);
            this.stateSet({ filterObj: { ...obj, companyId: this.companyId }, selectedData: [] });
        }
        else
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
    }

    // clear filter on grid data and display all data
    clearFilter() {
        this.refs.propertyGrid.onSelectAll(false, []);
        this.props.toggleButtonText(false);
        this.stateSet({ clearFilterKey: Math.random(), filterObj: { companyId: this.companyId }, selectedData: [] });
    }

    closeFilter() {
        this.setState({ displayFilter: false })
    }

    // toggle selection of grid rows
    toggleSelection() {
        let selectAll = !this.props.selectAll;
        if (selectAll) {
            let _this = this;
            getAllProperty(this.state.filterObj).then(function (res) {
                if (res.success) {
                    _this.refs.propertyGrid.onSelectAll(selectAll, []);
                    _this.props.toggleButtonText(selectAll);
                    _this.stateSet({ selectedData: res.data });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.refs.propertyGrid.onSelectAll(selectAll, []);
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
            functionName: 'enclosure/getdataset',
            columns: this.state.subColumns,
            filterObj: row.Id
        }
        return (<Grid {...gridProps} />);
    }

    // Display expand/collapse icons
    expander(cell, row) {
        let expandClick = () => this.expandClick(cell);
        return handleExpander(cell, row, expandClick, this.rowClickId);
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

    // Render filter area for grid
    renderFilter() {
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.clearFilterKey}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={this.closeFilter}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>
            </h2>

            <div className="form-group">
                <Dropdown inputProps={{
                    name: 'propertyTypeFilter',
                    hintText: this.strings.CONTROLS.FILTER_PROPERTY_TYPE_LABEL,
                    floatingLabelText: this.strings.CONTROLS.FILTER_PROPERTY_TYPE_PLACEHOLDER,
                    value: this.state.filterObj.propertyTypeId ? this.state.filterObj.propertyTypeId : null
                }}
                    textField="Name" valueField="Id" dataSource={this.state.propertyTypeData}
                    isClicked={this.state.isClicked} ref="propertyType" />
            </div>

            <div className="form-group">
                <Dropdown inputProps={{
                    name: 'stateFilter',
                    hintText: this.strings.CONTROLS.FILTER_STATE_LABEL,
                    floatingLabelText: this.strings.CONTROLS.FILTER_STATE_PLACEHOLDER,
                    value: this.state.filterObj.stateId ? this.state.filterObj.stateId : null
                }}
                    textField="Name" valueField="Id" dataSource={this.state.stateData}
                    isClicked={this.state.isClicked} ref="state" />
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

    // Render component
    render() {
        let gridProps = {
            ...this.state,
            functionName: 'property/getdataset',
            expandBy: 'column',
            clickToExpand: true,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            columnVisible: true,
            setBGColor: this.setBGColor,

            // Settings for handle Select All button
            selectAll: this.props.selectAll,
            onRowSelect: this.rowSelect,
            selectedAllData: this.state.selectedData
        }

        return (<div className="stock-list">
            <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                <div className="livestock-content">
                    <div className="cattle-text">
                        <span>{this.strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    <Grid ref="propertyGrid" {...gridProps} />
                </div>
                {this.renderFilter()}
            </div>
        </div>);
    }

}

export default DisplayGrid;