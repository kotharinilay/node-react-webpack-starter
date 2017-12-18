'use strict';

/**************************
 * Display page for contact
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import ContactGrid from './contact_grid';
import Button from '../../../../lib/core-components/Button';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

class ContactDisplay extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.deleteContactClick = this.deleteContactClick.bind(this);
        this.modifyContact = this.modifyContact.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.toggleSetPassword = this.toggleSetPassword.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
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

    // Redirect to edit mode for selected Contact
    modifyContact() {
        if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.grid.refs.contactGrid.selectedRows.length, true, true)) {
            browserHistory.push('/contact/' + this.refs.grid.refs.contactGrid.selectedRows[0].Id);
        }
    }

    // Clear grid selection
    clearSelection() {
        this.refs.grid.clearSelection();
    }

    // open popup for set password
    toggleSetPassword() {
        this.refs.grid.toggleSetPassword(true);
    }

    toggleFilter() {
        let filterState = this.refs.grid.state.displayFilter;
        this.refs.grid.setState({ displayFilter: !filterState })
    }

    renderHeader(strings) {
        return (<div className="dash-right-top" >
            <div className="live-detail-main">
                <div className="configure-head">
                    <span> {strings.TITLE} </span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button inputProps={{
                                name: 'btnAddNew',
                                label: this.strings.CONTROLS.FILTER_LABEL,
                                className: 'button1Style button30Style',
                            }}
                                onClick={this.toggleFilter}>
                            </Button>
                        </li>
                        <li>
                            <Button inputProps={{
                                name: 'btnClear',
                                label: this.strings.CONTROLS.CLEAR_LABEL,
                                className: 'button3Style button30Style',
                            }}
                                onClick={this.clearSelection} >
                            </Button>
                        </li>
                        <li>
                            <a href="javascript:void(0)" className="ripple-effect search-btn"
                                data-toggle="dropdown"> {this.strings.CONTROLS.ACTION_LABEL} </a>
                            <a href="javascript:void(0)"
                                className="ripple-effect dropdown-toggle caret2"
                                data-toggle="dropdown" >
                                <span>
                                    <img src={this.siteURL + "/static/images/caret-white.png"} />
                                </span>
                            </a>
                            <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                <li>
                                    <ul>
                                        <li>
                                            <a href="javascript:void(0)"
                                                onClick={() => browserHistory.replace('/contact/new')}> {this.strings.CONTROLS.NEW_CONTACT} </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.modifyContact}>
                                                {this.strings.CONTROLS.MODIFY_CONTACT} </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.deleteContactClick}>
                                                {this.strings.CONTROLS.DELETE_CONTACT} </a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0)" onClick={this.toggleSetPassword}>
                                                {this.strings.CONTROLS.SET_PASSWORD_LABEL} </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>);
    }

    // Render Contact components
    render() {
        return (<div className="dash-right" > {this.renderHeader(this.strings)}
            <div className="clear"> </div>
            <ContactGrid strings={this.props.strings}
                hierarchyProps={{ ...this.props.hierarchyProps }}
                hideConfirmPopup={this.props.hideConfirmPopup}
                openConfirmPopup={this.props.openConfirmPopup}
                notifyToaster={this.props.notifyToaster}
                ref='grid' />
        </div>
        );
    }
}

export default ContactDisplay;