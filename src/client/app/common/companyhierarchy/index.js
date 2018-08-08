'use strict';

/******************************************
 * Company Hierarchy 
 ******************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dropdown from '../../../lib/core-components/Dropdown';
import { getCompanyHierarchy, getCompanyHierarchyIds } from '../../../services/private/common';

class CompanyHierarchy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataFetch: false,

            companyDisabled: this.props.companyDisabled || false,
            regionDisabled: false,
            businessReq: this.props.refBusinessReq || this.props.businessReq,

            company: this.props.isSiteAdmin == 1 ? null : this.props.companyName,
            region: null,
            business: null,
            property: null,

            companyId: this.props.refCompanyId || (this.props.isSiteAdmin == 1 ? null : this.props.companyId),
            regionId: null,
            businessId: null,
            propertyId: null,

            companyData: [],
            regionData: [],
            businessData: [],
            propertyData: []
        }

        this.companyChange = this.companyChange.bind(this);
        this.regionChange = this.regionChange.bind(this);
        this.businessChange = this.businessChange.bind(this);
        this.propertyChange = this.propertyChange.bind(this);
    }

    componentWillMount() {
        let { propertyId = null, id = null, name = null, type = null, property = null } = this.props.inputProps;
        let _this = this;
        this.bindHierarchy(id, name, type == 'C', type == 'R', type == 'B', propertyId, property, true);
    }

    // Bind company hierarchy
    bindHierarchy(value = null, text = null, isCompany = false, isRegion = false, isBusiness = false, propertyId = null, property = null, init = false) {
        let companyId = isCompany ? value : this.state.companyId;
        let regionId = isCompany ? null : (isRegion ? value : this.state.regionId);
        let businessId = isCompany ? null : (isRegion ? null : (isBusiness ? value : this.state.businessId));

        let company = isCompany ? text : this.state.company;
        let region = isCompany ? null : (isRegion ? text : this.state.region);
        let business = isCompany ? null : (isRegion ? null : (isBusiness ? text : this.state.business));

        let _this = this;
        if (init && value) {
            getCompanyHierarchyIds(value).then(function (result) {
                if (result.success) {
                    companyId = result.companyId;
                    regionId = result.regionId;
                    businessId = result.businessId;

                    company = result.company;
                    region = result.region;
                    business = result.business;
                }
                _this.getCompanyHierarchyData(companyId, regionId, businessId, company, region, business, property, propertyId, init);
            });
        }
        else {
            this.getCompanyHierarchyData(companyId, regionId, businessId, company, region, business, property, propertyId, init);
        }

    }

    // Get company hierarchy data and set it in state
    getCompanyHierarchyData(companyId, regionId, businessId, company, region, business, property, propertyId, init) {

        if (this.props.hierarchyChange && init)
            this.props.hierarchyChange(companyId, regionId, businessId, businessId || regionId || companyId);

        let _this = this;
        return getCompanyHierarchy(companyId, regionId, businessId, init ? this.props.regionDisabled : 0).then(function (res) {
            if (res.success) {
                let businessReq = _this.props.refBusinessReq || (regionId && _this.props.businessReq ? true : false);
                _this.setState({
                    dataFetch: true,
                    companyId: companyId, regionId: regionId, businessId: businessId,
                    company: company, region: region, business: business, property: property, propertyId: propertyId,
                    companyData: res.company, regionData: res.region,
                    businessData: res.business, propertyData: res.property, businessReq: businessReq,
                    companyDisabled: _this.props.companyDisabled || res.isCompanyDisabled, regionDisabled: res.isRegionDisabled
                });
                return true;
            }
        });
    }

    // Handle onChange of company dropdown
    companyChange(value, text) {
        if (this.state.companyId != value) {
            this.bindHierarchy(value, text, true);
            if (this.props.hierarchyChange)
                this.props.hierarchyChange(value, null, null, value);
        }
    }

    // Handle onChange of region dropdown
    regionChange(value, text) {
        if (this.state.regionId != value) {
            this.bindHierarchy(value, text, false, true);
            if (this.props.hierarchyChange)
                this.props.hierarchyChange(this.state.companyId, value, null, value);
        }
    }

    // Handle onChange of business dropdown
    businessChange(value, text) {
        if (this.state.businessId != value) {
            this.bindHierarchy(value, text, false, false, true);
            if (this.props.hierarchyChange)
                this.props.hierarchyChange(this.state.companyId, this.state.regionId, value, value);
        }
    }

    // Handle onChange of property dropdown
    propertyChange(value, text) {
        this.setState({ propertyId: value, property: text });
    }

    // return object of company hierarchy
    getValues() {
        let { companyId, regionId, businessId, propertyId, company, region, business, property, businessReq } = this.state;
        if (companyId == null || (businessReq && businessId == null))
            return false;
        return {
            companyId: companyId,
            regionId: regionId,
            businessId: businessId,
            propertyId: propertyId,
            id: businessId ? businessId : (regionId ? regionId : companyId),

            company: company,
            region: region,
            business: business,
            property: property,
            name: businessId ? business : (regionId ? region : company),

            type: businessId ? 'B' : (regionId ? 'R' : 'C')
        };
    }

    render() {
        let { strings } = this.props;
        let dataFetch = this.state.dataFetch;
        let companyHint = dataFetch ? strings.COMPANY_PLACEHOLDER : 'Loading...';
        let regionHint = dataFetch ? strings.REGION_PLACEHOLDER : 'Loading...';
        let businessHint = dataFetch ? strings.BUSINESS_PLACEHOLDER : 'Loading...';
        let propertyHint = dataFetch ? strings.PROPERTY_PLACEHOLDER : 'Loading...';

        return (
            <div className="form-group" key={this.state.dataFetch}>
                <div>
                    <Dropdown inputProps={{
                        name: 'company',
                        hintText: companyHint,
                        floatingLabelText: strings.COMPANY_LABEL,
                        value: this.state.companyId,
                        disabled: this.state.companyDisabled
                    }}
                        hideStar={!this.props.companyReq}
                        eClientValidation={this.props.companyValidate}
                        eReq={this.props.companyReq ? strings.COMPANY_REQ_MESSAGE : ''}
                        textField="Name" valueField="UUID" dataSource={this.state.companyData}
                        onSelectionChange={this.companyChange}
                        callOnChange={true}
                        isClicked={this.props.isClicked} ref="company" />
                </div>

                <div key={'region ' + this.state.companyId + this.state.businessReq}>
                    <Dropdown inputProps={{
                        name: 'region',
                        hintText: regionHint,
                        floatingLabelText: strings.REGION_LABEL,
                        value: this.state.regionId,
                        disabled: (this.state.companyId == null || this.state.regionDisabled)
                    }}
                        //eReq={this.props.regionReq ? strings.REGION_REQ_MESSAGE : ''}
                        textField="Name" valueField="UUID" dataSource={this.state.regionData}
                        onSelectionChange={this.regionChange}
                        callOnChange={true}
                        isClicked={this.props.isClicked} ref="region" />
                </div>
                <div key={'business ' + this.state.companyId + this.state.regionId + this.state.businessReq}>
                    <Dropdown inputProps={{
                        name: 'business',
                        hintText: businessHint,
                        disabled: this.state.companyId == null,
                        floatingLabelText: strings.BUSINESS_LABEL,
                        value: this.state.businessId
                    }}
                        hideStar={!this.state.businessReq}
                        eReq={this.state.businessReq ? strings.BUSINESS_REQ_MESSAGE : ''}
                        textField="Name" valueField="UUID" dataSource={this.state.businessData}
                        onSelectionChange={this.businessChange}
                        callOnChange={true}
                        isClicked={this.props.isClicked} ref="business" />
                </div>
                {this.props.propertyVisible ? <div key={'property ' + this.state.companyId + this.state.regionId + this.state.businessId}>
                    <Dropdown inputProps={{
                        name: 'property',
                        hintText: propertyHint,
                        disabled: this.state.companyId == null,
                        floatingLabelText: strings.PROPERTY_LABEL,
                        value: this.state.propertyId
                    }}
                        hideStar={!this.props.propertyReq}
                        eReq={this.props.propertyReq ? strings.PROPERTY_REQ_MESSAGE : ''}
                        textField="PIC" valueField="UUID" dataSource={this.state.propertyData}
                        onSelectionChange={this.propertyChange}
                        callOnChange={true}
                        isClicked={this.props.isClicked} ref="property" />
                </div> : null}

            </div>
        );
    }
}

// Define propTypes of CompanyHierarchy
CompanyHierarchy.propTypes = {
    companyName: React.PropTypes.string.isRequired,
    companyId: React.PropTypes.string.isRequired,
    isSiteAdmin: React.PropTypes.number.isRequired
}

// Define defaultProps of CompanyHierarchy
CompanyHierarchy.defaultProps = {
    inputProps: {},
    regionDisabled: 0,
    companyDisabled: false,
    companyReq: true,
    regionReq: false,
    businessReq: true,
    propertyReq: false,
    propertyVisible: true
}

export default CompanyHierarchy;