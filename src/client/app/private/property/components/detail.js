'use strict';

/**************************
 * Detail page for property (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import DetailTabs from './detail_tabs';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';

class Detail extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.addMode = (this.props.detail == 'new');
        this.strings = this.props.strings;

        this.savePropertyClick = this.savePropertyClick.bind(this);
        this.validateNLISCredentials = this.validateNLISCredentials.bind(this);
        this.retrieveErpStatus = this.retrieveErpStatus.bind(this);
        this.saveAndRetrieveStatus = this.saveAndRetrieveStatus.bind(this);
        this.onBack = this.onBack.bind(this);
    }

    // Back to display page
    onBack() {
        browserHistory.replace('/property');
    }

    savePropertyClick() {
        return this.refs.detail.savePropertyClick();
    }

    validateNLISCredentials() {
        return this.refs.detail.validateNLISCredentials();
    }

    retrieveErpStatus() {
        return this.refs.detail.retrieveErpStatus();
    }

    saveAndRetrieveStatus() {
        return this.refs.detail.savePropertyClick(true);
    }

    // Render header area of component
    renderHeader() {
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{this.addMode ? this.strings.ADD_TITLE : this.strings.MODIFY_TITLE}</span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnBack',
                                    label: this.strings.CONTROLS.BACK_LABEL,
                                    className: 'button1Style button30Style'
                                }}
                                onClick={this.onBack} ></Button>
                        </li>
                        <li>
                            <BusyButton
                                inputProps={{
                                    name: 'btnSave',
                                    label: this.strings.CONTROLS.SAVE_LABEL,
                                    className: 'button2Style button30Style ripple-effect search-btn'
                                }}
                                loaderHeight={25}
                                redirectUrl='/property'
                                onClick={this.savePropertyClick} ></BusyButton>
                            <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                            <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                <li>
                                    <ul>
                                        <li><a href="javascript:void(0)" onClick={this.validateNLISCredentials}>Validate NLIS Credentials</a>
                                        </li>
                                        <li><a href="javascript:void(0)" onClick={this.retrieveErpStatus}>Retrieve Status from NLIS</a>
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

    // Render component
    render() {
        return (
            <div className="dash-right">
                {this.renderHeader()}
                <div className="clear"></div>
                <DetailTabs strings={this.strings} redirectUrl="/property"
                    onBack={this.onBack}
                    detail={this.props.detail}
                    hierarchyProps={{ ...this.props.hierarchyProps }}
                    hideConfirmPopup={this.props.hideConfirmPopup}
                    openConfirmPopup={this.props.openConfirmPopup}
                    notifyToaster={this.props.notifyToaster} ref='detail' />
                <div className="clear"></div>
            </div>
        );
    }

}

export default Detail;