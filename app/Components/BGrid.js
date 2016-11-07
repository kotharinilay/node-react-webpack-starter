import React, {Component} from 'react';
import Render from 'react-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import api from '../swapi/api'

class BGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: [],
            currentPage: 1,
            isLoading: false,
            maxPages: 0,
            externalResultsPerPage: 10,
            externalSortColumn: null,
            externalSortAscending: true,
            filterText: null
        };
    }

    getExternalData(pageSize, page, sortColumn, sortasc, filter) {
        var that = this;
        pageSize = pageSize || 10;
        page = page || 1;
        filter == ""
            ? null
            : filter;

        this.setState({isLoading: true});

        api(pageSize, page, sortColumn, sortasc, filter).then(function (data) {
            //let pageSize = that.state.externalResultsPerPage;
            that.setState({
                results: data.data,
                currentPage: page,
                externalResultsPerPage: pageSize,
                maxPages: Math.round(data.total / pageSize),
                isLoading: false,
                filterText: filter,
                externalSortColumn: sortColumn,
                externalSortAscending: sortasc,
                totalDataSize: data.total
            })
        });
    }

    componentWillMount() {}

    componentDidMount() {
        this.getExternalData();
    }

    onPageChange(page, sizePerPage) {
        this.getExternalData(sizePerPage, page, this.state.externalSortColumn, this.state.externalSortAscending, this.state.filterText);
    }

    onSortChange(sortName, sortOrder) {
        this.getExternalData(this.state.externalResultsPerPage, 1, sortName, sortOrder, this.state.filterText)
    }

    //onFilterChange(filterObj, colInfos) {}

    onSearchChange(searchText, colInfos, multiColumnSearch) {
        if (searchText === "") {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn, this.state.externalSortAscending, null);
        } else {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn, this.state.externalSortAscending, searchText);
        }
    }

    onExportToCSV() {
        return this.getExternalData();
    }

    render() {
        return (
            <BootstrapTable
                data={this.state.results}
                remote={true}
                pagination={true}
                search={true}
                fetchInfo={{
                dataTotalSize: this.state.totalDataSize
            }}
                selectRow={{
                mode: 'checkbox',
                clickToSelect: true,
                bgColor: "rgb(238, 193, 213)"
            }}
                exportCSV={true}
                options={{
                sizePerPage: this.state.externalResultsPerPage,
                sizePerPageList: [
                    10, 25, 50, 100
                ],
                page: this.state.currentPage,
                onPageChange: this
                    .onPageChange
                    .bind(this),
                
                onSortChange: this
                    .onSortChange
                    .bind(this),
                onSearchChange: this
                    .onSearchChange
                    .bind(this),
                onExportToCSV: this
                    .onExportToCSV
                    .bind(this)
            }}>
                <TableHeaderColumn dataField='id' isKey={true} dataSort={true}>Comment ID</TableHeaderColumn>
                <TableHeaderColumn dataField='name' dataSort={true}>Comment Name</TableHeaderColumn>
                <TableHeaderColumn dataField='email' dataSort={true}>Email</TableHeaderColumn>
                <TableHeaderColumn dataField='body' dataSort={true}>Body</TableHeaderColumn>
            </BootstrapTable>
        )
    }
}

export default BGrid