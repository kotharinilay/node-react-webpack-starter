'use strict';

/*************************************
 * Popup component to display static contents
 * Reference link : https://www.npmjs.com/package/react-modal-bootstrap
 * *************************************/

import React, { Component } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        }
        this.openModal = this.openModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
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
    }

    // Render popup component
    render() {
        return (
            <Modal isOpen={this.state.isOpen} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <ModalTitle>{this.props.modalTitle}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {this.props.modalBody}
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-default' onClick={this.hideModal}>Close</button>
                </ModalFooter>
            </Modal>
        )
    }
}

// Define propTypes of Popup
Popup.propTypes = {
    isESC: React.PropTypes.bool,
    modalTitle: React.PropTypes.string.isRequired,
    modalBody: React.PropTypes.element.isRequired
};

export default Popup;