'use strict';

/**************************
 * add/update tab for Access
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, uniq } from 'lodash';

import Grid from '../../../../lib/core-components/Grid';
import { getPropertyAccessList } from '../../../../services/private/property';
import { formatDateTime } from '../../../../../shared/format/date';
import { userRole } from '../../../../../shared/index';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

class AccessTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.updateEnclosureDB = false;  // Use this flag for edit mode at server side
        this.state = {
            accessData: this.props.AccessData ? this.props.AccessData : [],
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Id' },
                { field: 'Name', displayName: 'Contact Name', visible: true },
                { field: 'Role', displayName: 'Designation', visible: true },
                { field: 'CompanyName', displayName: 'Company', visible: true },
                { field: 'ValidFromDate', displayName: 'Period', visible: true, formatter: this.displayPeriod.bind(this) }
            ]
        }

        this.companyId = null;
        this.getValues = this.getValues.bind(this);
        this.hierarchyChange = this.hierarchyChange.bind(this);
        this.getAccessList = this.getAccessList.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // Set data of enclosure
    componentWillMount() {
        this.mounted = true;
        if (this.props.detail == 'new') {
            let { companyId, regionId, businessId, id } = this.props.getHierarchyDetails();
            this.getAccessList(companyId, regionId, businessId, id);
        }
    }

    // Update grid on change of company hierarchy
    hierarchyChange(companyId, regionId, businessId, id) {
        this.getAccessList(companyId, regionId, businessId, id);
    }

    // Get list of contact for access
    getAccessList(companyId, regionId, businessId, id) {
        this.companyId = id;
        let _this = this;
        getPropertyAccessList(companyId, regionId, businessId, this.props.detail == 'new' ? null : this.props.detail).then(function (res) {
            if (res.success) {
                let selectedRow = [];
                let selectedObj = [];
                res.data.map((row) => {
                    if (row.Role != userRole.normalUser || row.Role == userRole.externalUser) {
                        selectedRow.push(row['Id']);
                        selectedObj.push({ Id: row['Id'] });
                    }
                });
                _this.refs.accessGrid.setSelected(selectedRow, selectedObj, selectedRow);
                _this.stateSet({ accessData: res.data });
            }
            else if (res.badRequest) {
                _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentDidMount() {
        if (this.state.accessData.length > 0) {
            let unSelectedRow = [];
            let selectedRow = [];
            let selectedObj = [];
            this.state.accessData.map((row) => {
                if (row.PropertyAccessId) {
                    selectedRow.push(row['Id']);
                    selectedObj.push({ Id: row['Id'] });
                    if (row.Role != userRole.normalUser || row.Role == userRole.externalUser) {
                        unSelectedRow.push(row['Id']);
                    }
                }
            });
            this.refs.accessGrid.setSelected(selectedRow, selectedObj, unSelectedRow);
        }
    }

    // Return tab values to add/edit
    getValues(isCompanyChanged = false) {
        let deletedData = [];
        let insertedData = [];
        let selectedData = this.refs.accessGrid.state.selected;
        if (this.props.AccessData) {
            this.props.AccessData.map(d => {
                if (isCompanyChanged && d.PropertyAccessId && d.IsExternal != 1) {
                    // if company hierarchy changed then delete all records and do not delete external user
                    deletedData.push(d.PropertyAccessId);
                }
                else if (isCompanyChanged && d.PropertyAccessId && d.IsExternal == 1 && this.companyId == d.CompanyId) {
                    // if selected company and external user's company are same then delete external user
                    deletedData.push(d.PropertyAccessId);
                }
                else {
                    let data = selectedData.includes(d.Id);
                    if (d.PropertyAccessId && d.IsExternal != 1 && !data) {
                        deletedData.push(d.PropertyAccessId);
                    }
                    else if (!d.PropertyAccessId && d.IsExternal != 1 && data) {
                        insertedData.push(d.Id);
                    }
                }
            });
            if (isCompanyChanged) {
                // if company hierarchy changed then...
                selectedData.map(id => {
                    let data = this.props.AccessData.find(d => {
                        if (d.Id == id && d.IsExternal == 1)
                            return d;
                    });
                    if (!data) {
                        // insert all but do not insert external user
                        insertedData.push(id);
                    }
                    else if (this.companyId == data.CompanyId) {
                        // if selected company and external user's company are same...
                        // then insert external user as new entry with IsExternal = 0
                        insertedData.push(id);
                    }
                });
            }
        }
        else {
            insertedData = selectedData;
        }
        return {
            data: uniq(insertedData),
            deletedData: uniq(deletedData),
            defaultAccessData: false
        };
    }

    // Display access period
    displayPeriod(cell, row) {
        if (row.ValidFromDate && row.ValidToDate) {
            return <div>
                {formatDateTime(row.ValidFromDate).ShortDate} to {formatDateTime(row.ValidToDate).ShortDate}
            </div>
        }
        else {
            return <div>N/A</div>;
        }
    }

    // Render component
    render() {
        let gridProps = {
            pagination: false,
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.state.accessData
        }
        return (
            <div className="col-md-12">
                <Grid {...gridProps} ref="accessGrid" />
            </div>
        );
    }
}

export default AccessTab;