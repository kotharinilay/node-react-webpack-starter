'use strict';

/**************************
 * sub tab for WHP records
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import AutoComplete from '../../../../lib/core-components/AutoComplete';
import CheckBox from '../../../../lib/core-components/CheckBox';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import FileUpload from '../../../../lib/wrapper-components/FileUpload';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { deleteFile, uploadFile } from '../../../../services/private/common';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import { checkDupEmail } from '../../../../services/private/contact';
import { bufferToUUID } from '../../../../../shared/uuid';

class ContactTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.contact = this.props.contact;
        this.emailValue = this.contact.Email || '';
        if (this.contact.Id) {
            this.contact.avtarFile = {
                FileId: this.contact.AvatarFileId || null,
                FileName: this.contact.AvatarPicName || '',
                MimeType: this.contact.AvatarPicType || '',
                FilePath: this.contact.AvatarPicPath || ''
            }
            this.contact.signaturePicFile = {
                FileId: this.contact.SignatureFileId || null,
                FileName: this.contact.SignaturePicName || '',
                MimeType: this.contact.SignaturePicType || '',
                FilePath: this.contact.SignaturePicPath || ''
            }
        }
        this.isProfile = this.props.isProfile;
        this.LanguageDDValues = [{ value: "en", text: "English" }, { value: "zh", text: "Chinese" }]

        this.state = {
            displayUserLink: this.contact.UserName ? false : true,
            error: null,
            countryId: this.contact.BusinessCountryId ?
                bufferToUUID(this.contact.BusinessCountryId, true) : null,
            isPrivate: this.contact.IsPrivate == 1 ? true : false
        }
        this.checkDupEmail = this.checkDupEmail.bind(this);
        this.blurEmail = this.blurEmail.bind(this);
        this.isPrivateChange = this.isPrivateChange.bind(this);
        this.toggleCreateUser = this.toggleCreateUser.bind(this);
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

    blurEmail(emailValue) {
        this.emailValue = emailValue;
        this.refs.email.updateInputStatus(null, false);
    }

    // check if username already exists
    checkDupEmail(value) {
        let _this = this;
        return checkDupEmail(value).then(function (res) {
            if (res.success) {

                if (res.data) {
                    _this.refs.username.updateInputStatus(_this.strings.DUPLICATE_EMAIL_VALIDATION);
                    _this.stateSet({ error: _this.strings.DUPLICATE_EMAIL_VALIDATION });
                    _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.strings.DUPLICATE_EMAIL_VALIDATION });
                }
                else {
                    _this.refs.username.updateInputStatus();
                    _this.stateSet({ error: null });
                }
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    isPrivateChange(name, value) {
        this.setState({ isPrivate: value });
    }

    toggleCreateUser() {
        let displayUserLink = this.state.displayUserLink;
        this.setState({ displayUserLink: !displayUserLink });
    }

    render() {
        return (
            <div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'email',
                                hintText: this.strings.CONTROLS.CONTACT_EMAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_EMAIL_LABEL
                            }}
                                onBlurInput={this.blurEmail}
                                maxLength={100} initialValue={this.contact.Email || ''}
                                eReq={this.strings.CONTROLS.CONTACT_EMAIL_REQ_MESSAGE}
                                eInvalid={this.strings.CONTROLS.EMAIL_VALIDATE_MESSAGE}
                                isClicked={this.props.isClicked} ref="email" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'mobile',
                                hintText: this.strings.CONTROLS.CONTACT_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_MOBILE_LABEL
                            }}
                                maxLength={20} initialValue={this.contact.Mobile || ''}
                                isClicked={this.props.isClicked} ref="mobile" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'telephone',
                                hintText: this.strings.CONTROLS.CONTACT_TELEPHONE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_TELEPHONE_LABEL
                            }}
                                maxLength={20} initialValue={this.contact.Telephone || ''}
                                isClicked={this.props.isClicked} ref="telephone" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'fax',
                                hintText: this.strings.CONTROLS.CONTACT_FAX_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_FAX_LABEL
                            }}
                                maxLength={20} initialValue={this.contact.Fax || ''}
                                isClicked={this.props.isClicked} ref="fax" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'address',
                                hintText: this.strings.CONTROLS.CONTACT_ADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_ADDRESS_LABEL
                            }}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.contact.BusinessAddress || ''}
                                isClicked={this.props.isClicked} ref="address" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'postaladdress',
                                hintText: this.strings.CONTROLS.CONTACT_POSTALADDRESS_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_POSTALADDRESS_LABEL
                            }}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue={this.contact.PostalAddress || ''}
                                isClicked={this.props.isClicked} ref="postaladdress" />
                        </div>
                    </div>
                    <div className="row">
                        <SuburbAutoComplete suburbName='suburb' componentClass='col-md-6' ref='businessSuburb'
                            countryId={this.state.countryId}
                            suburbHintText={this.strings.CONTROLS.CONTACT_SUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.CONTACT_SUBURB_LABEL}
                            suburbSearchText={this.contact.BusinessSuburb ? this.contact.BusinessSuburb : ''}
                            suburbSelectedValue={this.contact.Id ? this.contact.BusinessSuburbId : null}
                            isClicked={this.props.isClicked}
                            stateHintText={this.strings.CONTROLS.CONTACT_STATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.CONTACT_STATE_LABEL}
                            stateDefaultValue={this.contact.BusinessStateName ? this.contact.BusinessStateName : ''}
                            stateDefaultId={this.contact.BusinessStateId ? this.contact.BusinessStateId : null}
                            postcodeHintText={this.strings.CONTROLS.CONTACT_POSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.CONTACT_POSTCODE_LABEL}
                            postcodeDefaultValue={this.contact.BusinessPostCode ? this.contact.BusinessPostCode : ''} />

                        <SuburbAutoComplete suburbName='postalsuburb' componentClass='col-md-6' ref='postalSuburb'
                            countryId={this.state.countryId}
                            suburbHintText={this.strings.CONTROLS.CONTACT_POSTALSUBURB_PLACEHOLDER}
                            suburbfloatingLabelText={this.strings.CONTROLS.CONTACT_POSTALSUBURB_LABEL}
                            suburbSearchText={this.contact.PostalSuburb ? this.contact.PostalSuburb : ''}
                            suburbSelectedValue={this.contact.Id ? this.contact.PostalSuburbId : null}
                            isClicked={this.props.isClicked}
                            stateHintText={this.strings.CONTROLS.CONTACT_POSTALSTATE_PLACEHOLDER}
                            statefloatingLabelText={this.strings.CONTROLS.CONTACT_POSTALSTATE_LABEL}
                            stateDefaultValue={this.contact.PostalStateName ? this.contact.PostalStateName : ''}
                            stateDefaultId={this.contact.PostalStateId ? this.contact.PostalStateId : null}
                            postcodeHintText={this.strings.CONTROLS.CONTACT_POSTALPOSTCODE_PLACEHOLDER}
                            postcodefloatingLabelText={this.strings.CONTROLS.CONTACT_POSTALPOSTCODE_LABEL}
                            postcodeDefaultValue={this.contact.PostalPostCode ? this.contact.PostalPostCode : ''} />
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'vehiclerego',
                                hintText: this.strings.CONTROLS.CONTACT_VEHICLEREGO_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_VEHICLEREGO_LABEL
                            }}
                                maxLength={50} initialValue={this.contact.VehicleRegNumber || ''}
                                isClicked={this.props.isClicked} ref="vehicalrego" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'contactCode',
                                hintText: this.strings.CONTROLS.CONTACT_CONTACTCODE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_CONTACTCODE_LABEL
                            }}
                                maxLength={50} initialValue={this.contact.ContactCode || ''}
                                isClicked={this.props.isClicked} ref="contactCode" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'saleagentcode',
                                hintText: this.strings.CONTROLS.CONTACT_SALEAGENTCODE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_SALEAGENTCODE_LABEL
                            }}
                                maxLength={50} initialValue={this.contact.SaleAgentCode || ''}
                                isClicked={this.props.isClicked} ref="saleagentcode" />
                        </div>
                        <div className="col-md-6">
                            <Input inputProps={{
                                name: 'badgenumber',
                                hintText: this.strings.CONTROLS.CONTACT_BADGENUMBER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_BADGENUMBER_LABEL
                            }}
                                maxLength={50} initialValue={this.contact.BadgeNumber || ''}
                                isClicked={this.props.isClicked} ref="badgenumber" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 dropdown-checkbox">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.CONTACT_ISACTIVE_LABEL,
                                labelPosition: "right",
                                name: 'isActiveContact',
                                disabled: this.isProfile
                            }}
                                initialValue={this.contact.IsActive == 1 ? true : false}
                                isClicked={this.state.isClicked} ref="isActiveContact" />
                        </div>
                        <div className="col-md-3 dropdown-checkbox">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.CONTACT_ISPRIVATE_LABEL,
                                labelPosition: "right",
                                name: 'isPrivateContact',
                                disabled: this.isProfile
                            }}
                                onToggleChange={this.isPrivateChange}
                                initialValue={this.contact.IsPrivate == 1 ? true : false}
                                isClicked={this.state.isClicked} ref="isPrivateContact" />
                        </div>
                        <div className="col-md-6">
                            <Dropdown inputProps={{
                                name: 'preferredLanguage',
                                hintText: this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_PLACEHOLDER,
                                value: this.contact.Id ? this.contact.PreferredLanguage : 'en'
                            }}
                                textField="text" valueField="value" dataSource={this.LanguageDDValues}
                                eReq={this.strings.CONTROLS.CONTACT_PREFERREDLANGUAGE_REQ_MESSAGE}
                                isClicked={this.props.isClicked} ref="preferredLanguage" />
                        </div>
                    </div>
                    {this.state.isPrivate && this.contact.UserName ?
                        <div className='row'>
                            <div className='col-md-6'>
                                <span className='error-message'>
                                    {this.strings.PRIVATE_CONTACT_MESSAGE}
                                </span>
                            </div>
                        </div>
                        : null}
                    {
                        this.isProfile || this.state.isPrivate ?
                            null
                            :
                            <div>
                                <div className="row mt10">
                                    {this.state.displayUserLink ?
                                        <div className="col-md-6">
                                            <Button
                                                inputProps={{
                                                    name: 'btnCreateUser',
                                                    label: this.strings.CONTROLS.CREATE_USER_LABEL,
                                                    className: 'button1Style button30Style'
                                                }}
                                                onClick={this.toggleCreateUser} ></Button>
                                        </div> :
                                        <div>
                                            <div className="col-md-6">
                                                <Input inputProps={{
                                                    name: 'username',
                                                    hintText: this.strings.CONTROLS.CONTACT_USERNAME_PLACEHOLDER,
                                                    floatingLabelText: this.strings.CONTROLS.CONTACT_USERNAME_LABEL,
                                                    disabled: this.contact.UserName ? true : false
                                                }}
                                                    maxLength={100} initialValue={this.contact.UserName || this.emailValue}
                                                    onBlurInput={this.checkDupEmail}
                                                    eInvalid={this.strings.CONTROLS.EMAIL_VALIDATE_MESSAGE}
                                                    eReq={this.strings.CONTROLS.CONTACT_USERNAME_REQ_MESSAGE}
                                                    isClicked={this.props.isClicked} ref="username" />
                                            </div>
                                            {this.contact.UserName ? null :
                                                <div className="col-md-6">
                                                    <Input inputProps={{
                                                        name: 'password',
                                                        type: 'password',
                                                        hintText: this.strings.CONTROLS.CONTACT_PASSWORD_PLACEHOLDER,
                                                        floatingLabelText: this.strings.CONTROLS.CONTACT_PASSWORD_LABEL,
                                                        autoComplete: 'new-password'
                                                    }}
                                                        maxLength={20} strengthBar={true} initialValue=''
                                                        eReq={this.strings.CONTROLS.CONTACT_PASSWORD_REQ_MESSAGE}
                                                        isClicked={this.props.isClicked} ref="password" />
                                                </div>
                                            }
                                            {this.contact.UserName ? null :
                                                <div className="col-md-6">
                                                    <Button
                                                        inputProps={{
                                                            name: 'btnCancelUser',
                                                            label: this.strings.CONTROLS.CANCEL_CREATE_USER_LABEL,
                                                            className: 'button1Style button30Style'
                                                        }}
                                                        onClick={this.toggleCreateUser} ></Button>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                    }
                    <div className="row">
                        <div className="col-md-6">
                            <FileUpload
                                strings={this.strings.COMMON}
                                notifyToaster={this.props.notifyToaster}
                                label={this.strings.AVATAR_LABEL}
                                data={this.contact.avtarFile}
                                picDelSuccess={this.strings.PICTURE_DELETE_SUCCESS} ref="avtarFile" />
                        </div>
                        <div className="col-md-6">
                            <FileUpload
                                isSignature={true}
                                strings={this.strings.COMMON}
                                notifyToaster={this.props.notifyToaster}
                                label={this.strings.SIGNATURE_PIC_LABEL}
                                data={this.contact.signaturePicFile}
                                picDelSuccess={this.strings.PICTURE_DELETE_SUCCESS} ref="signaturePicFile" />
                            <CheckBox inputProps={{
                                name: 'isNvdSignatureAllowed',
                                label: this.strings.CONTROLS.CONTACT_NVDSIGNATUREALLOWED_LABEL,
                                defaultChecked: this.contact.IsNvdSignatureAllowed == 1 ? true : false
                            }}
                                className='auth-sign'
                                isClicked={this.props.isClicked} ref="isNvdSignatureAllowed" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ContactTab;