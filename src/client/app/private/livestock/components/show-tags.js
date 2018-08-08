'use strict';

/************************************************
 * Show all the imported tags to current property
 ***********************************************/

import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../lib/core-components/DatetimePicker';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { localToUTC } from '../../../../../shared/format/date';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';
import { SET_SELECTED_TAGS } from '../actiontypes';
import { tagStatusCodes } from '../../../../../shared/constants';

import { browserHistory } from 'react-router';

class ShowTags extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;

        this.state = {
            key: Math.random(),
            selectAll: false,
            isClicked: false,
            displayFilter: false,
            clearFilterKey: Math.random(),
            grid: {
                columns: [
                    { field: 'TagId', isKey: true, isSort: false, displayName: 'Tag Id', visible: false },
                    { field: 'EID', isKey: false, displayName: 'EID', visible: true },
                    { field: 'NLISID', displayName: 'NLIS ID', isKey: false, visible: true },
                    { field: 'VisualTag', displayName: 'Visual Tag', isKey: false, visible: true },
                    { field: 'IssueDate', displayName: 'Issue Date', isKey: false, visible: true, format: 'dateformat' },
                    { field: 'TagColour', displayName: 'Tag Colour', isKey: false, visible: true },
                    { field: 'TagYear', displayName: 'Tag Year', isKey: false, visible: true },
                    { field: 'Species', displayName: 'Species', isKey: false, visible: true },
                    { field: 'TagStatus', displayName: 'Current Status', isKey: false, visible: true }
                ],
                selectAll: false,
                functionName: 'tags/getdataset',
                sortColumn: 'EID',
                sortOrder: 'asc',
                filterObj: { propertyId: this.props.topPIC.PropertyId }
            }
        };

        this.filterSchema = ['searchValue', 'issueFromDate', 'issueToDate'];
        this.strings = this.props.strings;

        this.stateSet = this.stateSet.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);

        this.renderHeader = this.renderHeader.bind(this);
        this.renderFilter = this.renderFilter.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.activateTags = this.activateTags.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }

        this.refs.tagGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.clearFilter();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // clear filter and load all data
    clearFilter() {
        let grid = { ...this.state.grid };
        grid.filterObj = {
            propertyId: this.props.topPIC.PropertyId
        }
        this.stateSet({ clearFilterKey: Math.random(), grid: grid });
    }

    // show/hide filter screen
    toggleFilter() {
        let filterState = this.state.displayFilter;
        this.stateSet({ displayFilter: !filterState });
    }

    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);
        let isValid = isValidForm(this.filterSchema, this.refs);

        if (isValid == false) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.FILTER_CORRECT_MESSAGE });
            return;
        }
        if (obj != null) {
            if (isEmpty(obj.searchValue) && obj.issueFromDate == null && obj.issueToDate == null) {
                this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
                return;
            }

            let grid = { ...this.state.grid };
            grid.filterObj = { ...obj, propertyId: this.props.topPIC.PropertyId };
            this.stateSet({ grid: grid });

            return;
        }
        this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
    }

    activateTags() {
        if (this.refs.tagGrid.selectedRows.length > 0) {
            // console.log(this.refs.tagGrid.primaryValues);
            let errMessage = '';
            let _this = this;
            let isValid = this.refs.tagGrid.selectedRows.every(function (row, i, arr) {
                if (row['TagSystemCode'] != tagStatusCodes.Pending) {
                    errMessage = _this.strings.INVALID_STATUS_MESSAGE;
                    return false;
                }
                if (i > 0 && row['SpeciesId'] != arr[i - 1]['SpeciesId']) {
                    errMessage = _this.strings.SAME_SPECIES_VALIDATION_MESSAGE;
                    return false;
                }
                else
                    return true;
            });
            if (isValid) {
                this.props.setSelectedTags(SET_SELECTED_TAGS,
                    {
                        SpeciesId: this.refs.tagGrid.selectedRows[0]['SpeciesId'],
                        tags: this.refs.tagGrid.selectedRows
                    });
                browserHistory.push('/livestock/activate-tags');
            }
            else
                this.props.notifyToaster(NOTIFY_ERROR, { message: errMessage });
        }
        else {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SELECT_TAG_VALIDATION_MESSAGE });
        }
    }

    toggleSelection() {
        let selectAll = !this.state.selectAll;
        let grid = { ...this.state.grid };
        grid.selectAll = selectAll;
        this.stateSet({ grid: grid, selectAll: selectAll });
        this.refs.tagGrid.onSelectAll(selectAll, []);
    }

    // render header part
    renderHeader() {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnFilter',
                                        label: this.strings.CONTROLS.FILTER_LABEL,
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
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnActivate',
                                        label: this.strings.CONTROLS.ACTIVATE_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.activateTags}
                                ></Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >);
    }

    // render filter screen
    renderFilter() {
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.clearFilterKey}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={this.toggleFilter}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>
            </h2>
            <div className="clearfix"></div>
            <div className="form-group">
                <Input inputProps={{
                    name: 'searchValue',
                    hintText: this.strings.CONTROLS.SEARCH_PLACEHOLDER
                }}
                    maxLength={250}
                    isLoading={false}
                    isClicked={this.props.isClicked} ref="searchValue" />
            </div>
            <div className="form-group">
                <DateTimePicker inputProps={{
                    name: 'issueFromDate',
                    placeholder: this.strings.CONTROLS.ISSUE_FROMDATE_PLACEHOLDER
                }}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="issueFromDate" />
            </div>
            <div className="form-group">
                <DateTimePicker inputProps={{
                    name: 'issueToDate',
                    placeholder: this.strings.CONTROLS.ISSUE_TODATE_PLACEHOLDER
                }}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="issueToDate" />
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

    renderContent() {
        return (
            <div className="stock-list">
                <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="clear"></div>
                        <Grid ref="tagGrid" {...this.state.grid} />
                    </div>
                    {this.renderFilter()}
                </div>
            </div>);
    }

    render() {
        return (
            <div>
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default ShowTags;