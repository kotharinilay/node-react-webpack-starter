'use strict';

/*************************************
 * Popup component to display static contents
 * Reference link : https://www.npmjs.com/package/react-modal-bootstrap
 * *************************************/

import React from 'react';
import PureComponent from '../../../../lib/wrapper-components/PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import ConfirmPassword from '../../../../lib/core-components/Password-ConfirmPassword';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { changePassword } from '../../../../services/private/header';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class ChangePassword extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isClicked: false,
            error: null,
        }
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.changePassword = this.changePassword.bind(this);

        this.changePasswordSchema = ['existingPassword', 'newPassword'];
    }

    // To hide modal popup
    hideModal() {
        this.props.toggleChangePassword(false);
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

    // Handle change password click
    changePassword() {
        try {
            let isFormValid = isValidForm(this.changePasswordSchema, this.refs);
            if (!isFormValid) {
                if (!this.state.isClicked)
                    this.setState({ isClicked: true });
                return false;
            }
            let obj = getForm(this.changePasswordSchema, this.refs);
            let _this = this;
            let {strings} = this.props;
            changePassword(obj.existingPassword, obj.newPassword).then(function (res) {
                if (res.success) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, { message: strings.PASSWORD_CHANGE_SUCCESS });
                    _this.hideModal();
                }
                else if (!res.unauthorized) {
                    let errorMsg = _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: strings });
                    _this.setState({ isClicked: false, error: errorMsg });
                }
            }).catch(function (err) {
                _this.props.notifyToaster(NOTIFY_ERROR)
            });
        }
        catch (Ex) {
            _this.props.notifyToaster(NOTIFY_ERROR)
        }
    }

    // Render popup
    render() {
        let {strings} = this.props;
        return (
            <Modal isOpen={true} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <h2> {strings.TITLE}</h2>
                </ModalHeader>
                <ModalBody>
                    <div key={Math.random()} className="form-cover">
                        <Input inputProps={{
                            name: 'existingPassword',
                            type: 'password',
                            floatingLabelText: strings.EXISTING_PASSWORD_LABEL,
                            hintText: strings.EXISTING_PASSWORD_PLACE_HOLDER
                        }}
                            eReq={strings.EXISTING_PASSWORD_REQ_MESSAGE}
                            isClicked={this.state.isClicked} ref="existingPassword" />
                        <ConfirmPassword
                            inputProps={{
                                name: 'newPassword',
                                hintText: strings.NEW_PASSWORD_PLACE_HOLDER,
                                floatingLabelText: strings.NEW_PASSWORD_LABEL
                            }}
                            inputPropsCP={{
                                name: 'confirmPassword',
                                hintText: strings.CONFIRM_PASSWORD_PLACE_HOLDER,
                                floatingLabelText: strings.CONFIRM_PASSWORD_LABEL
                            }}
                            minLength={8}
                            eLength={strings.MUST_CHAR_REQ_MESSAGE}
                            eReq={strings.NEW_PASSWORD_REQ_MESSAGE}
                            eReqCP={strings.CONFIRM_PASSWORD_REQ_MESSAGE}
                            eCPNotMatch={strings.CONFIRM_PASSWORD_VALIDATE_MESSAGE}
                            ref="newPassword" isClicked={this.state.isClicked} strengthBar={true} />
                        <span className={(this.state.error != null) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                    </div>
                    <div className="clearfix"></div>
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <Button
                            inputProps={{
                                name: 'btnSubmit',
                                label: strings.SUBMIT_LABEL,
                                className: 'button1Style button30Style mr10'
                            }}
                            showLoading={true}
                            onClick={this.changePassword}></Button>
                        <Button
                            inputProps={{
                                name: 'btnClose',
                                label: strings.CLOSE_LABEL,
                                className: 'button2Style button30Style'
                            }}
                            onClick={this.hideModal}></Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

export default ChangePassword;