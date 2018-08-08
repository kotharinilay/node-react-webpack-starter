'use strict';

/*************************************
 * popup to set password for selected contact
 * *************************************/

import React from 'react';
import PureComponent from '../../../../../lib/wrapper-components/PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import Input from '../../../../../lib/core-components/Input';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Button from '../../../../../lib/core-components/Button';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { recordLost } from '../../../../../services/private/livestock';
import { map as _map } from 'lodash';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
import { LocalStorageKeys } from '../../../../../../shared/constants';

class ReocrdLostTags extends PureComponent {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            isOpen: true,
            isClicked: false,
            error: null
        }
        this.recordLostSchema = ['lostdate', 'lostreason'];

        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.recordLost = this.recordLost.bind(this);

    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let data = localStorage.getItem(LocalStorageKeys.LivestockData);
        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            this.hideModal();
            this.livestocks = [];
            this.numberOfLivestock = "0";
            this.numberOfMob = "0";
        }
        else {
            let json = JSON.parse(data);
            let mobCount = 0, livestockCount = 0;
            this.livestocks = _map(json.data, function (m) {
                if (m.IsMob) {
                    mobCount++;
                }
                livestockCount += m.NumberOfHead;
                return { livestockId: m.Id, auditLogId: m.AuditLogId, livestockCount: m.NumberOfHead };
            });
            this.numberOfLivestock = livestockCount.toString();
            this.numberOfMob = mobCount.toString();
            this.propertyId = json.propertyId;
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.toggleRecordLost(false);
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

    recordLost() {
        let isValid = isValidForm(this.recordLostSchema, this.refs);
        if (!isValid) {
            this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.props.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let recordLostValues = getForm(this.recordLostSchema, this.refs);
        Object.assign(recordLostValues, { livestockIds: this.livestocks }, { propertyId: this.propertyId });
        let _this = this;
        return recordLost(recordLostValues).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: _this.props.strings.SUCCESS_MESSAGE });
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
                            <Input inputProps={{
                                name: 'numberOfLivestock',
                                hintText: strings.CONTROLS.NUMBER_OF_LIVESTOCK,
                                floatingLabelText: strings.CONTROLS.NUMBER_OF_LIVESTOCK,
                                disabled: true
                            }}
                                initialValue={this.numberOfLivestock}
                                ref="numberOfLivestock" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'numberOfMob',
                                hintText: strings.CONTROLS.NUMBER_OF_MOB,
                                floatingLabelText: strings.CONTROLS.NUMBER_OF_MOB,
                                disabled: true
                            }}
                                initialValue={this.numberOfMob}
                                ref="numberOfMob" />
                        </div>
                        <div className="col-md-12">
                            <DateTimePicker inputProps={{
                                name: 'lostdate',
                                placeholder: strings.CONTROLS.LOST_DATE_PLACEHOLDER,
                                label: strings.CONTROLS.LOST_DATE_LABEL
                            }}
                                eReq={strings.CONTROLS.LOST_DATE_REQ_MESSAGE}
                                defaultValue={new Date()} timeFormat={false}
                                isClicked={this.state.isClicked} ref="lostdate" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'lostreason',
                                hintText: strings.CONTROLS.LOST_REASON_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.LOST_REASON_LABEL
                            }}
                                eReq={strings.CONTROLS.LOST_REASON_REQ_MESSAGE}
                                maxLength={300} multiLine={true} rows={3}
                                initialValue=''
                                isClicked={this.state.isClicked} ref="lostreason" />

                        </div>
                    </div>
                    <div className="clearfix"></div>
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <Button
                            inputProps={{
                                name: 'btnSave',
                                label: strings.CONTROLS.SAVE_LABEL,
                                className: 'button2Style button30Style mr10'
                            }}
                            showLoading={true}
                            onClick={this.recordLost}></Button>
                        <Button
                            inputProps={{
                                name: 'btnClose',
                                label: strings.CONTROLS.CANCEL_LABEL,
                                className: 'button1Style button30Style'
                            }}
                            onClick={this.hideModal}></Button>
                    </div>
                </ModalFooter>
            </Modal >
        );
    }
}

export default ReocrdLostTags;