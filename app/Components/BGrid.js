import React, { Component } from 'react';
import Render from 'react-dom';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import api from '../swapi/api'

import ColumnVisible from './ColumnVisible'

class BGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            currentPage: 1,
            isLoading: false,
            externalResultsPerPage: 10,
            externalSortColumn: null,
            externalSortAscending: 'asc',
            searchText: null,
            totalDataSize: 0,
            filter: {},
            columns: this.props.columns
        };
    }

    columnFormates(name) {
        switch (name) {
            case 'imageFormat':
                return this.imageFormatter;
        }
    }

    imageFormatter(cell, row) {
        return "<img src='" + cell + "'/>";
    }

    bindColumns() {
        return (this.state.columns.map(column => {
            return <TableHeaderColumn hidden={!column.visible}
                dataField={column.field}
                key={column.field}
                isKey={column.isKey}
                dataSort={column.isSort}
                dataFormat={this.columnFormates(column.format)}
                filter={column.filter}>
                {column.displayName}
            </TableHeaderColumn>
        }
        ));
    }

    columnVisibleChnage(field, value) {
        let fieldObj = _.find(this.state.columns, column => column.field == field);
        fieldObj.visible = value;
        this.setState({
            columns: this.state.columns
        });
    }

    getExternalData(pageSize, page, sortColumn, sortasc, search, filterObj) {
        var that = this;
        pageSize = pageSize || 10;
        page = page || 1;
        search == ""
            ? null
            : search;
        sortasc = sortasc || 'asc';
        this.setState({ isLoading: true });

        api(pageSize, page, sortColumn, sortasc, search, this.props.functionName, filterObj).then(function (data) {
            that.setState({
                results: data.data,
                currentPage: page,
                isLoading: false,
                externalResultsPerPage: pageSize,
                externalSortColumn: sortColumn,
                externalSortAscending: sortasc,
                searchText: search,
                totalDataSize: data.total,
                filter: filterObj
            })
        });
    }

    componentWillMount() { }

    componentDidMount() {
        this.getExternalData();
    }

    onPageChange(page, sizePerPage) {
        this.getExternalData(sizePerPage, page, this.state.externalSortColumn, this.state.externalSortAscending,
            this.state.searchText, this.state.filter);
    }

    onSortChange(sortName, sortOrder) {
        this.getExternalData(this.state.externalResultsPerPage, 1, sortName, sortOrder, this.state.searchText, this.state.filter)
    }

    onFilterChange(filterObj, colInfos) {
        debugger;
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

    render() {
        return (
            <div>
                <ColumnVisible columns={this.state.columns} changeEvent={this.columnVisibleChnage.bind(this)} />
                <BootstrapTable
                    data={this.state.results}
                    remote={true}
                    pagination={true}
                    search={true}
                    fetchInfo={{ dataTotalSize: this.state.totalDataSize }}
                    selectRow={{
                        mode: 'checkbox',
                        clickToSelect: true,
                        bgColor: "rgb(238, 193, 213)"
                    }}
                    exportCSV={true}
                    options={{
                        sizePerPage: this.state.externalResultsPerPage,
                        sizePerPageList: [10, 25, 50, 100],
                        page: this.state.currentPage,
                        onPageChange: this.onPageChange.bind(this),
                        onSortChange: this.onSortChange.bind(this),
                        onSearchChange: this.onSearchChange.bind(this),
                        onFilterChange: this.onFilterChange.bind(this),
                        onExportToCSV: this.onExportToCSV.bind(this)
                    }}>
                    {this.bindColumns()}
                </BootstrapTable>
            </div>
        )
    }
}

export default BGrid