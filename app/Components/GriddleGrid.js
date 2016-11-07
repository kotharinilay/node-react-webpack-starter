import React, {Component} from 'react';
import Render from 'react-dom';
import Griddle from 'griddle-react';
import Loading from './Loading';
import api from '../swapi/api'

class GriddleGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: [],
            currentPage: 0,
            isLoading: false,
            maxPages: 0,
            externalResultsPerPage: 10,
            externalSortColumn: null,
            externalSortAscending: true,
            filterText: null
        };
    }

    componentWillMount() {}

    componentDidMount() {
        this.getExternalData();
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
            let pageSize = that.state.externalResultsPerPage;
            that.setState({
                results: data.data,
                currentPage: page - 1,
                externalResultsPerPage: pageSize,
                maxPages: Math.round(data.total / pageSize),
                isLoading: false,
                filterText: filter,
                externalSortColumn: sortColumn,
                externalSortAscending: sortasc
            })
        });
    }

    setPage(index) {
        index = index > this.state.maxPages
            ? this.state.maxPages
            : index < 1
                ? 1
                : index + 1;

        this.getExternalData(this.state.externalResultsPerPage, index, this.state.externalSortColumn, this.state.externalSortAscending, this.state.filterText);
    }

    setPageSize(size) {
        this.getExternalData(size, 1, this.state.externalSortColumn, this.state.externalSortAscending, this.state.filterText);
    }

    changeSort(sort, sortAscending) {
        this.getExternalData(this.state.externalResultsPerPage, 1, sort, sortAscending, this.state.filterText)
        // this.setState(this.sortData(sort, sortAscending,
        // this.state.pretendServerData));
    }

    setFilter(filter) {
        if (filter === "") {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn, this.state.externalSortAscending, null);
        } else {
            this.getExternalData(this.state.externalResultsPerPage, 1, this.state.externalSortColumn, this.state.externalSortAscending, filter);
        }
    }

    render() {
        return (
            <div>
                <Griddle
                    useExternal={true}
                    externalSetPage={this
                    .setPage
                    .bind(this)}
                    enableSort={true}
                    columns={["id", "name", "email", "body"]}
                    externalSetPageSize={this
                    .setPageSize
                    .bind(this)}
                    externalMaxPage={this.state.maxPages}
                    externalChangeSort={this
                    .changeSort
                    .bind(this)}
                    externalSetFilter={this
                    .setFilter
                    .bind(this)}
                    externalCurrentPage={this.state.currentPage}
                    results={this.state.results}
                    tableClassName="table"
                    resultsPerPage={this.state.externalResultsPerPage}
                    externalSortColumn={this.state.externalSortColumn}
                    externalSortAscending={this.state.externalSortAscending}
                    externalLoadingComponent={Loading}
                    externalIsLoading={this.state.isLoading}
                    showFilter={true}
                    showSettings={true}/>
            </div>
        )
    }
}

export default GriddleGrid