'use strict';

/**************************
 * display assigned role to user
 * **************************** */

import React, { Component } from 'react';
import Grid from '../../../../lib/core-components/Grid';
import Input from '../../../../lib/core-components/Input';
import CheckBox from '../../../../lib/core-components/CheckBox';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { getBusinessRolesData, getRegionRolesData } from '../../../../services/private/contact';
import { userRole } from '../../../../../shared/index';

class RoleTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.regionRoleDDValues = [userRole.noAccess, userRole.regionManager, userRole.regionAsstManager];
        this.businessRoleDDValues = [userRole.noAccess, userRole.businessManager, userRole.businessAsstManager];
        this.initialBusinessRoleData = [];
        this.initialRegionRoleData = [];

        this.state = {
            dataFetch: false,
            regionColumns: [
                { field: 'RegionCompanyId', isKey: true, isSort: false, displayName: 'RegionCompanyId' },
                { field: 'RegionName', displayName: 'Region', visible: true, editable: false },
                { field: 'RoleName', displayName: 'Role', visible: true, editable: this.props.isProfile ? false : { type: 'select', options: { values: this.regionRoleDDValues } } }
            ],
            regionRoleData: [],
            businessColumns: [
                { field: 'BusinessCompanyId', isKey: true, isSort: false, displayName: 'BusinessCompanyId' },
                { field: 'BusinessName', displayName: 'Business Unit(s)', visible: true, editable: false },
                { field: 'RoleName', displayName: 'Role', visible: true, editable: this.props.isProfile ? false : { type: 'select', options: { values: this.businessRoleDDValues } } }
            ],
            businessRoleData: []
        }
        this.getGridData = this.getGridData.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        this.getGridData();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getGridData(companyId) {
        let _this = this;
        let objResponse = {};
        this.params = { contactId: this.props.detail, companyId: companyId || this.props.companyId };
        return Promise.all([
            getBusinessRolesData(_this.params).then(function (res) {
                if (res.success) {
                    objResponse.businessRoleData = res.data;
                    _this.initialBusinessRoleData = JSON.parse(JSON.stringify(res.data));
                }
            }),
            getRegionRolesData(_this.params).then(function (res) {
                if (res.success) {
                    objResponse.regionRoleData = res.data;
                    _this.initialRegionRoleData = JSON.parse(JSON.stringify(res.data));
                }
            })
        ]).then(function () {
            _this.stateSet({
                regionRoleData: objResponse.regionRoleData,
                businessRoleData: objResponse.businessRoleData,
                dataFetch: true
            });
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }


    renderForm() {
        let gridProps = {
            isRemoteData: false,
            selectRowMode: "none"
        }

        if (this.state.dataFetch) {
            return (
                <div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'email',
                            hintText: this.strings.CONTROLS.CONTACT_AGLIVEUSER_LABEL,
                            floatingLabelText: this.strings.CONTROLS.CONTACT_AGLIVEUSER_LABEL,
                            disabled: true
                        }}
                            maxLength={100} initialValue={this.props.contact.Email ? this.props.contact.Email : ''} />
                    </div>
                    <div className="clear"></div>

                    <div className="col-md-12 mt20">
                        <CheckBox inputProps={{
                            name: 'superUser',
                            label: this.strings.CONTROLS.CONTACT_SUPERUSER_LABEL,
                            defaultChecked: this.props.contact.IsSuperUser == 1 ? true : false,
                            disabled: this.props.isProfile ? true : false
                        }}
                            isClicked={this.props.isClicked} ref="isSuperUser" />
                    </div>
                    <div className="clear"></div>
                    <div className="col-md-6 mt20">
                        <label className="mb15">Region(s)</label>
                        <Grid ref="regionRoleGrid" columns={this.state.regionColumns}
                            height="300px" {...gridProps} gridData={this.state.regionRoleData}
                            cellEdit={{ mode: 'click', blurToSave: true }} />
                    </div>
                    <div className="col-md-6 mt20">
                        <label className="mb15">Business Unit(s)</label>
                        <Grid ref="businessColumnsRoleGrid" columns={this.state.businessColumns}
                            height="300px" {...gridProps} gridData={this.state.businessRoleData}
                            cellEdit={{ mode: 'click', blurToSave: true }} />
                    </div>
                    <div className="clear"></div>
                </div>
            );
        }
        else {
            return <LoadingIndicator onlyIndicator={true} />;
        }
    }

    render() {
        return (
            this.renderForm()
        );
    }
}

export default RoleTab;