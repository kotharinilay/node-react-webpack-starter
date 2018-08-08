'use strict';

/**************************
 * Detail page for setup enclosure type (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../shared/format/string';
import { saveEnclosureType, getEnclosureTypeDetail } from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class EnclosureTypeDetail extends Component {
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
        this.enclosureTypeData = null;
        this.enclosureTypeSchema = ['enclosureTypeName', 'enclosureTypeCode'];
        this.saveEnclosureType = this.saveEnclosureType.bind(this);
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
            return getEnclosureTypeDetail(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.enclosureTypeData = res.data;
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
        return saveEnclosureType(obj, true).then(function (res) {
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
    saveEnclosureType(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.enclosureTypeSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.enclosureTypeSchema, this.refs);
        if (!this.addMode) {
            obj.enclosureTypeId = this.enclosureTypeData.Id;
            obj.auditId = this.enclosureTypeData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/enclosuretype');
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
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveEnclosureType}>
                                {this.props.detail != 'new' ?
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'systemCode',
                                                disabled: true,
                                                hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                            }}
                                                maxLength={10} initialValue={this.enclosureTypeData ? this.enclosureTypeData.SystemCode : ''}
                                                isClicked={this.state.isClicked} ref="systemCode" />
                                        </div>
                                    </div> : null}
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'enclosureTypeCode',
                                            hintText: this.strings.CONTROLS.ENCLOSURETYPE_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.ENCLOSURETYPE_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.enclosureTypeData ? this.enclosureTypeData.EnclosureTypeCode : ''}
                                            eReq={this.strings.CONTROLS.ENCLOSURETYPE_CODE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="enclosureTypeCode" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'enclosureTypeName',
                                            hintText: this.strings.CONTROLS.ENCLOSURETYPE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.ENCLOSURETYPE_LABEL
                                        }}
                                            maxLength={50} initialValue={this.enclosureTypeData ? this.enclosureTypeData.EnclosureTypeName : ''}
                                            eReq={this.strings.CONTROLS.ENCLOSURETYPE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="enclosureTypeName" />
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
                                redirectUrl={!this.addMode ? '/adminsetup/enclosuretype' : null}
                                onClick={this.saveEnclosureType} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default EnclosureTypeDetail;