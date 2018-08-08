'use strict';

/**************************
 * Detail page for setup accreditation program
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../shared/format/string';
import { saveAccreditationProgram as saveAccreditationProgramDetail, getAccreditationProgramModifyDetails } from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class AccreditationProgramDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: new Date(),
            isClicked: false,
            error: null,
            dataSource: {},
            dataFetch: false
        }

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.accreditationprogramData = null;
        this.accreditationprogramSchema = ['accreditationprogramName', 'accreditationprogramCode', 'isActive'];
        this.saveAccreditationProgram = this.saveAccreditationProgram.bind(this);
        this.onBack = this.onBack.bind(this);
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
            return getAccreditationProgramModifyDetails(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.accreditationprogramData = res.data;
                }
                else if (res.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
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

    // Handle button click for add/edit
    handleAddEdit(obj) {
        let _this = this;
        return saveAccreditationProgramDetail(obj).then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                    _this.stateSet({ key: new Date() });
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
    saveAccreditationProgram(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.accreditationprogramSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.accreditationprogramSchema, this.refs);
        obj.isActive = obj.isActive || false;
        if (!this.addMode) {
            obj.accreditationprogramId = this.props.detail;
            obj.auditId = this.accreditationprogramData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/accreditationprogram');
    }

    // Render form components
    renderForm() {
        if (this.state.dataFetch) {
            return (<div className="setup-main" key={this.state.key}>
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span>{this.strings.DESCRIPTION}</span>
                                <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                            </div>
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveAccreditationProgram}>
                                {this.props.detail != 'new' ?
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'systemCode',
                                                disabled: true,
                                                hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                            }}
                                                maxLength={10}
                                                initialValue={this.accreditationprogramData ? this.accreditationprogramData.SystemCode : ''}
                                                isClicked={this.state.isClicked} ref="systemCode" />
                                        </div>
                                    </div> : null}
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'accreditationprogramCode',
                                            hintText: this.strings.CONTROLS.ACCREDITATIONPROGRAM_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.ACCREDITATIONPROGRAM_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.accreditationprogramData ? this.accreditationprogramData.AccreditationProgramCode : ''}
                                            eReq={this.strings.CONTROLS.ACCREDITATIONPROGRAM_CODE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="accreditationprogramCode" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'accreditationprogramName',
                                            hintText: this.strings.CONTROLS.ACCREDITATIONPROGRAM_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.ACCREDITATIONPROGRAM_LABEL
                                        }}
                                            maxLength={50} initialValue={this.accreditationprogramData ? this.accreditationprogramData.AccreditationProgramName : ''}
                                            eReq={this.strings.CONTROLS.ACCREDITATIONPROGRAM_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="accreditationprogramName" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <ToggleSwitch inputProps={{
                                            label: 'Keep Active',
                                            labelPosition: "right",
                                            name: 'isActive',
                                        }}
                                            initialValue={this.accreditationprogramData && this.accreditationprogramData.IsActive == 1 ? true : false}
                                            isClicked={this.state.isClicked} ref="isActive" />
                                    </div>
                                </div>

                                <div className="clear"></div>
                            </form>
                        </div>
                    </div>
                    <div className="clear"></div>
                </div>
            </div>);
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
                                redirectUrl={!this.addMode ? '/adminsetup/accreditationprogram' : null}
                                onClick={this.saveAccreditationProgram} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default AccreditationProgramDetail;