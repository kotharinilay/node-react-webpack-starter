'use strict';

/**************************
 * Detail page for setup Unit of Measure Conversion
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { bufferToUUID } from '../../../../../shared/uuid';
import { isUUID } from '../../../../../shared/format/string';
import {
    saveUomConversion as saveUomConversionDetail, getUomConversionModifyDetails,
    getAllUoM
} from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class UomConversionDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: new Date(),
            isClicked: false,
            dupFromUomerror: null,
            dupToUomerror: null,
            dataSource: {},
            dataFetch: false
        }

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.uomConversionData = null;
        this.uomConversionSchema = ['fromUom', 'fromUomValue', 'toUom', 'toUomValue'];
        this.saveUomConversion = this.saveUomConversion.bind(this);
        this.onBack = this.onBack.bind(this);
        this.matchToUom = this.matchToUom.bind(this);
        this.matchFromUom = this.matchFromUom.bind(this);
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
        return getAllUoM().then(function (res) {
            if (res.success) {
                if (_this.addMode) {
                    _this.stateSet({ dataSource: res.data, dataFetch: true });
                }
                else {
                    return getUomConversionModifyDetails(_this.props.detail).then(function (uomRes) {
                        if (uomRes.success) {                        
                            _this.uomConversionData = uomRes.data;
                        }
                        else if (uomRes.badRequest) {
                            _this.props.notifyToaster(NOTIFY_ERROR, { message: uomRes.error, strings: _this.strings });
                        }
                        _this.stateSet({ dataSource: res.data, dataFetch: true });
                    });
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Handle button click for add/edit
    handleAddEdit(obj) {
        let _this = this;
        return saveUomConversionDetail(obj).then(function (res) {
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
                _this.stateSet({ error: _this.strings[res.error] })
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Handle save button click
    saveUomConversion(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.uomConversionSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        if (this.state.dupFromUomerror || this.state.dupToUomerror) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.SAME_CONVERSION_UOM_ERROR });
            return false;
        }
        let obj = getForm(this.uomConversionSchema, this.refs);
        if (!this.addMode) {
            obj.uomConversionId = this.props.detail;
            obj.auditId = this.uomConversionData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/uomconversion');
    }

    matchToUom(value) {
        if (value == this.refs.toUom.state.value) {
            this.setState({
                dupFromUomerror: this.strings.SAME_CONVERSION_UOM_ERROR
            });
            return false;
        }
        else if (this.state.dupFromUomerror || this.state.dupToUomerror) {
            this.setState({
                dupFromUomerror: null,
                dupToUomerror: null
            });
        }
    }

    matchFromUom(value) {
        if (value == this.refs.fromUom.state.value) {
            this.setState({
                dupToUomerror: this.strings.SAME_CONVERSION_UOM_ERROR
            });
            return false;
        }
        else if (this.state.dupFromUomerror || this.state.dupToUomerror) {
            this.setState({
                dupFromUomerror: null,
                dupToUomerror: null
            });
        }
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
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveUomConversion}>                             
                                 <div className="col-md-12">
                                    <div className="col-md-6">
                                        <div className="row">
                                            <NumberInput inputProps={{
                                            name: 'fromUomValue',
                                            hintText: this.strings.CONTROLS.FROMUOM_VALUE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.FROMUOM_VALUE_LABEL                                            
                                        }}
                                            initialValue={this.uomConversionData ? this.uomConversionData.FromUoMValue.toString() : null}
                                            maxLength={10} numberType="decimal"
                                            eReq={this.strings.CONTROLS.FROMUOM_VALUE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="fromUomValue" />                                        
                                        </div>   
                                        <div className="row">
                                       <Dropdown inputProps={{
                                            name: 'fromUom',
                                            hintText: this.strings.CONTROLS.FROMUOM_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.FROMUOM_PLACEHOLDER,
                                            value: this.uomConversionData ? bufferToUUID(this.uomConversionData.FromUoMId) : null
                                        }}
                                            eClientValidation={this.matchToUom}
                                            eReq={this.strings.CONTROLS.FROMUOM_REQ_MESSAGE}
                                            textField="NameCode" valueField="Id" dataSource={this.state.dataSource}
                                            isClicked={this.state.isClicked} ref="fromUom" />
                                        <span className={(this.state.dupFromUomerror != null) ? 'error-message' : 'hidden'}>{this.state.dupFromUomerror}</span>
                                    </div>                                           
                                    </div>  
                                <div className="col-md-6">
                                     <div className="row">
                                        <NumberInput inputProps={{
                                            name: 'toUomValue',
                                            hintText: this.strings.CONTROLS.TOUOM_VALUE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.TOUOM_VALUE_LABEL,                                            
                                        }}
                                            initialValue={this.uomConversionData ? this.uomConversionData.ToUoMValue.toString() : null}
                                            maxLength={10} numberType="decimal"
                                            eReq={this.strings.CONTROLS.TOUOM_VALUE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="toUomValue" />
                                    </div>
                                    <div className="row">
                                        <Dropdown inputProps={{
                                            name: 'toUom',
                                            hintText: this.strings.CONTROLS.TOUOM_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.TOUOM_PLACEHOLDER,
                                            value: this.uomConversionData ? bufferToUUID(this.uomConversionData.ToUoMId) : null
                                        }}
                                            eClientValidation={this.matchFromUom}
                                            eReq={this.strings.CONTROLS.TOUOM_REQ_MESSAGE}
                                            textField="NameCode" valueField="Id" dataSource={this.state.dataSource}
                                            isClicked={this.state.isClicked} ref="toUom" />
                                        <span className={(this.state.dupToUomerror != null) ? 'error-message' : 'hidden'}>{this.state.dupToUomerror}</span>
                                    </div>                                   
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
                                redirectUrl={!this.addMode ? '/adminsetup/uomconversion' : null}
                                onClick={this.saveUomConversion} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default UomConversionDetail;