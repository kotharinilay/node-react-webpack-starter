'use strict';

/******************************
 * Page for add/edit/display property
 * **************************** */

import React, { Component } from 'react';
import PropertyDisplay from '../../property/components/display_grid';
import PropertyModify from '../../property/components/detail_tabs';
import Button from '../../../../lib/core-components/Button';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

class PropertyDetail extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.propertyId = null;

        this.state = {
            addMode: false,
            selectAll: false
        }
        this.modifyProperty = this.modifyProperty.bind(this);
        this.deletePropertyClick = this.deletePropertyClick.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.addNewClick = this.addNewClick.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.toggleButtonText = this.toggleButtonText.bind(this);
    }

    // get details of selected property for update
    modifyProperty() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.grid.refs.propertyGrid.selectedRows.length, true, true)) {
            this.propertyId = this.refs.grid.refs.propertyGrid.selectedRows[0].Id;
            this.setState({ addMode: true, selectAll: false });
        }
    }

    toggleButtonText(val) {
        this.setState({ selectAll: val });
    }

    // Select All/Clear grid selection
    toggleSelection() {
        this.refs.grid.toggleSelection();
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

    // handle save click
    saveClick(e) {
        e.preventDefault();
        this.refs.detail.savePropertyClick();
    }

    changeMode() {
        this.setState({ addMode: false, selectAll: false });
    }

    toggleFilter() {
        let filterState = this.refs.grid.state.displayFilter;
        this.refs.grid.setState({ displayFilter: !filterState })
    }

    addNewClick() {
        this.propertyId = null;
        this.setState({ addMode: true, selectAll: false });
    }

    renderHeader(strings) {
        return (
            <div className="col-xs-12">
                <div className="live-detail-main">
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button inputProps={{
                                    name: 'btnAddNew',
                                    label: strings.CONTROLS.FILTER_LABEL,
                                    className: 'button1Style button30Style',
                                }}
                                    onClick={this.toggleFilter}></Button>
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
                                                onClick={this.addNewClick}>
                                                {strings.CONTROLS.ADD_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyProperty}>
                                                {strings.CONTROLS.MODIFY_PROPERTY}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.deletePropertyClick}>
                                                {strings.CONTROLS.DELETE_PROPERTY}</a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    renderGrid() {
        return (
            <div>
                {this.renderHeader(this.strings.DISPLAY)}
                <PropertyDisplay strings={{ ...this.strings.DISPLAY, COMMON: this.strings.COMMON }}
                    notifyToaster={this.props.notifyToaster} companyId={this.props.detail}
                    selectAll={this.state.selectAll}
                    toggleButtonText={this.toggleButtonText}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup} ref='grid' />
            </div>
        );
    }

    renderForm() {
        return (
            <div>
                <PropertyModify notifyToaster={this.props.notifyToaster} detail={this.propertyId || 'new'}
                    strings={{ ...this.strings.DETAIL, COMMON: this.strings.COMMON }} ref='detail'
                    refCompanyId={this.props.detail}
                    hierarchyProps={{ ...this.props.hierarchyProps }}
                    companyDisabled={this.props.detail ? true : false}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup}
                    changeMode={this.changeMode} />
                <div className="row pull-right">
                    <Button
                        inputProps={{
                            name: 'btnBack',
                            label: 'Cancel',
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.changeMode} ></Button>
                    <Button
                        inputProps={{
                            name: 'btnSave',
                            label: this.strings.DETAIL.CONTROLS.SAVE_LABEL,
                            className: 'button2Style button30Style upoload-button-width'
                        }}
                        onClick={this.saveClick} ></Button>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.state.addMode ? this.renderForm() : this.renderGrid()}
            </div>
        );
    }
}

export default PropertyDetail;