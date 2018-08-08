'use strict';

/**************************
 * Detail page for setup species (Add/Edit)
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getSpeciesModifyDetails, saveSpecies } from '../../../../services/private/setup';
import { deleteFile, uploadFile } from '../../../../services/private/common';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { isUUID } from '../../../../../shared/format/string';
import { bufferToUUID } from '../../../../../shared/uuid';

class SpeciesDetail extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            key: new Date(),
            isClicked: false,
            error: null,
            dataFetch: false
        }

        this.addMode = (this.props.detail == 'new');
        let { strings } = this.props;
        this.strings = strings;
        this.specy = {};
        this.specy.indPicture = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        };
        this.specy.mobPicture = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        };
        this.specySchema = ['speciesName', 'speciesCode', 'systemCode'];
        this.pictureMaxSize = 2 * 1024 * 1024;
        this.saveSpecy = this.saveSpecy.bind(this);
        this.onBack = this.onBack.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        if (!this.addMode && !isUUID(this.props.detail)) {
            this.onBack();
        }
        let _this = this;
        if (!this.addMode) {
            getSpeciesModifyDetails(this.props.detail).then(function (res) {
                if (res.success) {

                    _this.specy = res.data;
                    _this.specy.indPicture = {
                        FileId: _this.specy.IndFileIconId ? bufferToUUID(_this.specy.IndFileIconId) : null,
                        FileName: _this.specy.IndPictureName || '',
                        MimeType: _this.specy.IndPictureType || '',
                        FilePath: _this.specy.IndPicturePath || ''
                    };
                    _this.specy.mobPicture = {
                        FileId: _this.specy.MobIconFileId ? bufferToUUID(_this.specy.MobIconFileId) : null,
                        FileName: _this.specy.MobPictureName || '',
                        MimeType: _this.specy.MobPictureType || '',
                        FilePath: _this.specy.MobPicturePath || ''
                    };

                    _this.stateSet({
                        dataFetch: true
                    });
                }
                else if (res.badRequest) {
                    _this.stateSet({
                        dataFetch: true
                    });
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
                }
            }).catch(function (err) {
                _this.stateSet({
                    dataFetch: true
                });
                _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.stateSet({
                dataFetch: true
            });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    saveSpecy(e) {
        e.preventDefault();

        let isFormValid = isValidForm(this.specySchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });

            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.specySchema, this.refs);
        let mobPicture = { mobPicture: this.refs.mobFile.getValues() };
        let indPicture = { indPicture: this.refs.indFile.getValues() };

        Object.assign(obj, mobPicture, indPicture);

        if (this.specy) {
            obj.speciesId = this.specy.Id;
            obj.auditId = this.specy.AuditLogId;
        }
        let _this = this;
        return saveSpecies(obj).then(function (ret) {
            if (ret.success) {
                if (_this.addMode) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.ADD_SUCCESS });
                    _this.stateSet({
                        key: new Date()
                    });
                }
                else {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.MODIFY_SUCCESS });
                }
                return true;
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    onBack() {
        browserHistory.replace('/adminsetup/species');
    }

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
                            <form autoComplete="off" className="form-cover" onSubmit={this.saveSpecy}>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'speciesCode',
                                            hintText: this.strings.CONTROLS.SPECIES_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.SPECIES_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.specy.Id ? this.specy.SpeciesCode : ''}
                                            eReq={this.strings.CONTROLS.SPECIES_CODE_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="speciesCode" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'speciesName',
                                            hintText: this.strings.CONTROLS.SPECIES_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.SPECIES_LABEL
                                        }}
                                            maxLength={50} initialValue={this.specy.Id ? this.specy.SpeciesName : ''}
                                            eReq={this.strings.CONTROLS.SPECIES_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="speciesName" />
                                    </div>
                                </div>
                                <div className={"form-group is-password " + (this.addMode ? "hidden" : "")}>
                                    <div className="col-md-12">
                                        <Input inputProps={{
                                            name: 'systemCode',
                                            disabled: true,
                                            hintText: this.strings.CONTROLS.SYSTEM_CODE_PLACEHOLDER,
                                            floatingLabelText: this.strings.CONTROLS.SYSTEM_CODE_LABEL
                                        }}
                                            maxLength={10} initialValue={this.specy.Id ? this.specy.SystemCode : ''}
                                            isClicked={this.state.isClicked} ref="systemCode" />
                                    </div>
                                </div>
                                <div className="clear"></div>

                                <div className="form-group is-password mt15">
                                    <div className="row mr0">
                                        <div className="form-group col-md-6 mt10">
                                            <FileUpload
                                                strings={this.strings.COMMON}
                                                notifyToaster={this.props.notifyToaster}
                                                label={this.strings.MOB_PICTURE_LABEL}
                                                data={this.specy.mobPicture}
                                                picDelSuccess={this.strings.PICTURE_DELETE_SUCCESS} ref="mobFile" />
                                        </div>
                                        <div className="form-group col-md-6 mt10">
                                            <FileUpload
                                                strings={this.strings.COMMON}
                                                notifyToaster={this.props.notifyToaster}
                                                label={this.strings.INDIVIDUAL_PICTURE_LABEL}
                                                data={this.specy.indPicture}
                                                picDelSuccess={this.strings.PICTURE_DELETE_SUCCESS} ref="indFile" />
                                        </div>
                                    </div>
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
                                redirectUrl={!this.addMode ? '/adminsetup/species' : null}
                                onClick={this.saveSpecy} ></BusyButton>
                        </div>
                    </div>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

export default SpeciesDetail;