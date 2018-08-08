'use strict';

/**************************
 * Detail page for setup chemical product
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import ChemicalProductTab from './chemicalproduct_tabcomponent';
import StockTab from './stock_tabcomponent';
import Button from '../../../../../lib/core-components/Button';
import BusyButton from '../../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../../shared/format/string';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import {
    saveChemicalProduct as saveChemicalProductDetail,
    getChemicalProductModifyDetails
} from '../../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
require('rc-tabs/assets/index.css');

class ChemicalProductDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            isClicked: false,
            dataFetch: false,
            tabKey: 'tabChemicalProduct'
        }

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.chemicalproductData = null;
        this.chemicalproductSchema = ['chemicalproductName', 'chemicalproductCode', 'chemicalcategory', 'species', 'disposalNotes'];
        this.saveChemicalProduct = this.saveChemicalProduct.bind(this);
        this.onBack = this.onBack.bind(this);
        this.tabChanged = this.tabChanged.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Get data to load components
    componentWillMount() {
        this.mounted = true;
        if (!this.addMode && !isUUID(this.props.detail)) {
            this.onBack();
        }
        let _this = this;
        if (this.addMode) {
            _this.setState({ dataFetch: true });
        }
        else {
            return getChemicalProductModifyDetails(this.props.detail).then(function (chemicalproductRes) {
                if (chemicalproductRes.success) {
                    _this.chemicalproductData = Object.keys(chemicalproductRes.data[0]).map(function (k) { return chemicalproductRes.data[0][k] });
                    _this.chemicalproductData[0].Species = JSON.parse(_this.chemicalproductData[0].Species);
                    _this.chemicalproductESIData = Object.keys(chemicalproductRes.data[1]).map(function (k) { return chemicalproductRes.data[1][k] });
                    _this.chemicalproductWHPData = Object.keys(chemicalproductRes.data[2]).map(function (k) { return chemicalproductRes.data[2][k] });
                    _this.chemicalproductStockData = Object.keys(chemicalproductRes.data[3]).map(function (k) { return chemicalproductRes.data[3][k] });
                }
                else if (chemicalproductRes.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: chemicalproductRes.error, strings: _this.strings });
                }
                _this.stateSet({ dataFetch: true });
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    // Handle button click for add/edit
    handleAddEdit(obj) {
        let _this = this;
        return saveChemicalProductDetail(obj).then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.MODIFY_SUCCESS });
                }
                return true;
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Handle save button click
    saveChemicalProduct(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.chemicalproductSchema, this.refs.chemicalProductTab.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        // get data for chemicalproduct
        let chemicalProductObj = getForm(this.chemicalproductSchema, this.refs.chemicalProductTab.refs);
        chemicalProductObj.configuredByAdmin = 1;

        // get data for chemical product esi
        let chemicalProductESIObj = this.refs.chemicalProductTab.refs.ESITab ?
            this.refs.chemicalProductTab.refs.ESITab.state.ESIData : [];
        // get data for chemical product whp
        let chemicalProductWHPObj = this.refs.chemicalProductTab.refs.WHPTab ?
            this.refs.chemicalProductTab.refs.WHPTab.state.WHPData : [];
        // get data for chemical product stock
        let chemicalProductStockObj = this.refs.stockTab ? this.refs.stockTab.gridData : [];
        if (!this.addMode) {
            chemicalProductObj.chemicalproductId = this.props.detail;
            chemicalProductObj.auditId = this.chemicalproductData[0].AuditLogId;
        }
        let finalObj = {
            chemicalproduct: chemicalProductObj,
            chemicalproductstock: chemicalProductStockObj,
            chemicalproductesi: chemicalProductESIObj,
            chemicalproductwhp: chemicalProductWHPObj
        }

        return this.handleAddEdit(finalObj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/setup/chemicalproduct');
    }

    // Render form components
    renderForm() {
        if (this.state.dataFetch) {
            return (<div className="setup-main">
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span></span>
                                <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                            </div>
                            <div className="clear" />
                            <Tabs
                                activeKey={this.state.tabKey}
                                onChange={this.tabChanged}
                                renderTabBar={() => <ScrollableInkTabBar />}
                                renderTabContent={() => <TabContent animated={false} />} >
                                <TabPane tab={this.strings.CHEMICAL_PRODUCT_TAB_LABEL} key="tabChemicalProduct">
                                    <ChemicalProductTab strings={this.strings} detail={this.props.detail}
                                        isClicked={this.state.isClicked} notifyToaster={this.props.notifyToaster}
                                        ref='chemicalProductTab'
                                        chemicalProduct={this.chemicalproductData ? this.chemicalproductData[0] : null}
                                        chemicalProductESI={this.chemicalproductESIData}
                                        chemicalProductWHP={this.chemicalproductWHPData} />
                                </TabPane>
                                <TabPane tab={this.strings.STOCK_TAB_LABEL} key="tabStock">
                                    <StockTab strings={{ ...this.strings.STOCK, COMMON: this.strings.COMMON }}
                                        ref="stockTab" notifyToaster={this.props.notifyToaster}
                                        chemicalProductStock={this.chemicalproductStockData} />
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                    <div className="clear"></div>
                </div>
            </div>
            );
        }
        else {
            return <div className="setup-main"><LoadingIndicator /></div>;
        }
    }

    // Render components
    render() {
        let title = this.strings.ADD_TITLE;
        if (!this.addMode) {
            title = this.strings.MODIFY_TITLE;
        }
        return (
            <div>
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head setup-head"> <span>{title}</span> </div>
                        <div className="l-stock-top-btn setup-top">
                            <Button
                                inputProps={{
                                    name: 'btnBack',
                                    label: 'Cancel',
                                    className: 'button1Style button30Style mr10'
                                }}
                                onClick={this.onBack} ></Button>
                            <BusyButton
                                inputProps={{
                                    name: 'btnSave',
                                    label: 'Save',
                                    className: 'button2Style button30Style'
                                }}
                                loaderHeight={25}
                                redirectUrl='/setup/chemicalproduct'
                                onClick={this.saveChemicalProduct} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default ChemicalProductDetail;