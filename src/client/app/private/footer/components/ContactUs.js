'use strict';

/*************************************
 * Contact Us popup to record user's feedback
 * and show Aglive's Contact Detail
 * *************************************/

import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import PureComponent from '../../../../lib/wrapper-components/PureComponent';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import CircularProgress from '../../../../lib/core-components/CircularProgress';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { sendFeedbackEmail, footerContact } from '../../../../services/private/footer';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class ContactUs extends PureComponent {

    // constructor
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            isOpen: true,
            key: Math.random(),
            isClicked: false,
            contact: null
        }
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.sendFeedback = this.sendFeedback.bind(this);
        this.feedbackSchema = ['feedback'];
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
        let _this = this;
        setTimeout(function () {
            _this.props.closePopup();
        }, 1000);
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.hideModal();
            e.preventDefault();
        }
    }

    // To update component based on predefine values
    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    // Send feedback to admin
    sendFeedback(e) {
        e.preventDefault();

        let isFormValid = isValidForm(this.feedbackSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.refs.feedback.state.error });
            return false;
        }
        let obj = getForm(this.feedbackSchema, this.refs);
        var _this = this;
        let { strings } = this.props;
        sendFeedbackEmail(this.state.contact.Email, obj.feedback).then(function (res) {
            if (res.success) {
                this.props.notifyToaster(NOTIFY_SUCCESS, { message: strings.SUCCESS });
                _this.stateSet({ key: Math.random(), isClicked: false });
            }
            else if (res.badRequest) {
                this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: strings });
            }
        }).catch(function (err) {
            this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Get contact details and update state
    componentWillMount() {
        this.mounted = true;
        let { strings } = this.props;
        let _this = this;
        footerContact().then(function (res) {
            if (res.success)
                _this.stateSet({ contact: res.contact });
            else if (res.badRequest) {
                _this.props.notifyError({ message: res.error, strings });
                _this.stateSet({ contact: null });
            }
        }).catch(function (err) {
            this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Render body part of popup
    renderBody(strings) {
        if (this.state.contact) {
            let { contact, key } = this.state;
            return (<div>
                <div className="row">
                    <div className="col-md-4">
                        <b>{strings.TEXT.PHONE_NUMBER}</b>
                        <p>{strings.DETAILS.PHONE_NUMBER}</p>
                    </div>
                    <div className="col-md-4">
                        <b>{strings.TEXT.LOGGIN_USER}</b>
                        <p>{contact.UserName ? contact.UserName : '-'}</p>
                    </div>
                    <div className="col-md-4">
                        <b>{strings.TEXT.SELECTED_PIC}</b>
                        <p>{strings.DETAILS.PIC}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="row">
                            <div className="col-md-12">
                                <b>{strings.TEXT.EMAIL}</b>
                                <p>{strings.DETAILS.EMAIL}</p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <b>{strings.TEXT.ADDRESS}</b>
                                <p>{strings.DETAILS.ADDRESS}</p>
                            </div>
                        </div>
                    </div>
                    <div key={key} className="col-md-8">
                        <b>{strings.TEXT.FEEDBACK}</b><br />
                        <Input inputProps={{
                            name: 'feedback',
                            hintText: strings.CONTROLS.PLACE_HOLDER
                        }}
                            multiLine={true} rows={8} rowsMax={8}
                            eReq={strings.CONTROLS.REQ_MESSAGE}
                            isClicked={this.state.isClicked} ref="feedback" />
                    </div>
                </div>
                <div className="clearfix"></div>
            </div>);
        }
        else {
            return (<div>
                <CircularProgress inputProps={{ size: 20, thickness: 3, className: 'mr5' }} />
                <span>{strings.COMMON.LOADING}</span>
            </div>);

        }
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
                <ModalBody>{this.renderBody(strings)}
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <Button
                            inputProps={{
                                name: 'btnSendFeedback',
                                label: strings.CONTROLS.SEND_FEEDBACK_LABEL,
                                className: 'button1Style button30Style mr10'
                            }}
                            onClick={this.sendFeedback} ref='btnSendFeedback'></Button>
                        <Button
                            inputProps={{
                                name: 'btnCancel',
                                label: strings.CONTROLS.CLOSE_LABEL,
                                className: 'button2Style button30Style'
                            }}
                            onClick={this.hideModal}></Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ContactUs;