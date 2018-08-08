'use strict';

/*************************************
 * popup to set password for selected contact
 * *************************************/

import React from 'react';
import PureComponent from '../../../../../lib/wrapper-components/PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import Input from '../../../../../lib/core-components/Input';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Button from '../../../../../lib/core-components/Button';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { recordTagReplace } from '../../../../../services/private/livestock';
import { getTagByEID, getTagStatus } from '../../../../../services/private/tag';
import { map as _map } from 'lodash';

import { LocalStorageKeys, livestockIdentifierCodes, livestockIdentifierDS, tagStatusCodes } from '../../../../../../shared/constants';
import { EIDValidation, NLISValidation } from '../../../../../../shared/format/string';
import { bufferToUUID } from '../../../../../../shared/uuid';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';

class ReocrdTagReplacement extends PureComponent {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.tagStatusData = [];
        this.pendingStatus = null;
        this.state = {
            isOpen: true,
            isClicked: false,
            identifierField: null,
            renderIdValue: Math.random()
        }
        this.recordTagReplaceSchema = ['identifier', 'identifierValue', 'replacedate', 'replacereason'];

        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.onIdentifierChange = this.onIdentifierChange.bind(this);
        this.checkIdentifier = this.checkIdentifier.bind(this);
        this.validateIdentifier = this.validateIdentifier.bind(this);
        this.recordReplacement = this.recordReplacement.bind(this);
        this.submitToNLIS = this.submitToNLIS.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getTagStatus().then(function (res) {
            if (res.success) {
                _this.tagStatusData = res.data;
                _this.pendingStatus = _this.tagStatusData.filter((status) => {
                    return status.SystemCode == tagStatusCodes.Pending;
                })[0];
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR);
                _this.hideModal();
            }
        });

        let data = localStorage.getItem(LocalStorageKeys.LivestockData);
        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            this.hideModal();
        }
        else {
            let json = JSON.parse(data);
            this.livestock = json.data[0];
            this.propertyId = json.propertyId;
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData);
    }

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.toggleRecordTagReplacement(false);
        }, 1000);
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.hideModal();
            e.preventDefault();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    // handle change event of livestock identifier drop down
    onIdentifierChange(value, text) {
        this.stateSet({ identifierField: value, renderIdValue: Math.random() });
    }

    checkIdentifier(value) {
        let livestockIdentifier = this.state.identifierField;
        let _this = this;
        if (livestockIdentifier == livestockIdentifierCodes.EID || livestockIdentifier == livestockIdentifierCodes.NLISID) {
            getTagByEID(livestockIdentifier, value).then(function (res) {
                if (res.success) {
                    _this.refs.identifierValue.updateInputStatus();
                    if (res.data.length > 0) {
                        if (bufferToUUID(_this.pendingStatus.Id) == bufferToUUID(res.data[0].CurrentStatusId)) {
                            _this.tagId = bufferToUUID(res.data[0].Id);
                            _this.tagAuditId = res.data[0].AuditLogId;
                        }
                        else {
                            _this.tagId = null;
                            _this.tagAuditId = null;
                            _this.props.notifyToaster(NOTIFY_ERROR, { message: _this.props.strings.INVALID_IDENTIFIER_VALUE });
                        }
                    }
                    else {
                        _this.tagId = null;
                        _this.tagAuditId = null;
                        if (_this.refs.species.fieldStatus.dirty) _this.refs.species.setState({ value: null });
                    }
                }
            });
        }
        this.refs.identifierValue.updateInputStatus();
    }

    validateIdentifier(input) {
        if (this.state.identifierField == livestockIdentifierCodes.EID) {
            if (!EIDValidation(input)) return this.strings.CONTROLS.INVALID_EID
        }
        else {
            if (!NLISValidation(input)) return this.strings.CONTROLS.INVALID_NLISID
        }
        return null;
    }

    submitToNLIS() {
        this.recordReplacement(true);
    }

    recordReplacement(isNLISSubmit) {
        let isValid = isValidForm(this.recordTagReplaceSchema, this.refs);
        if (!isValid) {
            this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let obj = {
            livestock: this.livestock,
            propertyId: this.propertyId,
            tagId: this.tagId,
            tagAuditId: this.tagAuditId,
            isNLISSubmit: isNLISSubmit || false
        }
        let recordTagReplaceValues = getForm(this.recordTagReplaceSchema, this.refs);
        Object.assign(recordTagReplaceValues, obj);

        if ((!this.tagId || !this.tagAuditId) && (recordTagReplaceValues.identifier == livestockIdentifierCodes.EID ||
            recordTagReplaceValues.identifier == livestockIdentifierCodes.NLISID)) {
            this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_IDENTIFIER_VALUE });
            return false;
        }

        let _this = this;
        return recordTagReplace(recordTagReplaceValues).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS_MESSAGE });
                _this.hideModal();
                return true;
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR);
            }
        });
    }

    // Render popup
    render() {
        let { strings } = this.props;
        return (
            <Modal isOpen={this.state.isOpen} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <h2> {strings.TITLE}</h2>
                </ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Dropdown inputProps={{
                                name: 'identifier',
                                hintText: strings.CONTROLS.LIVESTOCKIDENTIFIER_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.LIVESTOCKIDENTIFIER_LABEL,
                                value: null
                            }}
                                eReq={strings.CONTROLS.LIVESTOCKIDENTIFIER_REQ_MESSAGE}
                                onSelectionChange={this.onIdentifierChange} callOnChange={true}
                                textField="Text" valueField="Value" dataSource={livestockIdentifierDS}
                                isClicked={this.state.isClicked} ref="identifier" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12" key={this.state.renderIdValue}>
                            {this.state.identifierField ? <Input inputProps={{
                                name: 'identifierValue',
                                hintText: strings.CONTROLS.IDENTIFIER_PLACEHOLDER + this.state.identifierField,
                                floatingLabelText: this.state.identifierField,
                                disabled: this.state.identifierField ? false : true
                            }}
                                eReq={strings.CONTROLS.IDENTIFIER_REQ_MESSAGE + this.state.identifierField}
                                eClientValidation={this.state.identifierField == livestockIdentifierCodes.EID ||
                                    this.state.identifierField == livestockIdentifierCodes.NLISID ? this.validateIdentifier : null}
                                onBlurInput={this.checkIdentifier}
                                maxLength={50} initialValue=''
                                isClicked={this.state.isClicked} ref="identifierValue" /> : null}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <DateTimePicker inputProps={{
                                name: 'replacedate',
                                placeholder: strings.CONTROLS.REPLACE_DATE_PLACEHOLDER,
                                label: strings.CONTROLS.REPLACE_DATE_LABEL
                            }}
                                eReq={strings.CONTROLS.REPLACE_DATE_REQ_MESSAGE}
                                defaultValue={new Date()} timeFormat={false}
                                isClicked={this.state.isClicked} ref="replacedate" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'replacereason',
                                hintText: strings.CONTROLS.REPLACE_REASON_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.REPLACE_REASON_LABEL
                            }}
                                eReq={strings.CONTROLS.REPLACE_REASON_REQ_MESSAGE}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue=''
                                isClicked={this.state.isClicked} ref="replacereason" />

                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <div className="l-stock-top-btn">
                            <ul>
                                <li>
                                    <Button
                                        inputProps={{
                                            name: 'btnSave',
                                            label: strings.CONTROLS.SAVE_LABEL,
                                            className: 'button2Style button30Style ripple-effect search-btn'
                                        }}
                                        showLoading={true}
                                        onClick={this.recordReplacement}></Button>
                                    <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                    <ul className="dropdown-menu mega-dropdown-menu action-menu action-menu-height">
                                        <li>
                                            <ul>
                                                <li><a href="javascript:void(0)" onClick={this.submitToNLIS}>{strings.CONTROLS.SAVE_NLIS_LABEL}</a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li><Button
                                    inputProps={{
                                        name: 'btnClose',
                                        label: strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.hideModal}></Button></li>
                            </ul>

                        </div>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ReocrdTagReplacement;