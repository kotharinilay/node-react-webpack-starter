'use strict';

/**************************
 * Display page for setup species
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { map, remove, pull, difference } from 'lodash';

import BusyButton from '../../../../lib/wrapper-components/BusyButton';

import { notifyToaster } from '../../../common/actions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

import { saveCompanySpecies, getCompanySpecies } from '../../../../services/private/usersetup';

import TabCompany from './tab_company';
import TabRegion from './tab_region';
import TabBusiness from './tab_business';
import TabProperty from './tab_property';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

class Species extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.addMode = true;
        this.state = {
            dataChanged: Math.random(),
            tabKey: 'tabCompany'
        }

        this.strings = this.props.strings;

        this.species = [];
        this.region = [];
        this.business = [];
        this.property = [];

        this.resultData = {
            company: [],
            region: [],
            business: [],
            property: []
        }

        this.renderTab = this.renderTab.bind(this);
        this.saveSpecies = this.saveSpecies.bind(this);
        this.resetSpecies = this.resetSpecies.bind(this);

        this.updateResult = this.updateResult.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // Get company species records on page load
    componentWillMount() {
        this.mounted = true;
        if (this.props.isSuperUser && this.props.companyId)
            this.initialState();
        else
            browserHistory.replace('/dashboard');
    }

    // Reset/Init load company species records
    initialState() {
        let _this = this;
        return getCompanySpecies().then(function (res) {
            if (res.success) {
                _this.resultData = res.data.resultData;
                _this.species = res.data.species;

                res.data.region.map(r => {
                    let obj = { ...r, expandData: [] };
                    _this.species.map(d => {
                        if (!_this.resultData.company.includes(d.Id))
                            obj.expandData.push({ ...d, RegionId: obj.Id });
                    });
                    _this.region.push(obj);
                });

                res.data.business.map(r => {
                    let obj = { ...r, expandData: [] };
                    let regionObj = _this.resultData.region.find(x => x.Region == obj.RegionId && x.Id.length > 0);
                    _this.species.map(d => {
                        if (!_this.resultData.company.includes(d.Id) && (!regionObj || !regionObj.Id.includes(d.Id)))
                            obj.expandData.push({ ...d, RegionId: obj.RegionId, BusinessId: obj.Id });
                    });
                    _this.business.push(obj);
                });

                res.data.property.map(r => {
                    let obj = { ...r, expandData: [] };
                    let regionObj = _this.resultData.region.find(x => x.Region == obj.RegionId && x.Id.length > 0);
                    let businessObj = _this.resultData.business.find(x => x.Business == obj.BusinessId && x.Id.length > 0);
                    _this.species.map(d => {
                        if (!_this.resultData.company.includes(d.Id) && (!regionObj || !regionObj.Id.includes(d.Id)) && (!businessObj || !businessObj.Id.includes(d.Id)))
                            obj.expandData.push({ ...d, RegionId: obj.RegionId, BusinessId: obj.BusinessId, PropertyId: obj.Id });
                    });
                    _this.property.push(obj);
                });

                _this.addMode = _this.resultData.company.length == 0;
                _this.stateSet({ dataChanged: Math.random() });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Update selected data base on selected grid row
    updateResult(selectedRow, row, isSelected = false, id = null, isCompany = false, isRegion = false, isBusiness = false, isProperty = false) {
        if (isCompany) {

            let obj = map(this.species, 'Id');
            this.resultData.company = difference(obj, map(selectedRow, 'Id'));

            this.region.map(r => {
                r.expandData = [];
                this.species.map(d => {
                    if (!this.resultData.company.includes(d.Id))
                        r.expandData.push({ ...d, RegionId: r.Id });
                });
            });
            if (!isSelected) {
                if (row.Id)
                    this.resultData.region.map(r => r.Id = pull(r.Id, row.Id));
                else
                    this.resultData.region = [];
            }

            this.business.map(r => {
                r.expandData = [];
                let obj = this.resultData.region.find(x => x.Region == r.RegionId && x.Id.length > 0);
                this.species.map(d => {
                    if (!this.resultData.company.includes(d.Id) && (!obj || !obj.Id.includes(d.Id)))
                        r.expandData.push({ ...d, RegionId: r.RegionId, BusinessId: r.Id });
                });
            });
            if (!isSelected) {
                if (row.Id)
                    this.resultData.business.map(r => r.Id = pull(r.Id, row.Id));
                else
                    this.resultData.business = [];
            }

            this.property.map(r => {
                let regionObj = this.resultData.region.find(x => x.Region == r.RegionId && x.Id.length > 0);
                let obj = this.resultData.business.find(x => x.Business == r.BusinessId && x.Id.length > 0);
                r.expandData = [];
                this.species.map(d => {
                    if (!this.resultData.company.includes(d.Id) && (!regionObj || !regionObj.Id.includes(d.Id)) && (!obj || !obj.Id.includes(d.Id)))
                        r.expandData.push({ ...d, RegionId: r.RegionId, BusinessId: r.BusinessId, PropertyId: r.Id });
                });
            });
            if (!isSelected) {
                if (row.Id)
                    this.resultData.property.map(r => r.Id = pull(r.Id, row.Id));
                else
                    this.resultData.property = [];
            }

        }
        else if (isRegion) {

            let obj = this.resultData.region.find(x => x.Region == id && x.Id.length > 0);

            if (isSelected && obj) {
                if (row.Id)
                    remove(obj.Id, (id) => { return id == row.Id; });
                else {
                    let objIndex = this.resultData.region.findIndex(x => x.Region == id && x.Id.length > 0);
                    this.resultData.region.splice(objIndex, 1);
                }
            }
            else {
                if (obj)
                    row.Id ? obj.Id.push(row.Id) : obj.Id = map(row, 'Id');
                else
                    this.resultData.region.push({ Region: id, Id: row.Id ? [row.Id] : map(row, 'Id') });
            }

            this.business.map(r => {
                if (r.RegionId == id) {
                    let obj = this.resultData.region.find(x => x.Region == id && x.Id.length > 0);
                    r.expandData = [];
                    this.species.map(d => {
                        if (!this.resultData.company.includes(d.Id) && (!obj || !obj.Id.includes(d.Id)))
                            r.expandData.push({ ...d, RegionId: r.RegionId, BusinessId: r.Id });
                    });
                }
            });
            if (!isSelected) {
                if (row.Id) {
                    this.resultData.business.map(r => {
                        if (r.Region == id) {
                            let obj = this.resultData.region.find(x => x.Region == id && x.Id.length > 0);
                            if (obj)
                                r.Id = pull(r.Id, row.Id);
                        }
                    });
                }
                else {
                    this.resultData.business = [];
                }
            }

            this.property.map(r => {
                if (r.RegionId == id) {
                    let regionObj = this.resultData.region.find(x => x.Region == id && x.Id.length > 0);
                    let obj = this.resultData.business.find(x => x.Business == r.BusinessId && x.Id.length > 0);
                    r.expandData = [];
                    this.species.map(d => {
                        if (!this.resultData.company.includes(d.Id) && (!regionObj || !regionObj.Id.includes(d.Id)) && (!obj || !obj.Id.includes(d.Id)))
                            r.expandData.push({ ...d, RegionId: r.RegionId, BusinessId: r.BusinessId, PropertyId: r.Id });
                    });
                }
            });
            if (!isSelected) {
                if (row.Id) {
                    this.resultData.property.map(r => {
                        if (r.Region == id) {
                            let obj = this.resultData.region.find(x => x.Region == id && x.Id.length > 0);
                            if (obj)
                                r.Id = pull(r.Id, row.Id);
                        }
                    });
                }
                else {
                    this.resultData.property = [];
                }
            }

        }
        else if (isBusiness) {

            let obj = this.resultData.business.find(x => x.Business == id && x.Id.length > 0);

            if (isSelected && obj) {
                if (row.Id)
                    remove(obj.Id, (id) => { return id == row.Id });
                else {
                    let objIndex = this.resultData.business.findIndex(x => x.Business == id && x.Id.length > 0);
                    this.resultData.business.splice(objIndex, 1);
                }
            }
            else {
                if (obj)
                    row.Id ? obj.Id.push(row.Id) : obj.Id = map(row, 'Id');
                else
                    this.resultData.business.push({ Business: id, Region: row.RegionId, Id: row.Id ? [row.Id] : map(row, 'Id') });
            }

            this.property.map(r => {
                if (r.BusinessId == id) {
                    let obj = this.resultData.business.find(x => x.Business == id && x.Id.length > 0);
                    r.expandData = [];
                    this.species.map(d => {
                        if (!this.resultData.company.includes(d.Id) && (!obj || !obj.Id.includes(d.Id)))
                            r.expandData.push({ ...d, RegionId: r.RegionId, BusinessId: r.BusinessId, PropertyId: r.Id });
                    });
                }
            });
            if (!isSelected) {
                if (row.Id) {
                    this.resultData.property.map(r => {
                        if (r.Business == id) {
                            let obj = this.resultData.business.find(x => x.Business == id && x.Id.length > 0);
                            if (obj)
                                r.Id = pull(r.Id, row.Id);
                        }
                    });
                }
                else {
                    this.resultData.property = [];
                }
            }

        }
        else if (isProperty) {
            let obj = this.resultData.property.find(x => x.Property == id && x.Id.length > 0);

            if (isSelected && obj) {
                if (row.Id)
                    remove(obj.Id, (id) => { return id == row.Id });
                else {
                    let objIndex = this.resultData.property.findIndex(x => x.Property == id && x.Id.length > 0);
                    this.resultData.property.splice(objIndex, 1);
                }
            }
            else {
                if (obj)
                    row.Id ? obj.Id.push(row.Id) : obj.Id = map(row, 'Id');
                else
                    this.resultData.property.push({ Property: id, Business: row.BusinessId, Region: row.RegionId, Id: row.Id ? [row.Id] : map(row, 'Id') });
            }
        }

        remove(this.resultData.region, (d) => { return d.Id.length == 0 });
        remove(this.resultData.business, (d) => { return d.Id.length == 0 });
        remove(this.resultData.property, (d) => { return d.Id.length == 0 });

        this.stateSet({ dataChanged: Math.random() });
    }

    // Perform save operation for selected company species
    saveSpecies() {

        let finalObj = [];
        if (this.resultData.company.length == this.species.length) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SELECT_ONE_SPECIES });
            return false;
        }

        this.resultData.company.map(d => {
            finalObj.push({
                CompanyId: this.props.companyId,
                SpeciesId: d
            });
        });

        this.resultData.region.map(d => {
            d.Id.map(id => {
                finalObj.push({
                    CompanyId: this.props.companyId,
                    RegionId: d.Region,
                    SpeciesId: id
                });
            });
        });

        this.resultData.business.map(d => {
            d.Id.map(id => {
                finalObj.push({
                    CompanyId: this.props.companyId,
                    RegionId: d.Region,
                    BusinessId: d.Business,
                    SpeciesId: id
                });
            });
        });

        this.resultData.property.map(d => {
            d.Id.map(id => {
                finalObj.push({
                    CompanyId: this.props.companyId,
                    RegionId: d.Region,
                    BusinessId: d.Business,
                    PropertyId: d.Property,
                    SpeciesId: id
                });
            });
        });

        let _this = this;
        return saveCompanySpecies(finalObj).then(function (res) {
            if (res.success) {
                let msg = _this.addMode ? _this.strings.ADD_SUCCESS : _this.strings.MODIFY_SUCCESS;
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: msg });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Reset company species
    resetSpecies() {
        this.species = [];
        this.region = [];
        this.business = [];
        this.property = [];
        this.resultData = {
            company: [],
            region: [],
            business: [],
            property: []
        };
        return this.initialState();
    }

    // Render tab of content area
    renderTab() {
        let tabProps = {
            notifyToaster: this.props.notifyToaster
        }
        return (
            <Tabs
                activeKey={this.state.tabKey}
                onChange={(key) => this.setState({ tabKey: key })}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent animated={false} />} >
                <TabPane tab={this.strings.TAB_COMPANY_LABEL} key="tabCompany">
                    <TabCompany data={{ species: this.species, resultData: this.resultData }}
                        strings={{ COMMON: this.strings.COMMON }}
                        updateResult={this.updateResult}
                        {...tabProps} ref="tabCompany" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_REGION_LABEL} key="tabRegion">
                    <TabRegion data={{ region: this.region, resultData: this.resultData }}
                        strings={{ COMMON: this.strings.COMMON }}
                        updateResult={this.updateResult}
                        {...tabProps} ref="tabRegion" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_BUSINESS_LABEL} key="tabBusiness">
                    <TabBusiness data={{ business: this.business, resultData: this.resultData }}
                        strings={{ COMMON: this.strings.COMMON }}
                        updateResult={this.updateResult}
                        {...tabProps} ref="tabBusiness" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_PROPERTY_LABEL} key="tabProperty">
                    <TabProperty data={{ property: this.property, resultData: this.resultData }}
                        strings={{ COMMON: this.strings.COMMON }}
                        updateResult={this.updateResult}
                        {...tabProps} ref="tabProperty" />
                    <div className="clearfix">
                    </div>
                </TabPane>
            </Tabs >
        );
    }

    // Render component
    render() {
        return (
            <div>
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head setup-head"> <span>{this.strings.TITLE}</span> </div>
                        <div className="l-stock-top-btn setup-top">
                            <ul>
                                <li>
                                    <BusyButton
                                        inputProps={{
                                            name: 'btnAddNew',
                                            label: this.strings.CONTROLS.SAVE_LABEL,
                                            className: 'button1Style button30Style',
                                        }}
                                        loaderHeight={25}
                                        onClick={this.saveSpecies}
                                    ></BusyButton>
                                </li>
                                <li>
                                    <BusyButton
                                        inputProps={{
                                            name: 'btnClear',
                                            label: this.strings.CONTROLS.CLEAR_LABEL,
                                            className: 'button3Style button30Style',
                                        }}
                                        loaderHeight={25}
                                        onClick={this.resetSpecies}
                                    ></BusyButton>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="setup-main">
                    <div className="stock-list">
                        <div className="stock-list-cover">
                            <div className="livestock-content">
                                <div className="cattle-text">
                                    <span>{this.strings.DESCRIPTION}</span>
                                    <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                                </div>
                                <div className="clear"></div>
                                {this.renderTab()}
                            </div>
                        </div>
                        <div className="clear"></div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        companyId: state.authUser.CompanyId,
        isSuperUser: state.authUser.IsSuperUser
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
)(Decorator('UserSetupSpecies', Species));