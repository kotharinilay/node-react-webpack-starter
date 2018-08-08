'use strict';

/******************************
 * Page for add/edit company parent
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from '../../../../lib/core-components/Button';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import CompanyDetail from './detail_company';
import ContactDetail from './detail_contact';
import PropertyDetail from './detail_property';

import { isUUID } from '../../../../../shared/format/string';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

class CompanyDetails extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            tabKey: 'tabCompany',
            companyId: this.props.detail == 'new' ? null : this.props.detail
        }
        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.tabChanged = this.tabChanged.bind(this);
        this.updateMode = this.updateMode.bind(this);
        //this.getCompanyHeaderData = this.getCompanyHeaderData.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // handle tab change event
    tabChanged(key) {
        if (isUUID(this.state.companyId))
            this.stateSet({ tabKey: key });
        else
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SAVE_COMPANY_VALIDATION });
    }

    // change add mode after first time company save and 
    // pass company id to all required child component
    updateMode(companyId) {
        this.stateSet({
            companyId: companyId
        });
    }

    // getCompanyHeaderData() {
    //     return {
    //         companyName: this.refs.companyTab.companyName,
    //         shortCode: this.refs.companyTab.shortCode
    //     }
    // }

    // Render form components
    renderForm() {
        let popupProps = {
            hideConfirmPopup: this.props.hideConfirmPopup,
            openConfirmPopup: this.props.openConfirmPopup
        }
        let commonProps = {
            notifyToaster: this.props.notifyToaster,
            detail: this.state.companyId,
            //getCompanyData: this.getCompanyHeaderData
        }
        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <InkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab='Company' key="tabCompany">
                            <CompanyDetail strings={this.strings} detail={this.state.companyId}
                                notifyToaster={this.props.notifyToaster} updateMode={this.updateMode}
                                ref='companyTab' {...popupProps} />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab='Contact' key="tabContact">
                            <ContactDetail ref="contactTab" strings={{
                                ...this.strings.CONTACT, CONTROLS: this.strings.CONTROLS,
                                COMMON: this.strings.COMMON
                            }} {...commonProps} {...popupProps} hierarchyProps={{ ...this.props.hierarchyProps }} />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab='PICs' key="tabProperty">
                            <PropertyDetail ref="propertyTab"
                                strings={{ ...this.strings.PROPERTY, COMMON: this.strings.COMMON }}
                                {...popupProps} {...commonProps} hierarchyProps={{ ...this.props.hierarchyProps }} />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }

    // Render header area of component
    renderHeader() {
        let title = this.strings.ADD_TITLE;
        if (!this.addMode) {
            title = this.strings.MODIFY_TITLE;
        }
        return (<div className="dash-right-top">
            <div className="live-detail-main">
                <div className="configure-head">
                    <span>{title}</span>
                </div>
                <div className="l-stock-top-btn">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnBack',
                                    label: this.strings.COMMON.BACK,
                                    className: 'button1Style button30Style'
                                }}
                                onClick={() => { browserHistory.replace('/company') }} ></Button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>);
    }

    // Render components
    render() {
        return (
            <div className="dash-right">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderForm()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default CompanyDetails;