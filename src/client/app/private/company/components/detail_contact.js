'use strict';

/******************************
 * Page for add/edit/display contact
 * **************************** */

import React, { Component } from 'react';
import ContactDisplay from '../../contact/components/contact_grid';
import ContactModify from '../../contact/components/contact_detail';
import Button from '../../../../lib/core-components/Button';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

class ContactDetail extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.contactId = null;
        // this.companyName = '';
        // this.shortCode = '';

        this.state = {
            addMode: false,
            selectAll: false
        }
        this.modifyContact = this.modifyContact.bind(this);
        this.toggleSetPassword = this.toggleSetPassword.bind(this);
        this.deleteContactClick = this.deleteContactClick.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.addNewClick = this.addNewClick.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.toggleButtonText = this.toggleButtonText.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        // let companyData = this.props.getCompanyData();
        // this.companyName = companyData.companyName;
        // this.shortCode = companyData.shortCode;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // get details of selected contact for update
    modifyContact() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.grid.refs.contactGrid.selectedRows.length, true, true)) {
            this.contactId = this.refs.grid.refs.contactGrid.selectedRows[0].Id;
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


    toggleFilter() {
        let filterState = this.refs.grid.state.displayFilter;
        this.refs.grid.setState({ displayFilter: !filterState })
    }

    // open popup for set password
    toggleSetPassword() {
        this.refs.grid.toggleSetPassword(true);
    }

    // Open delete Contact confirmation popup
    deleteContactClick() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.grid.refs.contactGrid.selectedRows.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.refs.grid.deleteContact
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // handle save click
    saveClick(e) {
        e.preventDefault();
        let _this = this;
        return this.refs.detail.saveUserProfile().then(function (res) {
            if (res) {
                _this.stateSet({ addMode: false, selectAll: false });
            }
            return res;
        }).catch(function (err) {
            return false;
        });
    }

    addNewClick() {
        this.contactId = null;
        this.setState({ addMode: true, selectAll: false });
    }

    cancelClick() {
        this.setState({ addMode: false, selectAll: false });
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
                            <li><a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">{this.strings.CONTROLS.ACTION_LABEL}</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                    <li>
                                        <ul>
                                            <li><a href="javascript:void(0)"
                                                onClick={this.addNewClick}>
                                                {strings.CONTROLS.NEW_CONTACT}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyContact}>
                                                {strings.CONTROLS.MODIFY_CONTACT}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.deleteContactClick}>
                                                {strings.CONTROLS.DELETE_CONTACT}</a>
                                            </li>
                                            <li><a href="javascript:void(0)" onClick={this.toggleSetPassword}>
                                                {strings.CONTROLS.SET_PASSWORD_LABEL}</a>
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
                <ContactDisplay strings={{ ...this.strings.DISPLAY, COMMON: this.strings.COMMON }}
                    selectAll={this.state.selectAll}
                    toggleButtonText={this.toggleButtonText}
                    hierarchyProps={{ ...this.props.hierarchyProps }}
                    notifyToaster={this.props.notifyToaster} companyId={this.props.detail}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup} ref='grid' />
            </div>
        );
    }

    renderForm() {
        return (
            <div>
                <ContactModify notifyToaster={this.props.notifyToaster} detail={this.contactId || 'new'}
                    strings={{ ...this.strings.DETAIL, COMMON: this.strings.COMMON }} ref='detail'
                    companyId={this.props.detail}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup} />
                <div className="row pull-right">
                    <Button
                        inputProps={{
                            name: 'btnBack',
                            label: 'Cancel',
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.cancelClick} ></Button>
                    <Button
                        inputProps={{
                            name: 'btnSave',
                            label: this.strings.CONTROLS.SAVE_LABEL,
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

export default ContactDetail;