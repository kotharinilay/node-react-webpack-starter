'use strict';

/**************************
 * Display page for contact
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import SetPassword from './set_password';
import Grid from '../../../../lib/core-components/Grid';
import ConfirmPopup from '../../../../lib/core-components/ConfirmationPopup';
import Button from '../../../../lib/core-components/Button';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import Dropdown from '../../../../lib/core-components/Dropdown';

import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

import { getForm } from '../../../../lib/wrapper-components/FormActions';
import { deleteContactRecords } from '../../../../services/private/contact';
import { formatDateTime } from '../../../../../shared/format/date';

class ContactGrid extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.selectedId = null;
        this.filterSchema = ['stateFilter', 'isPrivate', 'isActive']

        this.state = {
            columns: [
                { field: 'Id', isKey: true, displayName: 'Contact Id' },
                { field: 'Id', width: '35px', isSort: false, displayName: '', isExpand: true, formatter: this.expander.bind(this), visible: true },
                { field: 'AuditLogId', displayName: 'AuditLog Id' },
                { field: 'Name', displayName: 'Name', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Email', displayName: 'Email', visible: true },
                { field: 'Mobile', displayName: 'Mobile No', visible: true },
                { field: 'UserName', displayName: 'User Name', visible: true },
                { field: 'IsActive', displayName: 'Active', visible: true, format: 'activecolformat' }
            ],
            subColumns: [
                { field: 'UUID', isKey: true, isSort: false, displayName: 'Property Id' },
                { field: 'PIC', displayName: 'PIC', visible: true },
                { field: 'Name', displayName: 'Property Name', visible: true },
                { field: 'Suburb', displayName: 'Suburb', visible: true },
                { field: 'Role', displayName: 'Role', visible: true },
                { field: 'ValidFromDate', displayName: 'ValidFromDate' },
                { field: 'ValidToDate', displayName: 'ValidToDate' },
                { field: '', displayName: 'Period', visible: true, formatter: this.formatPeriod },
            ],
            displayFilter: false,
            isClicked: false,
            filterObj: {
                companyId: this.props.companyId ||
                (this.props.hierarchyProps.isSiteAdmin == 0 ? this.props.hierarchyProps.companyId : undefined)
            },
            clearKey: new Date(),
            refreshGrid: new Date(),
            openSetPassword: false
        }

        this.strings = this.props.strings;
        //this.deleteContactClick = this.deleteContactClick.bind(this);
        this.deleteContact = this.deleteContact.bind(this);
        //this.modifyContact = this.modifyContact.bind(this);
        this.clearSelection = this.clearSelection.bind(this);

        this.rowClickId = [];
        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
        this.expandClick = this.expandClick.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleSetPassword = this.toggleSetPassword.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
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

    // Perform delete operation for selected contact
    deleteContact() {
        this.props.hideConfirmPopup();

        let selectedRows = this.refs.contactGrid.selectedRows;

        let uuids = [];
        let auditLogIds = [];

        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        let _this = this;
        deleteContactRecords(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.DELETE_SUCCESS });
                _this.refs.contactGrid.refreshDatasource();
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Clear grid selection
    clearSelection() {
        this.refs.contactGrid.cleanSelected();
    }

    // apply filter on grid data
    applyFilter() {
        let obj = getForm(this.filterSchema, this.refs);
        let hierarchyValues = this.refs.hierarchy.getValues();
        let filterObj = {};
        obj.stateFilter ? filterObj['st.Id'] = obj.stateFilter : null;
        this.refs.isPrivate.fieldStatus.dirty ? filterObj['c.IsPrivate'] = (obj.isPrivate ? 1 : 0) : null;
        this.refs.isActive.fieldStatus.dirty ? filterObj['c.IsActive'] = (obj.isActive ? 1 : 0) : null;
        if (hierarchyValues) {
            hierarchyValues.companyId ? filterObj['c.CompanyId'] = hierarchyValues.companyId : null;
            hierarchyValues.regionId ? filterObj['RegionId'] = hierarchyValues.regionId : null;
            hierarchyValues.businessId ? filterObj['BusinessId'] = hierarchyValues.businessId : null;
        }
        if (Object.keys(filterObj).length < 1)
            this.stateSet({
                filterObj: filterObj,
                refreshGrid: new Date()
            });
        else
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.SEARCH_WARNING });
    }

    // clear filter on grid data and display all data
    clearFilter() {
        this.stateSet({
            clearKey: new Date(), refreshGrid: new Date(),
            filterObj: {
                companyId: this.props.companyId ||
                (this.props.hierarchyProps.isSiteAdmin == 0 ? this.props.hierarchyProps.companyId : undefined)
            }
        });
    }

    toggleSetPassword(isOpen) {
        if (!isOpen) {
            this.refs.contactGrid.cleanSelected();
            this.setState({ openSetPassword: isOpen });
        }
        else {
            if (gridActionNotify(this.strings, this.props.notifyToaster, this.refs.contactGrid.selectedRows.length, true, true)) {
                this.selectedId = this.refs.contactGrid.selectedRows[0].Id;
                this.setState({ openSetPassword: isOpen });
            }
        }
    }

    formatPeriod(cell, row) {
        if (row.ValidFromDate && row.ValidToDate) {
            let fromDate = formatDateTime(row.ValidFromDate).ShortDate;
            let toDate = formatDateTime(row.ValidToDate).ShortDate;
            return `${fromDate} to ${toDate}`;
        }
        return '';
    }

    toggleFilter() {
        let displayFilter = this.state.displayFilter;
        this.setState({ displayFilter: !displayFilter });
    }

    /*--------- Bind nested grid start --------------*/
    // Return for bind nested grid
    expandableRow(row) {
        return this.rowClickId.includes(row.Id);
    }

    // Bind nested grid
    expandComponent(row) {
        let gridProps = {
            selectRowMode: 'none',
            maxHeight: "170px",
            functionName: 'user/accessiblepics',
            columns: this.state.subColumns,
            filterObj: row.Id
        }
        return (<Grid {...gridProps} />);
    }

    // Display expand/collapse icons
    expander(cell, row) {
        let imgPath = this.siteURL + "/static/images/";
        let expandClick = () => this.expandClick(cell);
        return <div onClick={expandClick}>
            <img src={this.rowClickId.includes(row.Id) ? imgPath + "collapse.png" : imgPath + "expand.png"} />
        </div>;
    }

    // Handle icons click by id
    expandClick(cell) {
        let index = this.rowClickId.indexOf(cell);
        if (index != -1)
            this.rowClickId.splice(index, 1);
        else
            this.rowClickId.push(cell);
    }

    renderContent(strings) {
        let gridProps = {
            ...this.state,
            functionName: 'contact/getdataset',
            expandBy: 'column',
            clickToExpand: true,
            formatter: this.expander,
            expandClick: this.expandClick,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            columnVisible: true
        }

        return (<div className="stock-list">
            <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                <div className="livestock-content">
                    <div className="cattle-text">
                        <span>{strings.DESCRIPTION}</span>
                        <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{strings.HELP_LABEL}</a>
                    </div>
                    <div className="clear"></div>
                    <Grid ref="contactGrid" {...gridProps} key={this.state.refreshGrid} />
                </div>
                {this.renderFilter(strings)}
            </div>
        </div>);
    }

    renderFilter(strings) {
        return (
            <div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
                key={this.state.clearKey}>
                <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                    {strings.FILTER_LABEL}
                    <div className="f-close" onClick={this.toggleFilter}>
                        <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                    </div>
                </h2>
                <CompanyHierarchy
                    inputProps={{
                        id: this.props.companyId || null,
                        name: null,
                        type: this.props.companyId ? 'C' : null
                    }}
                    {...this.props.hierarchyProps}
                    companyDisabled={this.props.companyId ? true : false}
                    propertyVisible={false} companyReq={false} businessReq={false}
                    isClicked={this.state.isClicked} strings={{ ...strings.COMMON }} ref="hierarchy" />
                <div className="livestoct-status">
                    <div className="form-group">
                        <ToggleSwitch inputProps={{
                            label: strings.CONTROLS.FILTER_PRIVATE_LABEL,
                            labelPosition: "right",
                            name: 'isPrivate',
                            defaultToggled: this.state.filterObj.isPrivate ? this.state.filterObj.isPrivate : false,
                            style: { float: 'left', width: '50%' }
                        }}
                            isClicked={this.state.isClicked} ref="isPrivate" />
                        <ToggleSwitch inputProps={{
                            label: strings.CONTROLS.FILTER_ACTIVE_LABEL,
                            labelPosition: "right",
                            name: 'isActive',
                            defaultToggled: this.state.filterObj.isActive ? this.state.filterObj.isActive : false,
                            style: { width: '50%' }
                        }}
                            isClicked={this.state.isClicked} ref="isActive" />
                    </div>
                </div>
                <div className="f-btn">
                    <a onClick={this.applyFilter} className="ripple-effect filter-btn">
                        {strings.CONTROLS.APPLY_FILTER_LABEL}
                    </a>
                </div>
                <div className="f-btn">
                    <a onClick={this.clearFilter} className="ripple-effect filter-btn">
                        {strings.CONTROLS.CLEAR_FILTER_LABEL}
                    </a>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderContent(this.strings)}
                <div className="clear"></div>
                {this.state.openSetPassword ?
                    <SetPassword
                        notifyToaster={this.props.notifyToaster}
                        strings={{ ...this.strings.SET_PASSWORD, COMMON: this.strings.COMMON }}
                        toggleSetPassword={this.toggleSetPassword} selectedId={this.selectedId} />
                    : null}
            </div>
        );
    }
}

export default ContactGrid;