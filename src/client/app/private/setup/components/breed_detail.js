'use strict';

/**************************
 * Detail page for setup breed (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Dropdown from '../../../../lib/core-components/Dropdown';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { isUUID } from '../../../../../shared/format/string';
import { saveBreed, getAllSpecies, getAllBreedType, getBreedDetail } from '../../../../services/private/setup';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class BreedDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: new Date(),
            isClicked: false,
            error: null,
            speciesData: [],
            dataFetch: false
        }

        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.breedData = null;
        this.breedSchema = ['species', 'breedType', 'breedName', 'breedCode'];
        this.saveBreed = this.saveBreed.bind(this);
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
        let objResponse = {};
        return Promise.all([
            getAllSpecies().then(function (res) {
                if (res.success) {
                    objResponse.speciesData = res.data;
                }
            }),
            getAllBreedType().then(function (res) {
                if (res.success) {
                    objResponse.breedTypeData = res.data;
                }
            })
        ]).then(function () {
            if (_this.addMode) {
                _this.stateSet({ speciesData: objResponse.speciesData, breedTypeData: objResponse.breedTypeData, dataFetch: true });
            }
            else {
                return getBreedDetail(_this.props.detail).then(function (breed) {
                    if (breed.success) {
                        _this.breedData = breed.data;
                        _this.stateSet({ speciesData: objResponse.speciesData, breedTypeData: objResponse.breedTypeData, dataFetch: true });
                    }
                    else if (breed.badRequest) {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: breed.error, strings: _this.strings });
                        _this.stateSet({ speciesData: [], breedTypeData: [], dataFetch: true });
                    }
                });
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
        return saveBreed(obj).then(function (res) {
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
    saveBreed(e) {
        e.preventDefault();

        let isFormValid = isValidForm(this.breedSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.breedSchema, this.refs);
        if (!this.addMode) {
            obj.breedId = this.breedData.Id;
            obj.auditId = this.breedData.AuditLogId;
        }
        return this.handleAddEdit(obj);
    }

    // Handle cancel button click
    onBack() {
        browserHistory.replace('/adminsetup/breed');
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
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveBreed}>
                                <div className="row">
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Dropdown inputProps={{
                                                name: 'species',
                                                hintText: this.strings.CONTROLS.SPECIES_PLACEHOLDER,
                                                value: this.breedData ? this.breedData.SpeciesId : null
                                            }}
                                                eReq={this.strings.CONTROLS.SPECIES_REQ_MESSAGE}
                                                textField="NameCode" valueField="Id" dataSource={this.state.speciesData}
                                                isClicked={this.state.isClicked} ref="species" />
                                        </div>
                                    </div>
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Dropdown inputProps={{
                                                name: 'breedType',
                                                hintText: this.strings.CONTROLS.BREEDTYPE_PLACEHOLDER,
                                                value: this.breedData && this.breedData.BreedTypeId ? this.breedData.BreedTypeId : null
                                            }}
                                                textField="NameCode" valueField="Id" dataSource={this.state.breedTypeData}
                                                isClicked={this.state.isClicked} ref="breedType" />
                                        </div>
                                    </div>
                                    {this.props.detail != 'new' ?
                                        <div className="form-group is-password">
                                            <div className="col-md-12">
                                                <Input inputProps={{
                                                    name: 'systemCode',
                                                    disabled: true,
                                                    hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                                    floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                                }}
                                                    maxLength={10} initialValue={this.breedData ? this.breedData.SystemCode : ''}
                                                    isClicked={this.state.isClicked} ref="systemCode" />
                                            </div>
                                        </div> : null}
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'breedCode',
                                                hintText: this.strings.CONTROLS.BREED_CODE_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.BREED_CODE_LABEL
                                            }}
                                                maxLength={10} initialValue={this.breedData ? this.breedData.BreedCode : ''}
                                                eReq={this.strings.CONTROLS.BREED_CODE_REQ_MESSAGE}
                                                isClicked={this.state.isClicked} ref="breedCode" />
                                        </div>
                                    </div>
                                    <div className="form-group is-password">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'breedName',
                                                hintText: this.strings.CONTROLS.BREED_PLACEHOLDER,
                                                floatingLabelText: this.strings.CONTROLS.BREED_LABEL
                                            }}
                                                maxLength={50} initialValue={this.breedData ? this.breedData.BreedName : ''}
                                                eReq={this.strings.CONTROLS.BREED_REQ_MESSAGE}
                                                isClicked={this.state.isClicked} ref="breedName" />
                                        </div>
                                    </div>
                                    <div className="clear"></div>
                                </div>
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
                                redirectUrl={!this.addMode ? '/adminsetup/breed' : null}
                                onClick={this.saveBreed} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default BreedDetail;