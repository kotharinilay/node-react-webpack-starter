'use strict';

/**************************
 * Detail page for setup property type
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import ColorPicker from '../../../../lib/core-components/ColorPicker';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../shared/format/string';
import { savePropertyType as savePropertyTypeDetail, getPropertyTypeModifyDetails } from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class PropertyTypeDetail extends Component {
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
            dataFetch: false,
            propertyColor: { color: '#FF0000', alpha: 35 }
        }

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.propertytypeData = null;
        this.propertytypeSchema = ['propertytypeName', 'propertytypeCode'];
        this.savePropertyType = this.savePropertyType.bind(this);
        this.onBack = this.onBack.bind(this);
        this.colorChange = this.colorChange.bind(this);
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
            return getPropertyTypeModifyDetails(this.props.detail).then(function (res) {
                let propertyColor = { ..._this.state.propertyColor };
                if (res.success) {
                    _this.propertytypeData = res.data;
                    if (res.data.ColorCode != null && res.data.ColorCode.color && res.data.ColorCode.alpha)
                        propertyColor = { color: res.data.ColorCode.color, alpha: res.data.ColorCode.alpha }
                }
                else if (res.badRequest) {
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
                _this.stateSet({ dataFetch: true, propertyColor: propertyColor });
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
        return savePropertyTypeDetail(obj).then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                    _this.stateSet({ key: new Date() })
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
    savePropertyType(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.propertytypeSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });

            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.propertytypeSchema, this.refs);
        obj.ColorCode = this.state.propertyColor;
        if (!this.addMode) {
            obj.propertytypeId = this.props.detail;
            obj.auditId = this.propertytypeData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/propertytype');
    }

    colorChange(colorObj) {
        this.setState({ propertyColor: { color: colorObj.color, alpha: colorObj.alpha } });
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
                            <form autoComplete="off" className="form-cover" onSubmit={this.savePropertyType}>
                                {this.props.detail != 'new' ?
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'systemCode',
                                                disabled: true,
                                                hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                            }}
                                                maxLength={10} initialValue={this.propertytypeData ? this.propertytypeData.SystemCode : ''}
                                                isClicked={this.state.isClicked} ref="systemCode" />
                                        </div>
                                    </div> : null}
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'propertytypeCode',
                                            hintText: this.strings.CONTROLS.PROPERTYTYPE_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.PROPERTYTYPE_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.propertytypeData ? this.propertytypeData.PropertyTypeCode : ''}
                                            eReq={this.strings.CONTROLS.PROPERTYTYPE_CODE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="propertytypeCode" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'propertytypeName',
                                            hintText: this.strings.CONTROLS.PROPERTYTYPE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.PROPERTYTYPE_LABEL
                                        }}
                                            maxLength={50} initialValue={this.propertytypeData ? this.propertytypeData.PropertyTypeName : ''}
                                            eReq={this.strings.CONTROLS.PROPERTYTYPE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="propertytypeName" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <ColorPicker color={this.state.propertyColor.color}
                                            alpha={this.state.propertyColor.alpha}
                                            changeHandler={this.colorChange} />
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
                                redirectUrl={!this.addMode ? '/adminsetup/propertytype' : null}
                                onClick={this.savePropertyType} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default PropertyTypeDetail;