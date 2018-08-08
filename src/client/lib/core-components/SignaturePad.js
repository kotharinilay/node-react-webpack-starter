'use strict';

/*************************************
 * SignaturePad component
 * https://github.com/blackjk3/react-signature-pad
 * https://www.npmjs.com/package/react-signature-pad
 * *************************************/

import React, { Component } from 'react';
import Button from '../core-components/Button';
import BusyButton from '../wrapper-components/BusyButton';
import SignaturePad from 'react-signature-pad';
import '../../../../assets/css/signature-pad.css';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';

import { base64ToImage } from '../../services/private/common';
import { generateRandomNumber } from '../../../shared/index';
import { getBase64FromImageUrl } from '../index';

class SignaturePadComponent extends Component {
    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        this.state = {
            isOpen: false
        }

        this.clearImg = null;

        this.openModal = this.openModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.saveSignature = this.saveSignature.bind(this);
        this.clearSignature = this.clearSignature.bind(this);
    }

    // To open modal popup
    openModal() {
        this.setState({ isOpen: true })
    }

    // To hide modal popup
    hideModal() {
        this.setState({ isOpen: false });
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27 && this.state.isOpen) {
            this.hideModal();
            e.preventDefault();
        }
    }

    // To update component based on predefine values
    componentDidUpdate() {
        if (this.props.isESC) {
            if (this.state.isOpen)
                document.addEventListener('keydown', this.handleKeyDown);
            else
                document.removeEventListener('keydown', this.handleKeyDown);
        }
        var signature = this.refs.mySignature;
        if (this.props.signatureData && this.state.isOpen)
            signature.fromDataURL(this.props.signatureData);
        else if (this.props.signatureData == null && this.clearImg == null)
            this.clearImg = signature.toDataURL();
        else
            signature.clear();
    }

    // clear signature
    clearSignature() {
        var signature = this.refs.mySignature;
        signature.clear();
        this.clearImg = signature.toDataURL();
    }

    // save signature
    saveSignature() {
        var signature = this.refs.mySignature;
        let data = signature.toDataURL();
        if (data != this.clearImg) {
            let name = generateRandomNumber() + '.png';
            base64ToImage(data, name);
            signature.clear();
            if (this.props.saveSign)
                this.props.saveSign(data, name);
        }
        else if (this.props.signatureData) {
            this.props.deleteSign();
        }
        this.hideModal();
    }

    // Render button component with loading effect
    render() {
        return (
            <Modal isOpen={this.state.isOpen} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <ModalTitle>{this.strings.SIGNATURE_PAD}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <SignaturePad ref="mySignature" />
                </ModalBody>
                <ModalFooter>
                    {/*<button className='btn btn-default' onClick={this.clearSignature}>Clear</button>
                    <button className='btn btn-default' onClick={this.saveSignature}>Save</button>*/}
                    <Button
                        inputProps={{
                            name: 'btnClear',
                            label: this.strings.CLEAR,
                            className: 'button1Style button30Style mr10'
                        }}
                        onClick={this.clearSignature} ></Button>
                    <BusyButton
                        inputProps={{
                            name: 'btnSave',
                            label: this.strings.SAVE,
                            className: 'button2Style button30Style'
                        }}
                        loaderHeight={25}
                        onClick={this.saveSignature} ></BusyButton>
                    <Button
                        inputProps={{
                            name: 'btnClose',
                            label: this.strings.CLOSE,
                            className: 'button3Style button30Style pull-left'
                        }}
                        onClick={this.hideModal} ></Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default SignaturePadComponent