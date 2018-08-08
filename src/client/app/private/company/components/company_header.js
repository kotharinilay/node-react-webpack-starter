'use strict';

/**************************
 * header component to add/display company name and short code
 * **************************** */

import React, { Component } from 'react';
import Input from '../../../../lib/core-components/Input';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

import { checkDupName } from '../../../../services/private/company';

class CompanyHeader extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;

        this.strings = this.props.strings;
        this.companyName = null;
        this.shortCode = null;

        this.checkDupCompany = this.checkDupCompany.bind(this);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // check if company name already exists
    checkDupCompany(value) {
        let _this = this;
        return checkDupName(value, this.props.detail, 'C', this.props.detail).then(function (res) {
            if (res.success) {
                
                if (res.data) {
                    _this.companyName.fieldStatus.valid = false;
                    if (_this.mounted)
                        _this.companyName.setState({ error: _this.strings.DUPLICATE_COMPANY_VALIDATION, isLoading: false });
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_COMPANY_VALIDATION });
                }
                else {
                    _this.companyName.fieldStatus.valid = true;
                    if (_this.mounted)
                        _this.companyName.setState({ error: null, isLoading: false });
                }
            }
        });
    }

    render() {
        return (
            <div className="form-group">
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'companyName',
                            hintText: this.strings.CONTROLS.COMPANY_COMPANYNAME_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.COMPANY_COMPANYNAME_LABEL,
                            disabled: (this.props.currentTab == "tabCompanyDetail") ?
                                false : true
                        }}
                            onBlurInput={this.checkDupCompany}
                            eReq={this.strings.CONTROLS.COMPANY_COMPANYNAME_REQ_MESSAGE}
                            maxLength={250} initialValue={this.props.companyName}
                            isClicked={this.props.isClicked} ref={(compName) => { this.companyName = compName }} />
                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'shortCode',
                            hintText: this.strings.CONTROLS.COMPANY_SHORT_CODE_PLACEHOLDER,
                            floatingLabelText: this.strings.CONTROLS.COMPANY_SHORT_CODE_LABEL,
                            disabled: (this.props.currentTab == "tabCompanyDetail") ?
                                false : true
                        }}
                            eReq={this.strings.CONTROLS.COMPANY_SHORT_CODE_REQ_MESSAGE}
                            maxLength={20} initialValue={this.props.shortCode}
                            isClicked={this.props.isClicked} ref={(shortCode) => { this.shortCode = shortCode }} />
                    </div>
                </div>
            </div>
        );
    }
}

export default CompanyHeader;