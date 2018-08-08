'use strict';

/**************************
 * Display page for pasture composition
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import { notifyToaster } from '../../../common/actions';
import { getForm } from '../../../../lib/wrapper-components/FormActions';

class PastureCompositionDisplay extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;

        this.state = {
            displayFilter: false,
            isClicked: false,
            clearFilterKey: Math.random(),
            refreshGridKey: Math.random(),
            columns: [
                { field: 'Id', isKey: true, displayName: 'Pasture Composition Id' },
                { field: 'AuditLogId', displayName: 'AuditLog Id' },
                { field: 'EventDate', displayName: 'Date', visible: true },
                { field: 'EncluserName', displayName: 'Encluser', visible: true },
                { field: 'Lucerne', displayName: 'Lucerne', visible: true },
                { field: 'Fescue', displayName: 'Fescue', visible: true },
                { field: 'Ryegrass', displayName: 'Ryegrass', visible: true },
                { field: 'Clover', displayName: 'Clover', visible: true },
                { field: 'Annuals', displayName: 'Annuals', visible: true },
                { field: 'Weeds', displayName: 'Weeds', visible: true },
                { field: 'CompositionType', displayName: 'Renovation Program', visible: true },
                { field: 'Comment', displayName: 'Comment', visible: true }
            ],
            functionName: 'pasturecomposition/getdataset',
            filterObj: { 'pc.PropertyId': this.props.params.detail },
            sortOrder: 'desc',
            sortColumn: 'EventDate'
        }

        this.filterSchema = ['fromDate', 'toDate'];
        //this.notify = this.props.notify;
        this.strings = this.props.strings;

        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
    }

    // get filter data for property grid filtering
    componentWillMount() {
        // let _this = this;
        // getPropertyFilterData().then(function (res) {
        //     if (res.success) {
        //         _this.setState({ stateData: res.data.state, propertyTypeData: res.data.propertyType });
        //     }
        // });
    }

    // Clear grid selection
    clearSelection() {
        this.refs.pasturecompositionGrid.cleanSelected();
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        this.refs.pasturecompositionGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    // apply filter on grid data
    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);

        if (obj.fromDate && obj.toDate) {
            let stateFilter = this.state.filterObj;
            stateFilter.fromDate = obj.fromDate;
            stateFilter.toDate = obj.toDate;
            this.setState({ filterObj: stateFilter, refreshGridKey: Math.random() });
        }
        else {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
        }
    }

    // clear filter on grid data and display all data
    clearFilter() {
        if (!isEmpty(this.state.filterObj))
            this.setState({
                clearFilterKey: Math.random(), refreshGridKey: Math.random(),
                filterObj: { 'pc.PropertyId': this.props.params.detail }
            });
    }

    // Render header area of component
    renderHeader(strings) {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{strings.DISPLAY.TITLE}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnAddNew',
                                        label: this.strings.DISPLAY.CONTROLS.FILTER_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={() => {
                                        let filterState = this.state.displayFilter;
                                        this.setState({ displayFilter: !filterState })
                                    }}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnClear',
                                        label: this.strings.DISPLAY.CONTROLS.CLEAR_LABEL,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.clearSelection}
                                ></Button>
                            </li>
                            {/*<li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)"
                                                onClick={() => browserHistory.replace('/property/new')}>
                                                {this.strings.CONTROLS.NEW_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyProperty}>
                                                {this.strings.CONTROLS.MODIFY_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.deleteProperty}>
                                                {this.strings.CONTROLS.DELETE_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.toggleSetPassword}>
                                                {this.strings.CONTROLS.SET_PASSWORD_LABEL}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.pastureCompositionClick}>
                                                Show Pasture Composition</a>
                                            </li>

                                        </ul>
                                    </li>
                                </ul>
                            </li>*/}
                        </ul>
                    </div>
                </div>
            </div >);
    }

    // Render filter area for grid
    renderFilter() {
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.clearFilterKey}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={() => { this.setState({ displayFilter: false }) }}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>
            </h2>
            <br />
            <span>Event Date</span>
            <br />
            <span>From Date</span>
            <br />
            <div className="form-group">
                <DatetimePicker inputProps={{
                    name: 'fromDate',
                    placeholder: this.strings.DISPLAY.CONTROLS.FROMDATE_PLACEHOLDER
                }}
                    defaultValue={new Date()}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="fromDate" />
            </div>
            <span>To Date</span>
            <br />
            <div className="form-group">
                <DatetimePicker inputProps={{
                    name: 'toDate',
                    placeholder: this.strings.DISPLAY.CONTROLS.TODATE_PLACEHOLDER
                }}
                    defaultValue={new Date()}
                    timeFormat={false}
                    isClicked={this.state.isClicked} ref="toDate" />
            </div>
            <div className="f-btn">
                <Button
                    inputProps={{
                        name: 'btnApplyFilter',
                        label: this.strings.DISPLAY.CONTROLS.APPLY_FILTER_LABEL,
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
                        label: this.strings.DISPLAY.CONTROLS.CLEAR_FILTER_LABEL,
                        className: 'button3Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.clearFilter}
                ></Button>
            </div>
        </div>);
    }

    // Render content area with filter
    renderContent(strings) {
        return (<div className="stock-list">
            <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                <div className="livestock-content">
                    <div className="cattle-text">
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    <Grid ref="pasturecompositionGrid" {...this.state} key={this.state.refreshGridKey} />
                </div>
                {this.renderFilter()}
            </div>
        </div>);
    }

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

const mapStateToProps = (state, ownProps) => {
    return {
        topSearch: state.header.topSearch
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('PastureComposition', PastureCompositionDisplay));