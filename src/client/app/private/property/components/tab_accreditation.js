'use strict';

/**************************
 * add/update tab for Accreditation
 * **************************** */

import React, { Component } from 'react';
import { map } from 'lodash';
import Input from '../../../../lib/core-components/Input';
import Dropdown from '../../../../lib/core-components/Dropdown';
import DatetimePicker from '../../../../lib/core-components/DatetimePicker';
import Multipicker from '../../../../lib/core-components/Multipicker';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { accreditationStatus } from '../../../../../shared/constants';
import { getDataOnAccreditation } from '../../../../services/private/property';
import { getForm } from '../../../../lib/wrapper-components/FormActions';

class AccreditationTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.stateData = this.props.AccreditationData ? this.props.AccreditationData.stateData : [];
        this.accreditationData = this.props.AccreditationData ? this.props.AccreditationData.data : [];

        this.state = {
            dataFetch: this.props.detail == 'new' ? false : true
        }

        this.setNLIS = true;
        this.renderForm = this.renderForm.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    // Get data on mount
    componentWillMount() {
        this.mounted = true;
        if (this.props.detail == 'new') {
            let _this = this;
            getDataOnAccreditation().then(function (res) {
                if (res.success) {
                    _this.stateData = res.data.state;
                    _this.accreditationData = res.data.accreditation;
                    _this.stateSet({ dataFetch: true });
                }
                else if (res.badRequest) {
                    _this.stateSet({ dataFetch: true });
                    _this.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR);
                _this.stateSet({ dataFetch: true });
            });
        }
    }

    // Return the values object of this tab
    getValues() {
        let returnObj = [];
        this.accreditationData.map((d, i) => {
            let schema = ["Status_" + d.Name, 'LicenseNumber_' + d.Name, "State_" + d.Name, "ExpiryDate_" + d.Name, "Description_" + d.Name];
            let form = getForm(schema, this.refs);
            let obj = {
                AccreditationProgramId: d.Id,
                IsActive: form['Status_' + d.Name] == 1 ? null : (form['Status_' + d.Name] == 2 ? true : false),
                LicenseNumber: form['LicenseNumber_' + d.Name],
                StateId: form['State_' + d.Name].toString(),
                ExpiryDate: form['ExpiryDate_' + d.Name],
                Notes: form['Description_' + d.Name]
            };
            if (obj.IsActive || obj.LicenseNumber || obj.StateId || obj.ExpiryDate || obj.Notes)
                returnObj.push(obj);
        });
        return {
            data: returnObj,
            deletedData: [],
            updateAccreditationDB: true
        };
    }

    componentDidUpdate() {
        this.setNLIS = false;
    }

    // Render form
    renderForm() {
        let NLISStatus = this.props.NLISStatus;
        return (
            <div>
                {this.accreditationData.map((d, i) => {
                    let index = i + d.SystemCode;
                    if (this.setNLIS && NLISStatus && d.SystemCode == NLISStatus.ProgramCode) {
                        index = index + Math.random();
                        d.Notes = NLISStatus.Description;
                        d.IsActive = (NLISStatus.StatusCode == 'A' ? 2 : 1);
                    }
                    return (<div key={index} className="mt25 mb5">
                        <div className="col-md-12">
                            {d.Name + " (" + d.Code + ")"}
                        </div>
                        <div className="col-md-6 dropdown-input">
                            <Input inputProps={{
                                name: 'licenseNumber_' + d.Name,
                                hintText: this.strings.LICENSE_NUMBER_PLACEHOLDER,
                                floatingLabelText: this.strings.LICENSE_NUMBER_LABEL
                            }}
                                maxLength={50}
                                initialValue={d.LicenseNumber}
                                isClicked={this.props.isClicked} ref={"LicenseNumber_" + d.Name} />
                        </div>
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'status_' + d.Name,
                                floatingLabelText: this.strings.STATUS_LABEL,
                                value: d.IsActive == null ? 1 : (d.IsActive == 1 ? 2 : 3)
                            }}
                                textField="Text" valueField="Value" dataSource={accreditationStatus}
                                isClicked={this.props.isClicked} ref={"Status_" + d.Name} />
                        </div>
                        <div className="col-md-6">
                            <Multipicker inputProps={{
                                name: 'state_' + d.Name,
                                placeholder: this.strings.STATE_PLACEHOLDER,
                                label: this.strings.STATE_LABEL,
                                defaultValue: d.StateId || []
                            }}
                                textField="StateName" valueField="Id"
                                dataSource={this.stateData}
                                isClicked={this.props.isClicked} ref={"State_" + d.Name} />
                        </div>
                        <div className="col-md-6">
                            <DatetimePicker inputProps={{
                                name: 'expiryDate_' + d.Name,
                                placeholder: this.strings.EXPIRY_DATE_PLACEHOLDER,
                                label: this.strings.EXPIRY_DATE_LABEL
                            }}
                                defaultValue={d.ExpiryDate ? new Date(d.ExpiryDate) : ''}
                                isClicked={this.props.isClicked} ref={"ExpiryDate_" + d.Name} />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'description_' + d.Name,
                                hintText: this.strings.DESCRIPTION_PLACEHOLDER,
                                floatingLabelText: this.strings.DESCRIPTION_LABEL
                            }}
                                maxLength={250} multiLine={true} rows={3}
                                initialValue={d.Notes}
                                isClicked={this.props.isClicked} ref={"Description_" + d.Name} />
                        </div>
                        <div className="clear"></div>
                    </div>
                    );
                })}
            </div>
        );
    }

    // Render component
    render() {
        if (this.state.dataFetch) {
            if (this.accreditationData.length > 0)
                return (this.renderForm());
            else
                return (<div>No details found to display.</div>);
        }
        else {
            return <div className="col-md-12"><LoadingIndicator onlyIndicator={true} /></div>;
        }

    }
}

export default AccreditationTab;