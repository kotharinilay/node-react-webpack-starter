'use strict';

/**************************
 * Detail page for setup livestock colour
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../shared/format/string';
import { saveLivestockColour as saveLivestockColourDetail, getLivestockColourModifyDetails } from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class LivestockColourDetail extends Component {
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
        this.livestockcolourData = null;
        this.livestockcolourSchema = ['livestockcolourName', 'livestockcolourCode'];
        this.saveLivestockColour = this.saveLivestockColour.bind(this);
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
            return getLivestockColourModifyDetails(this.props.detail).then(function (res) {
                if (res.success) {
                    _this.livestockcolourData = res.data;
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
        return saveLivestockColourDetail(obj).then(function (res) {
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
    saveLivestockColour(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.livestockcolourSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });

            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.livestockcolourSchema, this.refs);
        obj.configuredByAdmin = 1;
        if (!this.addMode) {
            obj.livestockcolourId = this.props.detail;
            obj.auditId = this.livestockcolourData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/livestockcolour');
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
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveLivestockColour}>
                                {this.props.detail != 'new' ?
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'systemCode',
                                                disabled: true,
                                                hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                            }}
                                                maxLength={10} initialValue={this.livestockcolourData ? this.livestockcolourData.SystemCode : ''}
                                                isClicked={this.state.isClicked} ref="systemCode" />
                                        </div>
                                    </div> : null}
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'livestockcolourCode',
                                            hintText: this.strings.CONTROLS.LIVESTOCKCOLOUR_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.LIVESTOCKCOLOUR_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.livestockcolourData ? this.livestockcolourData.LivestockColourCode : ''}
                                            eReq={this.strings.CONTROLS.LIVESTOCKCOLOUR_CODE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="livestockcolourCode" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'livestockcolourName',
                                            hintText: this.strings.CONTROLS.LIVESTOCKCOLOUR_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.LIVESTOCKCOLOUR_LABEL
                                        }}
                                            maxLength={50} initialValue={this.livestockcolourData ? this.livestockcolourData.LivestockColourName : ''}
                                            eReq={this.strings.CONTROLS.LIVESTOCKCOLOUR_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="livestockcolourName" />
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
                                redirectUrl={!this.addMode ? '/adminsetup/livestockcolour' : null}
                                onClick={this.saveLivestockColour} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default LivestockColourDetail;