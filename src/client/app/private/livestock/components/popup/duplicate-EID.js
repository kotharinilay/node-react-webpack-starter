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
import { p2ptransfer } from '../../../../../services/private/livestock';

import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';

class DuplicateEID extends PureComponent {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            isOpen: true,
            isClicked: false,
            error: null,
            showFields: false
        }
        this.transferPICSchema = ['nvdnumber', 'transactiondate'];

        this.contactPerson = this.props.popupText.propertyManager[0].PropertyManager || this.props.popupText.propertyManager[0].AsstPropertyManager ||
            this.props.popupText.manager[0].Name;
        this.originPIC = this.props.popupText.propertyManager[0].PIC;


        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.yesClick = this.yesClick.bind(this);
        this.transferPIC = this.transferPIC.bind(this);

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

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.toggleDuplicateEID(false);
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

    yesClick() {
        this.setState({ showFields: true });
    }

    transferPIC() {

        let isValid = isValidForm(this.transferPICSchema, this.refs);
        if (!isValid) {
            this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.props.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let transferPICValues = getForm(this.transferPICSchema, this.refs);
        transferPICValues.oldPIC = this.originPIC;
        transferPICValues.NLISUsername = this.props.popupText.propertyManager[0].NLISUsername;
        transferPICValues.NLISPassword = this.props.popupText.propertyManager[0].NLISPassword;
        let inductionObj = Object.assign({}, this.props.data, transferPICValues);
        let _this = this;
        return p2ptransfer(inductionObj).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: (_this.props.strings.SUCCESS_MESSAGE).replace('{{origin}}', transferPICValues.oldPIC).replace('{{destination}}', inductionObj.topPIC.PIC) });
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
                    <div>
                        <span>
                            This livestock already exists on PIC {this.originPIC}.
                            Contact person for this PIC is {this.contactPerson}. <br />
                            Do you want to save this livestock with your property if this is in your PIC at present?
                        </span>
                    </div>
                    {this.state.showFields ?
                        <div key={Math.random()} className="form-cover">
                            <Input inputProps={{
                                name: 'nvdnumber',
                                floatingLabelText: strings.CONTROLS.NVD_NUMBER_LABEL,
                                hintText: strings.CONTROLS.NVD_NUMBER_PLACEHOLDER
                            }}
                                eReq={strings.CONTROLS.NVD_NUMBER_REQ_MESSAGE}
                                isClicked={this.state.isClicked} ref="nvdnumber" />
                            <DateTimePicker inputProps={{
                                name: 'transactiondate',
                                placeholder: strings.CONTROLS.TRANSACTION_DATE_PLACEHOLDER,
                                label: strings.CONTROLS.TRANSACTION_DATE_LABEL
                            }}
                                eReq={strings.CONTROLS.TRANSACTION_DATE_REQ_MESSAGE}
                                defaultValue={new Date()} timeFormat={false}
                                isClicked={this.state.isClicked} ref="transactiondate" />
                        </div>
                        : null}
                    <div className="clearfix"></div>
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        {!this.state.showFields ?
                            <Button
                                inputProps={{
                                    name: 'btnYes',
                                    label: strings.CONTROLS.YES_LABEL,
                                    className: 'button1Style button30Style mr10'
                                }}
                                onClick={this.yesClick}></Button>
                            : null}
                        {this.state.showFields ?
                            <Button
                                inputProps={{
                                    name: 'btnSubmit',
                                    label: strings.CONTROLS.SUBMIT_LABEL,
                                    className: 'button1Style button30Style mr10'
                                }}
                                showLoading={true}
                                onClick={this.transferPIC}></Button>
                            : null}
                        <Button
                            inputProps={{
                                name: 'btnClose',
                                label: strings.CONTROLS.CANCEL_LABEL,
                                className: 'button2Style button30Style'
                            }}
                            onClick={this.hideModal}></Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

export default DuplicateEID;