'use strict';

/**************************
 * Display page for property
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import DisplayGrid from './display_grid';
import Button from '../../../../lib/core-components/Button';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';


class Display extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;

        this.state = {
            selectAll: false
        }

        this.toggleSelection = this.toggleSelection.bind(this);
        this.modifyProperty = this.modifyProperty.bind(this);
        this.deletePropertyClick = this.deletePropertyClick.bind(this);
        this.showPastureComposition = this.showPastureComposition.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.toggleButtonText = this.toggleButtonText.bind(this);
    }

    // Open delete property confirmation popup
    deletePropertyClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.grid.refs.propertyGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.refs.grid.deleteProperty
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // Redirect to edit mode for selected Property
    modifyProperty() {
        let propertyGrid = this.refs.grid.refs.propertyGrid;
        if (gridActionNotify(this.strings, this.props.notifyToaster, propertyGrid.selectedRows.length, true, true)) {
            browserHistory.push('/property/' + propertyGrid.selectedRows[0].Id);
        }
    }

    // Show Pasture Composition
    showPastureComposition() {
        let propertyGrid = this.refs.grid.refs.propertyGrid;
        if (gridActionNotify(this.strings, this.props.notifyToaster, propertyGrid.selectedRows.length, true, true)) {
            browserHistory.push('/pasturecomposition/' + propertyGrid.selectedRows[0].Id);
        }
    }

    toggleButtonText(val) {
        this.setState({ selectAll: val });
    }

    // Select All/Clear grid selection
    toggleSelection() {
        this.refs.grid.toggleSelection();
    }

    toggleFilter() {
        let filterState = this.refs.grid.state.displayFilter;
        this.refs.grid.setState({ displayFilter: !filterState });
    }

    // Render header area of component
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
                            <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)"
                                                onClick={() => browserHistory.replace('/property/new')}>
                                                {this.strings.CONTROLS.ADD_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyProperty}>
                                                {this.strings.CONTROLS.MODIFY_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.deletePropertyClick}>
                                                {this.strings.CONTROLS.DELETE_PROPERTY}</a>
                                            </li>
                                            {/*<li><a href="javascript:void(0)" onClick={this.showPastureComposition}>
                                                {this.strings.CONTROLS.RECORD_ENCLOSURE_SPRAY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.showPastureComposition}>
                                                {this.strings.CONTROLS.SHOW_ENCLOSURE_SPRAY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.showPastureComposition}>
                                                {this.strings.CONTROLS.RECORD_PASTURE_COMPOSITION}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.showPastureComposition}>
                                                {this.strings.CONTROLS.SHOW_PASTURE_COMPOSITION}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.showPastureComposition}>
                                                {this.strings.CONTROLS.VIEW_PASTURE_COMPOSITION}</a>
                                            </li>*/}
                                        </ul>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </div>
                </div>
            </div >);
    }

    // Render Property components
    render() {
        return (
            <div className="dash-right">
                {this.renderHeader()}
                <div className="clear"></div>
                <DisplayGrid strings={this.strings}
                    selectAll={this.state.selectAll}
                    toggleButtonText={this.toggleButtonText}
                    topSearch={this.props.topSearch}
                    hierarchyProps={{ ...this.props.hierarchyProps }}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup}
                    notifyToaster={this.props.notifyToaster} ref='grid' />
                <div className="clear"></div>
            </div>
        );
    }
}

export default Display;