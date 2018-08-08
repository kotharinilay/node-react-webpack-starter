'use strict';

/***********************************
 * Grid Component
 * displays grid with passed specific schema 
 * with server rendering
 * *********************************/

import React, { Component } from 'react';
import Render from 'react-dom';
import { map, find } from 'lodash';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getGridData } from '../../services/private/common';
import { formatDateTime, calculateAge, getMonthName } from '../../../shared/format/date';
import { digitDecimal } from '../../../shared/format/number';

import LoadingIndicator from '../core-components/LoadingIndicator';

import ColumnVisible from './ColumnVisible'

let initialState = (props) => {
    return {
        results: [],
        currentPage: 1,
        isLoading: false,
        externalResultsPerPage: props.pageSize,
        externalSortColumn: props.sortColumn || null,
        externalSortAscending: props.sortOrder || 'asc',
        searchText: props.searchText || null,
        totalDataSize: 0,
        filter: {},
        columns: props.columns,
        selected: props.selected || [],
        unselectable: props.unselectable || []
    }
};

class Grid extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.state = initialState(this.props);
        this.selectedRows = this.props.selectedRows || [];

        this.onPageChange = this.onPageChange.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onExportToCSV = this.onExportToCSV.bind(this);
        this.onRowSelect = this.onRowSelect.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.cleanSelected = this.cleanSelected.bind(this);
        this.setSelected = this.setSelected.bind(this);
        this.actionFormatter = this.actionFormatter.bind(this);
        this.deleteFormatter = this.deleteFormatter.bind(this);
        this.linkFormatter = this.linkFormatter.bind(this);
        this.selectFormatter = this.selectFormatter.bind(this);
        this.activeColFormatter = this.activeColFormatter.bind(this);
        this.ageFormatter = this.ageFormatter.bind(this);
        this.weightFormatter = this.weightFormatter.bind(this);
        this.updateSelectedIds = this.updateSelectedIds.bind(this);
        this.setBGColor = this.setBGColor.bind(this);
        this.expandColumnComponent = this.expandColumnComponent.bind(this);
        this.primaryColumn = this.props.columns.filter((column) => {
            return column.isKey;
        });

        this.primaryField = this.primaryColumn[0].field;
    }

    componentWillReceiveProps(nextProps) {
        // It will be used in company species
        if (this.props.selected && nextProps.selected && this.props.selected.length != nextProps.selected.length ||
            this.props.unselectable && nextProps.unselectable && this.props.unselectable.length != nextProps.unselectable.length) {
            this.setState({ selected: nextProps.selected || [], unselectable: nextProps.unselectable || [] });
        }
        if (this.props.selectedRows && nextProps.selectedRows && this.props.selectedRows.length != nextProps.selectedRows.length) {
            this.selectedRows = nextProps.selectedRows;
        }
        if (JSON.stringify(this.props.filterObj) != JSON.stringify(nextProps.filterObj)) {
            this.destroyState(nextProps);
        }
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.filterObj) != JSON.stringify(this.props.filterObj)) {
            this.refreshDatasource();
        }
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    columnFormates(name) {
        switch (name.toLowerCase()) {
            case 'imageformat':
                return this.imageFormatter;
            case 'emptyformat':
                return this.emptyFormatter;
            case 'actionformat':
                return this.actionFormatter;
            case 'deleteformat':
                return this.deleteFormatter;
            case 'linkformat':
                return this.linkFormatter;
            case 'dateformat':
                return this.dateFormatter;
            case 'datetimeformat':
                return this.datetimeFormatter;
            case 'percentageformat':
                return this.percentageFormatter;
            case 'currencyformat':
                return this.currencyFormatter;
            case 'qtyformat':
                return this.qtyFormatter;
            case 'decimalformat':
                return this.decimalFormatter;
            case 'selectformat':
                return this.selectFormatter;
            case 'activecolformat':
                return this.activeColFormatter;
            case 'ageformat':
                return this.ageFormatter;
            case 'weightformat':
                return this.weightFormatter;
            case 'booleanformat':
                return this.booleanFormatter;
            case 'monthformat':
                return this.monthFormatter;
        }
    }

    monthFormatter(cell, row) {
        if (cell == 0)
            return 'Not known';
        else
            return getMonthName(cell);

    }

    booleanFormatter(cell, row) {
        if (cell == 1)
            return 'Yes'
        else
            return 'No';
    }

    ageFormatter(cell, row) {
        return cell ? calculateAge(cell) + ' Years' : "";
    }

    weightFormatter(cell, row) {
        return cell ? cell + ' KG' : "";
    }

    imageFormatter(cell, row) {
        return "<img src='" + cell + "'/>";
    }

    emptyFormatter(cell, row) {
        return cell || "-";
    }

    actionFormatter(cell, row) {
        let editClick = () => this.props.editClick(cell);
        let deleteClick = () => this.props.deleteClick(cell);
        return (<div>
            <div className="edit-del-icon">
                <span onClick={editClick}>
                    <img src={this.siteURL + "/static/images/edit-icon.png"} alt="edit-icon" title="Edit" />
                </span>
                <span onClick={deleteClick}>
                    <img src={this.siteURL + "/static/images/delete-icon.png"} alt="delete-icon" title="Delete" />
                </span>
            </div>
        </div>);
    }

    activeColFormatter(cell, row) {
        if (cell == 1) {
            return (<div>
                <div className="active-icon">
                    <span>
                        {/*<img src={this.siteURL + "/static/images/check-box-bg2.png"} alt="active" title="Active" />*/}
                        <input type="checkbox" checked disabled />
                    </span>
                </div>
            </div>);
        }
        else {
            return (<div>
                <div className="inactive-icon">
                    <span>
                        <input type="checkbox" disabled />
                    </span>
                </div>
            </div>);
        }
    }

    selectFormatter(cell, row) {
        let selectClick = () => this.props.selectClick(row);
        return (
            <span onClick={selectClick} style={{ cursor: 'pointer' }}>
                <img src={this.siteURL + "/static/images/edit-icon.png"} alt="edit-icon" title="Edit" />
            </span>
        );
    }

    deleteFormatter(cell, row) {
        let deleteClick = () => this.props.deleteClick(cell);
        return (
            <span onClick={deleteClick} style={{ cursor: 'pointer' }}>
                <img src={this.siteURL + "/static/images/delete-icon.png"} alt="delete-icon" title="Delete" />
            </span>);
    }

    linkFormatter(cell, row) {
        let editClick = () => this.props.editClick(cell);
        return (<div style={{ cursor: 'pointer' }} onClick={editClick} > {cell}</div>);
    }

    dateFormatter(cell, row) {
        if (cell)
            return '<span>' + formatDateTime(cell).ShortDate + '</span>';
        else
            return '<span></span>';
    }

    datetimeFormatter(cell, row) {
        return cell ? '<span>' + formatDateTime(cell).DateTime + '</span>' : null;
    }

    percentageFormatter(cell, row) {
        return digitDecimal(cell) + '%';
    }

    currencyFormatter(cell, row) {
        return '$' + digitDecimal(cell);
    }

    qtyFormatter(cell, row) {
        return digitDecimal(cell) + ' Tonne';
    }

    decimalFormatter(cell, row) {
        return digitDecimal(cell);
    }

    bindColumns() {
        return (this.state.columns.map(column => {
            return <TableHeaderColumn hidden={!column.visible}
                dataField={column.field}
                key={column.field}
                width={column.width}
                isKey={column.isKey}
                dataSort={column.isSort === undefined ? true : false}
                expandable={column.isExpand ? true : false}
                dataFormat={column.formatter ? column.formatter : (column.format ? this.columnFormates(column.format) : undefined)}
                tdAttr={column.isExpand ? { 'className': 'expander-style' } : null}
                filter={column.filter}
                editable={column.editable}
                dataAlign={column.dataAlign == undefined ? 'left' : column.dataAlign}>
                {column.displayName}
            </TableHeaderColumn>
        }
        ));
    }

    columnVisibleChnage(field, value) {
        let fieldObj = find(this.state.columns, column => column.field == field);
        fieldObj.visible = value;
        this.setState({
            columns: this.state.columns
        });
    }

    destroyState(nextProps) {
        let state = initialState(nextProps);
        this.setState({ ...state });
    }

    refreshDatasource() {
        this.cleanSelected();
        this.getExternalData(this.state.externalResultsPerPage, this.state.currentPage, this.state.externalSortColumn,
            this.state.externalSortAscending, this.state.searchText, this.props.filterObj);
    }

    getExternalData(pageSize, page, sortColumn, sortOrder, search, filterObj) {
        var that = this;
        pageSize = pageSize || 10;
        page = page || 1;
        search == ""
            ? null
            : search;
        sortOrder = sortOrder || 'desc';
        this.setState({ isLoading: true });
        getGridData(pageSize, page, sortColumn, sortOrder, search, this.props.functionName, this.props.filterObj).then(function (data) {
            that.stateSet({
                results: data.data ? data.data : [],
                currentPage: page,
                isLoading: false,
                externalResultsPerPage: pageSize,
                externalSortColumn: sortColumn,
                externalSortAscending: sortOrder,
                searchText: search,
                totalDataSize: data.total ? data.total : 0,
                filter: filterObj
            });

            if (that.props.getExternalData) {
                that.props.getExternalData(data);
            }

            if (that.props.selectAll) {
                let selectedData = [];
                data.data.map(d => {
                    let obj = that.props.selectedAllData.find(x => x.Id == d.Id);
                    if (obj)
                        selectedData.push(d);
                });
                that.onSelectAll(true, selectedData, true);
            }
        });
    }

    componentDidMount() {
        if (this.props.isRemoteData)
            this.getExternalData(this.state.externalResultsPerPage, this.state.currentPage, this.state.externalSortColumn, this.state.externalSortAscending, this.state.searchText);
    }

    onPageChange(page, sizePerPage) {
        this.getExternalData(sizePerPage, page, this.state.externalSortColumn, this.state.externalSortAscending,
            this.state.searchText, this.state.filter);
    }

    onSortChange(sortName, sortOrder) {
        this.getExternalData(this.state.externalResultsPerPage, 1, sortName, sortOrder, this.state.searchText, this.state.filter)
    }

    onFilterChange(filterObj, colInfos) {
        if (Object.keys(filterObj).length === 0) {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn,
                this.state.externalSortAscending, this.state.searchText, null);
        } else {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn,
                this.state.externalSortAscending, this.state.searchText, filterObj);
        }
    }

    onSearchChange(searchText, colInfos, multiColumnSearch) {

        if (searchText === "") {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn,
                this.state.externalSortAscending, null, this.state.filter);
        } else {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn,
                this.state.externalSortAscending, searchText, this.state.filter);
        }
    }

    onExportToCSV() {
        return this.getExternalData();
    }

    onRowSelect(row, isSelected) {
        if (!this.state.unselectable.includes(row[this.primaryField])) {
            if (isSelected) {
                this.selectedRows.push(row);
            }
            else {
                this.selectedRows = this.selectedRows.filter((rowObj) => {
                    return rowObj[this.primaryField] != row[this.primaryField];
                });
            }
            this.updateSelectedIds(this.selectedRows);
        }

        if (this.props.onRowSelect) {
            this.props.onRowSelect(this.selectedRows, row, isSelected);
        }
    }

    onSelectAll(isSelected, currentDisplayAndSelectedData, skipChecking = false) {
        this.selectedRows = [];
        let data = this.props.isRemoteData ? this.state.results : this.props.gridData;
        if (data.length != currentDisplayAndSelectedData.length && !skipChecking) {
            currentDisplayAndSelectedData = data;
        }

        if (isSelected) {
            this.selectedRows = currentDisplayAndSelectedData;
        }
        else if (this.state.unselectable.length > 0) {
            let selectedRowsData = [];
            data.map(d => {
                if (this.state.unselectable.includes(d[this.primaryField])) {
                    selectedRowsData.push(d);
                }
            });
            this.selectedRows = selectedRowsData;
        }
        this.updateSelectedIds(this.selectedRows);

        if (this.props.onRowSelect) {
            this.props.onRowSelect(this.selectedRows, currentDisplayAndSelectedData, isSelected);
        }
    }

    updateSelectedIds(selectedRows = []) {
        let selectedIds = [];
        selectedRows.map(r => {
            selectedIds.push(r[this.primaryField]);
        });
        this.stateSet({ selected: selectedIds });
    }

    cleanSelected() {
        this.refs.table.cleanSelected();
        this.selectedRows = [];
        if (this.state.unselectable.length > 0) {
            let data = this.props.isRemoteData ? this.state.results : this.props.gridData;
            let selectedRowsData = [];
            data.map(d => {
                if (this.state.unselectable.includes(d[this.primaryField])) {
                    selectedRowsData.push(d);
                }
            });
            this.selectedRows = selectedRowsData;
        }
        this.updateSelectedIds(this.selectedRows);
    }

    // params :
    // selectedRows - array of 'key field' only data
    // selectedObj - array of object like ({'key field' : value} )
    setSelected(selectedRows, selectedObj, unSelectedRow = []) {
        this.stateSet({ selected: selectedRows, unselectable: unSelectedRow });
        this.selectedRows = selectedObj;
    }

    // set row background color
    setBGColor(row, isSelect) {
        if (this.props.setBGColor && !isSelect) {
            let color = this.props.setBGColor(row);
            return color || "rgb(207, 206, 230)";
        }
        else
            return "rgb(207, 206, 230)";
    }

    expandColumnComponent({ isExpanded }) {
        let imgPath = this.siteURL + "/static/images/";
        return (
            <div> <img src={isExpanded ? imgPath + "collapse.png" : imgPath + "expand.png"} /></div>
        );
    }

    handleExportToCSV() {
        this.refs.table.handleExportCSV();
    }

    render() {
        let props = this.props;
        let selectRowObj = {
            mode: props.selectRowMode,
            clickToSelect: true,
            clickToExpand: props.clickToExpand,
            bgColor: "rgb(207, 206, 230)",
            onSelect: this.onRowSelect,
            onSelectAll: this.onSelectAll,
            selected: this.state.selected,
            unselectable: this.state.unselectable
        }

        if (props.setBGColor)
            selectRowObj.bgColor = this.setBGColor;

        return (
            <div>
                {this.props.columnVisible ?
                    <ColumnVisible columns={this.state.columns} changeEvent={this.columnVisibleChnage.bind(this)} />
                    : null}

                <BootstrapTable
                    ref="table"
                    data={props.isRemoteData ? this.state.results : props.gridData}
                    remote={props.isRemoteData}
                    cellEdit={props.cellEdit}
                    height={props.height}
                    maxHeight={props.maxHeight}
                    pagination={props.pagination}
                    search={props.enableSearch}
                    hover={true}
                    fetchInfo={{ dataTotalSize: this.state.totalDataSize }}
                    selectRow={selectRowObj}
                    exportCSV={props.exportCSV}
                    csvFileName={props.csvFileName}
                    expandableRow={props.expandableRow}
                    expandComponent={props.expandComponent}
                    expandColumnOptions={{
                        expandColumnVisible: props.expandColumnVisible || false,
                        expandColumnComponent: this.expandColumnComponent,
                        columnWidth: 35
                    }}
                    options={{
                        noDataText: this.state.isLoading ? <LoadingIndicator color="#c35f4b" className="grid-loading" loadingText="Loading..." size={20} thickness={2} onlyIndicator={true} /> : <h1>There is no data to display</h1>,
                        sizePerPage: this.state.externalResultsPerPage,
                        sizePerPageList: props.sizePerPageList,
                        page: this.state.currentPage,
                        paginationSize: props.pageSize,
                        paginationShowsTotal: true,
                        expandBy: props.expandBy,
                        onPageChange: props.isRemoteData ? this.onPageChange.bind(this) : null,
                        onSortChange: props.isRemoteData ? this.onSortChange.bind(this) : null,
                        onSearchChange: props.isRemoteData ? this.onSearchChange.bind(this) : null,
                        onFilterChange: props.isRemoteData ? this.onFilterChange.bind(this) : null,
                        onExportToCSV: props.isRemoteData ? this.onExportToCSV.bind(this) : null
                    }}>
                    {this.bindColumns()}
                </BootstrapTable>
            </div >
        )
    }
}

function checkGridData(props, propName, componentName) {
    if (!props.isRemoteData && !props[propName]) {
        return new Error(
            'Grid data is not passed.'
        );
    }
}

// Define PropTypes
Grid.propTypes = {
    isRemoteData: React.PropTypes.bool,
    height: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
    ]),
    pagination: React.PropTypes.bool,
    enableSearch: React.PropTypes.bool,
    selectRowMode: React.PropTypes.string,
    clickToExpand: React.PropTypes.bool,
    exportCSV: React.PropTypes.bool,
    csvFileName: React.PropTypes.string,
    expandableRow: React.PropTypes.func,
    expandComponent: React.PropTypes.func,
    expandBy: React.PropTypes.string,
    gridData: checkGridData,
    cellEdit: React.PropTypes.object,
    editable: React.PropTypes.any,
    columnVisible: React.PropTypes.bool,
    onRowSelect: React.PropTypes.func,
    selectAll: React.PropTypes.bool,
};

//Define defaultProps
Grid.defaultProps = {
    isRemoteData: true,
    height: 'auto',
    maxHeight: 'auto',
    pagination: true,
    enableSearch: false,
    selectRowMode: 'checkbox',
    clickToExpand: false,
    exportCSV: false,
    editable: false,
    columnVisible: false,
    selectAll: false,
    sizePerPageList: [10, 25, 50, 100],
    pageSize: 10
}

export default Grid