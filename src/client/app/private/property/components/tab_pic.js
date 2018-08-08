'use strict';

/**************************
 * add/update tab for PIC
 * **************************** */

import React, { Component } from 'react';
import Input from '../../../../lib/core-components/Input';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Multipicker from '../../../../lib/core-components/Multipicker';
import Button from '../../../../lib/core-components/Button';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { deleteFile, uploadFile } from '../../../../services/private/common';
import { renderManagerItems } from '../../../../lib/index';
import { livestockIdentifierDS, exportEligibility } from '../../../../../shared/constants';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { getDataByHierarchy } from '../../../../services/private/property';

class PICTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.picSchema = ['Address', 'PropertyManagerId', 'AsstPropertyManagerId',
            'NLISUsername', 'NLISPassword', 'LivestockIdentifier', 'ExportEligibility', 'BrandText', 'EarmarkText'];

        this.data = this.props.PICData || null;
        if (!this.data) {
            this.data = {
                Address: '',
                SuburbName: '',
                StateCode: '',
                PostCode: '',
                SuburbId: null,
                StateId: null,
                PropertyManagerId: null,
                AsstPropertyManagerId: null,
                NLISUsername: '2PRODAL1',
                NLISPassword: '2PRODAL1',
                LivestockIdentifier: 'EID',
                ExportEligibility: [],
                BrandText: '',
                EarmarkText: '',
                BrandFile: {
                    FileId: null,
                    FileName: '',
                    MimeType: '',
                    FilePath: ''
                },
                LogoFile: {
                    FileId: null,
                    FileName: '',
                    MimeType: '',
                    FilePath: ''
                },
                managerList: [],
                countryId: null
            }
        }

        this.state = {
            nlisUserReq: this.data.NLISUsername && this.data.NLISPassword ? true : false,
            nlisPassReq: this.data.NLISUsername && this.data.NLISPassword ? true : false,
            hierarchyKey: Math.random()
        }

        this.nlisUserChange = this.nlisUserChange.bind(this);
        this.nlisPassChange = this.nlisPassChange.bind(this);

        this.hierarchyChange = this.hierarchyChange.bind(this);
        this.stateChange = this.stateChange.bind(this);

        this.changeManager = this.changeManager.bind(this);
        this.changeAsstManager = this.changeAsstManager.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }
    componentWillMount() {
        this.mounted = true;
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.companyId != nextProps.companyId) {
            if (nextProps.companyId)
                this.hierarchyChange(nextProps.companyId, nextProps.regionId, nextProps.businessId);
        }
    }

    /* NLIS validation settings */

    nlisUserChange(value) {
        let { NLISPassword, NLISUsername } = this.refs;
        if (value)
            this.setState({ nlisUserReq: true, nlisPassReq: true });
        else if (!NLISPassword.fieldStatus.value) {
            this.setState({ nlisUserReq: false, nlisPassReq: false });
            NLISPassword.updateInputStatus();
            NLISUsername.updateInputStatus();
        }
    }

    nlisPassChange(value) {
        let { NLISPassword, NLISUsername } = this.refs;
        if (value)
            this.setState({ nlisUserReq: true, nlisPassReq: true });
        else if (!NLISUsername.fieldStatus.value) {
            this.setState({ nlisUserReq: false, nlisPassReq: false });
            NLISUsername.updateInputStatus();
            NLISPassword.updateInputStatus();
        }
    }

    /* NLIS validation settings */

    hierarchyChange(companyId, regionId, businessId) {
        let _this = this;
        getDataByHierarchy(companyId, regionId, businessId).then(function (res) {
            _this.data.countryId = res.data.countryId;
            _this.data.managerList = res.data.managerList;
            _this.data.PropertyManagerId = null;
            _this.data.AsstPropertyManagerId = null;
            _this.stateSet({ hierarchyKey: Math.random() });
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Validate PIC on change of state
    stateChange(stateSystemCode, defaultGPS) {
        this.props.validatePIC(null, stateSystemCode);
        this.props.updateCenterCords(defaultGPS);
    }

    // Validate manager and asst manager with each other on manager change
    changeManager(value, text) {
        let Manager = this.refs.PropertyManagerId;
        let AsstManager = this.refs.AsstPropertyManagerId;

        if (value == AsstManager.fieldStatus.value)
            Manager.updateDropdownStatus(this.strings.SAME_MANAGER_ERROR);
        else
            AsstManager.updateDropdownStatus();
    }

    // Validate manager and asst manager with each other on asst manager change
    changeAsstManager(value, text) {
        let Manager = this.refs.PropertyManagerId;
        let AsstManager = this.refs.AsstPropertyManagerId;

        if (value == Manager.fieldStatus.value)
            AsstManager.updateDropdownStatus(this.strings.SAME_ASST_MANAGER_ERROR);
        else
            Manager.updateDropdownStatus();
    }

    // Return the values object of this tab
    getValues() {
        let isValid = isValidForm(this.picSchema, this.refs);
        if (!isValid)
            return isValid;
        else {
            let { Suburb, BrandFile, LogoFile } = this.refs;

            let form = getForm(this.picSchema, this.refs);
            let SuburbId = Suburb.state.suburbId;
            let Brand = BrandFile.getValues();
            let Logo = LogoFile.getValues();

            return {
                ...form,
                SuburbId: SuburbId == "" ? null : SuburbId,
                BrandFile: Brand.file,
                BrandDeletedFile: Brand.deletedFile,
                BrandFileId: Brand.fileId,
                LogoFile: Logo.file,
                LogoDeletedFile: Logo.deletedFile,
                LogoFileId: Logo.fileId
            };
        }
    }

    // Render component
    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'address',
                            hintText: this.strings.ADDRESS_PLACEHOLDER,
                            floatingLabelText: this.strings.ADDRESS_LABEL
                        }}
                            maxLength={300} multiLine={true} rows={4}
                            initialValue={this.data.Address}
                            isClicked={this.props.isClicked} ref="Address" />
                        <SuburbAutoComplete suburbName='suburb' ref='Suburb'
                            isClicked={this.props.isClicked}
                            countryId={this.data.countryId}
                            strings={this.strings.COMMON}
                            suburbSearchText={this.data.SuburbName || ''}
                            suburbSelectedValue={this.data.SuburbId}
                            stateDefaultValue={this.data.StateName}
                            stateDefaultId={this.data.StateId}
                            postcodeDefaultValue={this.data.PostCode}
                            onStateChange={this.stateChange}
                            stateClass="dropdown-input"
                            postcodeClass="multipicker-input"
                        />
                    </div>
                    <div className="col-md-6">
                        <div key={this.state.hierarchyKey}>
                            <Dropdown inputProps={{
                                name: 'manager',
                                hintText: this.strings.PM_PLACEHOLDER,
                                floatingLabelText: this.strings.PM_LABEL,
                                value: this.data.PropertyManagerId
                            }}
                                onSelectionChange={this.changeManager}
                                customMenu={true} renderItems={renderManagerItems}
                                textField="Name" valueField="Id" dataSource={this.data.managerList}
                                isClicked={this.props.isClicked} ref="PropertyManagerId" />
                            <Dropdown inputProps={{
                                name: 'asstManager',
                                hintText: this.strings.APM_PLACEHOLDER,
                                floatingLabelText: this.strings.APM_LABEL,
                                value: this.data.AsstPropertyManagerId
                            }}
                                onSelectionChange={this.changeAsstManager}
                                customMenu={true} renderItems={renderManagerItems}
                                textField="Name" valueField="Id" dataSource={this.data.managerList}
                                isClicked={this.props.isClicked} ref="AsstPropertyManagerId" />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'NLISUsername',
                                    hintText: this.strings.NLIS_USERNAME_PLACEHOLDER,
                                    floatingLabelText: this.strings.NLIS_USERNAME_LABEL
                                }}
                                    maxLength={100}
                                    callOnChange={true} isLoading={false}
                                    onChangeInput={this.nlisUserChange}
                                    eReq={this.state.nlisUserReq ? this.strings.NLIS_USERNAME_REQ_MESSAGE : null}
                                    initialValue={this.data.NLISUsername}
                                    isClicked={this.props.isClicked} ref="NLISUsername" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: 'NLISPassword',
                                    type: 'password',
                                    hintText: this.strings.NLIS_PASSWORD_PLACEHOLDER,
                                    floatingLabelText: this.strings.NLIS_PASSWORD_LABEL,
                                    autoComplete: 'new-password'
                                }}
                                    maxLength={100}
                                    callOnChange={true} isLoading={false}
                                    onChangeInput={this.nlisPassChange}
                                    eReq={this.state.nlisPassReq ? this.strings.NLIS_PASSWORD_REQ_MESSAGE : null}
                                    initialValue={this.data.NLISPassword}
                                    isClicked={this.props.isClicked} ref="NLISPassword" />
                            </div>
                        </div>
                        <Dropdown inputProps={{
                            name: 'livestockIdentifier',
                            hintText: this.strings.LIVESTOCK_IDENTIFIER_PLACEHOLDER,
                            floatingLabelText: this.strings.LIVESTOCK_IDENTIFIER_LABEL,
                            value: this.data.LivestockIdentifier
                        }}
                            textField="Text" valueField="Value" dataSource={livestockIdentifierDS}
                            eReq={this.strings.LIVESTOCK_IDENTIFIER_REQ_MESSAGE}
                            isClicked={this.props.isClicked} ref="LivestockIdentifier" />
                        <Multipicker inputProps={{
                            name: 'exportEligibility',
                            placeholder: this.strings.EXPORT_ELIGIBILITY_PLACEHOLDER,
                            label: this.strings.EXPORT_ELIGIBILITY_LABEL,
                            defaultValue: this.data.ExportEligibility
                        }}
                            textField="Text" valueField="Value" dataSource={exportEligibility}
                            isClicked={this.props.isClicked} ref="ExportEligibility" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'brand',
                            hintText: this.strings.BRAND_PLACEHOLDER,
                            floatingLabelText: this.strings.BRAND_LABEL
                        }}
                            maxLength={50}
                            initialValue={this.data.BrandText}
                            isClicked={this.props.isClicked} ref="BrandText" />

                        <FileUpload
                            strings={this.strings.COMMON}
                            notifyToaster={this.notifyToaster}
                            label={this.strings.BRAND_PIC_LABEL}
                            data={this.data.BrandFile}
                            picDelSuccess={this.strings.BRAND_PIC_DELETE_SUCCESS} ref="BrandFile" />

                    </div>
                    <div className="col-md-6">
                        <Input inputProps={{
                            name: 'earmark',
                            hintText: this.strings.EARMARK_PLACEHOLDER,
                            floatingLabelText: this.strings.EARMARK_LABEL
                        }}
                            maxLength={50}
                            initialValue={this.data.EarmarkText}
                            isClicked={this.props.isClicked} ref="EarmarkText" />

                        <FileUpload
                            strings={this.strings.COMMON}
                            notifyToaster={this.notifyToaster}
                            label={this.strings.EARMARK_PIC_LABEL}
                            data={this.data.LogoFile}
                            picDelSuccess={this.strings.EARMARK_PIC_DELETE_SUCCESS} ref="LogoFile" />
                    </div>
                </div>
            </div>
        );
    }
}

export default PICTab;