'use strict';

/******************************
 * Page for add/edit company/region/business unit
 * **************************** */

import React, { Component } from 'react';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import InkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

import CompanyTab from './tab_company';
import RegionTab from './tab_region';
import BusinessUnitTab from './tab_businessunit';
import SubscriptionTab from './tab_subscription';
import CompanyHeader from './company_header';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import CheckBox from '../../../../lib/core-components/CheckBox';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import CircularProgress from '../../../../lib/core-components/CircularProgress';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { getCompanyDetail } from '../../../../services/private/company';

class CompanyDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.companyName = '';
        this.shortCode = '';
        this.nextKey = null;
        this.state = {
            tabKey: 'tabCompanyDetail',
            isClicked: false,
            setHeaderInitialValue: false
        }
        this.commonCompanyProps = {
            businessCountryId: null,
            postalCountryId: null
        }

        this.compHeaderSchema = ['companyName', 'shortCode'];
        this.tabChanged = this.tabChanged.bind(this);
        this.tabChangeConfirmed = this.tabChangeConfirmed.bind(this);
        this.getCompanyHeader = this.getCompanyHeader.bind(this);
        this.updateInitialValue = this.updateInitialValue.bind(this);
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
        if (this.props.detail) {
            this.nextKey = key;
            this.commonCompanyProps = {
                businessCountryId: this.refs.companyDetailTab.company.BusinessCountryId,
                postalCountryId: this.refs.companyDetailTab.company.PostalCountryId
            }
            let payload = {
                confirmText: this.strings.SAVE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.tabChangeConfirmed
            };
            if ((this.state.tabKey == 'tabRegionDetail' && this.refs.regionDetailTab.state.addMode)
                || (this.state.tabKey == 'tabBusinessUnit' && this.refs.businessUnitTab.state.addMode)
                || (this.state.tabKey == 'tabCompanyDetail' && this.refs.companyDetailTab.checkSaveObj())) {
                this.props.openConfirmPopup(payload);
            }
            else {
                this.setState({ tabKey: key });
            }
        }
        else {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SAVE_COMPANY_VALIDATION });
        }
    }

    tabChangeConfirmed(key) {
        this.props.hideConfirmPopup();

        let _this = this;
        if (this.state.tabKey == 'tabCompanyDetail')
            this.refs.companyDetailTab.saveCompanyDetail().then(function (res) {
                if (res) {
                    _this.stateSet({ tabKey: _this.nextKey });
                }
            });
        else if (this.state.tabKey == 'tabRegionDetail' && this.refs.regionDetailTab.state.addMode) {
            this.refs.regionDetailTab.saveRegionDetail().then(function (res) {
                if (res) {
                    _this.stateSet({ tabKey: _this.nextKey });
                }
            });
        }
        else if (this.state.tabKey == 'tabBusinessUnit' && this.refs.businessUnitTab.state.addMode) {
            this.refs.businessUnitTab.saveBusinessDetail().then(function (res) {
                if (res) {
                    _this.stateSet({ tabKey: _this.nextKey });
                }
            });
        }
        else
            _this.stateSet({ tabKey: _this.nextKey });
    }

    getCompanyHeader() {
        
        let compHeader = Object.assign({},
            { companyName: this.refs.compHeader.companyName },
            { shortCode: this.refs.compHeader.shortCode });
        let isFormValid = isValidForm(this.compHeaderSchema, compHeader);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let compHeaderObj = getForm(this.compHeaderSchema, compHeader);
        return compHeaderObj;
    }

    updateInitialValue(companyName, shortCode) {
        this.companyName = companyName;
        this.shortCode = shortCode;
        this.stateSet({ setHeaderInitialValue: true });
    }

    // Render components
    render() {
        let tabProps = {
            strings: this.strings,
            detail: this.props.detail,
            notifyToaster: this.props.notifyToaster
        }
        let popupProps = {
            hideConfirmPopup: this.props.hideConfirmPopup,
            openConfirmPopup: this.props.openConfirmPopup
        }
        let strings = this.strings;
        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    <div className="cattle-text">
                        <span>{strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{strings.HELP_LABEL}</a>
                    </div>
                    {this.props.detail ?
                        this.state.setHeaderInitialValue ?
                            <CompanyHeader currentTab={this.state.tabKey} strings={strings}
                                companyName={this.companyName} shortCode={this.shortCode}
                                notifyToaster={this.props.notifyToaster}
                                isClicked={this.state.isClicked} ref="compHeader" detail={this.props.detail} /> :
                            null :
                        <CompanyHeader currentTab={this.state.tabKey} strings={strings}
                            companyName={this.companyName} shortCode={this.shortCode}
                            notifyToaster={this.props.notifyToaster}
                            isClicked={this.state.isClicked} ref="compHeader" detail={this.props.detail} />}

                    <div className="clear"></div>
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <InkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={strings.COMPANY_TAB_TITLE} key="tabCompanyDetail">
                            <CompanyTab {...tabProps} updateMode={this.props.updateMode}
                                updateInitialValue={this.updateInitialValue}
                                ref='companyDetailTab' getCompanyHeader={this.getCompanyHeader} />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={strings.REGION_TAB_TITLE} key="tabRegionDetail">
                            <RegionTab  {...tabProps} {...popupProps} {...this.commonCompanyProps}
                                ref="regionDetailTab" />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        <TabPane tab={strings.BUSINESSUNIT_TAB_TITLE} key="tabBusinessUnit">
                            <BusinessUnitTab  {...tabProps} {...popupProps} {...this.commonCompanyProps}
                                ref="businessUnitTab" />
                            <div className="clearfix">
                            </div>
                        </TabPane>
                        {/*<TabPane tab={strings.SUBSCRIPTION_TAB_TITLE} key="tabSubscription">
                            <SubscriptionTab  {...tabProps}
                                ref="subscriptionTab" />
                            <div className="clearfix">
                            </div>
                        </TabPane>*/}
                    </Tabs>
                </div>
                <div className="clear"></div>
            </div>
        );
    }
}

export default CompanyDetail;