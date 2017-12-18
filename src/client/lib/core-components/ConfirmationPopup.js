'use strict';

/*************************************
 * Popup component to display static contents
 * Reference link : https://www.npmjs.com/package/react-modal-bootstrap
 * *************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import BusyButton from '../../lib/wrapper-components/BusyButton';
import Button from '../../lib/core-components/Button';
import { hideConfirmPopup } from '../../app/common/actions';
import Decorator from '../wrapper-components/AbstractDecorator';

class ConfirmationPopup extends Component {

    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // receive updated props from store 
    // show/hide popup accordingly
    componentWillReceiveProps(nextProps) {
        if (nextProps.isOpen == true) {
            this.setState({ isOpen: true });
        }
        else {
            this.setState({ isOpen: false });
        }
    }

    // Handle ESC key
    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.props.hidePopup();
            e.preventDefault();
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }


    // render popup component
    render() {
        let strings = this.props.strings.COMMON.CONFIRMATION_POPUP_COMPONENT;
        let dialogStyles = {
            base: {
                top: -600,
                transition: 'top 0.4s',
                borderRadius: '0px !important'
            },
            open: {
                top: 0
            }
        }
        return (
            <Modal dialogStyles={dialogStyles} isOpen={this.state.isOpen} keyboard={false}>
                <ModalHeader>
                    <ModalClose onClick={this.props.hidePopup} />
                    <h2> {this.props.title ? this.props.title : strings.TITLE}</h2>
                </ModalHeader>
                <ModalBody>
                    {this.props.confirmText ? this.props.confirmText : strings.DEFAULT_TEXT}
                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <BusyButton
                            inputProps={{
                                name: 'btnSubmit',
                                label: this.props.buttonText ? this.props.buttonText : strings.DEFAULT_CONFIRM_BUTTON_LABEL,
                                className: 'button1Style button30Style signin-button mr10'
                            }}
                            redirectUrl={this.props.redirectUrlOnSuccess}
                            onClick={this.props.onConfirm}></BusyButton>
                        <Button
                            inputProps={{
                                name: 'btnClose',
                                label: this.props.cancelText ? this.props.cancelText : strings.DEFAULT_CANCEL_BUTTON_LABEL,
                                className: 'button2Style button30Style signin-button'
                            }}
                            onClick={this.props.onCancel ? this.props.onCancel : this.props.hidePopup}></Button>
                    </div>
                </ModalFooter>
            </Modal>
        )
    }
}

// Define propTypes of Popup
ConfirmationPopup.propTypes = {
    title: React.PropTypes.string,
    confirmText: React.PropTypes.string,
    buttonText: React.PropTypes.string,
    cancelText: React.PropTypes.string,
    redirectUrlOnSuccess: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    strings: React.PropTypes.object
};

ConfirmationPopup.defaultProps = {
    redirectUrlOnSuccess: undefined,
    onConfirm: function () { },
    title: '',
    confirmText: ''
}

var mapStateToProps = (state) => {
    return {
        ...state.common.confirmPopup
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        hidePopup: (info) => {
            dispatch(hideConfirmPopup(info))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Decorator('Common', ConfirmationPopup));