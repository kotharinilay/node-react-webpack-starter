'use strict';

/*************************************
 * popup to set password for selected contact
 * *************************************/

import React from 'react';
import PureComponent from '../../../../lib/wrapper-components/PureComponent';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import ConfirmPassword from '../../../../lib/core-components/Password-ConfirmPassword';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { setPassword } from '../../../../services/private/contact';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class SetPassword extends PureComponent {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            isClicked: false,
            error: null,
        }
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.setPassword = this.setPassword.bind(this);

        this.setPasswordSchema = ['loggedinPassword', 'newPassword'];
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
        this.props.toggleSetPassword(false);
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

    // Handle set password click
    setPassword() {
        try {
            let isFormValid = isValidForm(this.setPasswordSchema, this.refs);
            if (!isFormValid) {
                if (!this.state.isClicked)
                    this.stateSet({
                        isClicked: true
                    });
                return false;
            }
            let obj = getForm(this.setPasswordSchema, this.refs);
            let _this = this;
            let {strings} = this.props;
            setPassword(obj.loggedinPassword, obj.newPassword, this.props.selectedId).then(function(res) {
                if (res.success) {
                    _this.props.notifyToaster(NOTIFY_SUCCESS, {
                        message: strings.PASSWORD_SET_SUCCESS
                    });
                    _this.hideModal();
                } else if (!res.unauthorized) {
                    let errorMsg = _this.props.notifyToaster(NOTIFY_ERROR, {
                        message: res.error,
                        strings: strings
                    });
                    _this.stateSet({
                        isClicked: false,
                        error: errorMsg
                    });
                }
            }).catch(function(err) {
                _this.props.notifyToaster(NOTIFY_ERROR)
            });
        } catch (Ex) {
            _this.props.notifyToaster(NOTIFY_ERROR)
        }
    }

    // Render popup
    render() {
        let {strings} = this.props;
        return ( < Modal isOpen={ true } keyboard={ false }>
                   < ModalHeader>
                     < ModalClose onClick={ this.hideModal } />
                     < h2>
                       { strings.TITLE }
                       < /h2>
                         < /ModalHeader>
                           < ModalBody>
                             < div key={ Math.random() } className="form-cover">
                               < Input inputProps={ {
 name: 'loggedinPassword',
 type: 'password',
 floatingLabelText: strings.CONTROLS.LOGGEDIN_PASSWORD_LABEL,
 hintText: strings.CONTROLS.LOGGEDIN_PASSWORD_PLACE_HOLDER
 } } eReq={ strings.CONTROLS.LOGGEDIN_PASSWORD_REQ_MESSAGE } isClicked={ this.state.isClicked } ref="loggedinPassword" />
                               < ConfirmPassword inputProps={ {
 name: 'newPassword',
 hintText: strings.CONTROLS.NEW_PASSWORD_PLACE_HOLDER,
 floatingLabelText: strings.CONTROLS.NEW_PASSWORD_LABEL
 } } inputPropsCP={ {
 name: 'confirmPassword',
 hintText: strings.CONTROLS.CONFIRM_PASSWORD_PLACE_HOLDER,
 floatingLabelText: strings.CONTROLS.CONFIRM_PASSWORD_LABEL
 } } minLength={ 8 } eLength={ strings.CONTROLS.MUST_CHAR_REQ_MESSAGE } eReq={ strings.CONTROLS.NEW_PASSWORD_REQ_MESSAGE }
                                 eReqCP={ strings.CONTROLS.CONFIRM_PASSWORD_REQ_MESSAGE } eCPNotMatch={ strings.CONTROLS.CONFIRM_PASSWORD_VALIDATE_MESSAGE } ref="newPassword" isClicked={ this.state.isClicked } strengthBar={ true }
                               />
                               < span className={ (this.state.error != null) ? 'error-message' : 'hidden' }>
                                 { this.state.error }
                                 < /span>
                                   < /div>
                                     < div className="clearfix">
                                       < /div>
                                         < /ModalBody>
                                           < ModalFooter>
                                             < div className="search-btn-main">
                                               < Button inputProps={ {
 name: 'btnSubmit',
 label: strings.CONTROLS.SUBMIT_LABEL,
 className: 'button1Style button30Style mr10'
 } } showLoading={ true } onClick={ this.setPassword }>
                                                 < /Button>
                                                   < Button inputProps={ {
 name: 'btnClose',
 label: strings.CONTROLS.CLOSE_LABEL,
 className: 'button2Style button30Style'
 } } onClick={ this.hideModal }>
                                                     < /Button>
                                                       < /div>
                                                         < /ModalFooter>
                                                           < /Modal>
            );
    }
}

export default SetPassword;