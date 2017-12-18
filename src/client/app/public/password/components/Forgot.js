'use strict';

/***************************************
 * consist forgot password UI controls and logic
 * ******************************** */

// react, redux dependancies
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';

// core components
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Recaptcha from '../../../../lib/core-components/Recaptcha';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
import DocumentTitle from '../../../../lib/wrapper-components/DocumentTitle';

import { forgotPassword, contactUsernameExist } from '../../../../services/public/password';
import { RECAPTCHA_KEY } from '../../../../../../ecosystem/client';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { notifyToaster } from '../../../common/actions';

let recaptchaInstance = null;
class ForgotPassword extends Component {
    // constructor
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.state = { isClicked: false, error: null };
        this.forgotPasswordSchema = ['userEmail'];

        // event handlers        
        this.onSubmit = this.onSubmit.bind(this);
        this.onBack = this.onBack.bind(this);
        this.checkEmailonBlur = this.checkEmailonBlur.bind(this);
    }

    // create a reset function
    resetRecaptcha() {
        recaptchaInstance.reset();
    };

    // send email to user
    onSubmit(e) {
        e.preventDefault();

        let { strings } = this.props;
        let isFormValid = isValidForm(this.forgotPasswordSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.refs.userEmail.state.error });
            return false;
        }
        if (!recaptchaInstance.getResponse()) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: strings.RECAPTCHA_REQ_MESSAGE });
            return false;
        }
        let obj = getForm(this.forgotPasswordSchema, this.refs);
        var _this = this;
        return forgotPassword(obj.userEmail).then(function (res) {
            if (res.success) {
                browserHistory.push({ pathname: '/checkemail', state: { forgotPasswordReq: true } });
                return true;
            }
            else if (!res.unauthorized) {
                _this.resetRecaptcha();
                let errorMsg = _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: strings });
                _this.setState({ error: errorMsg });
                return false;
            }
        }).catch(function (error) {
            this.props.notifyToaster(NOTIFY_ERROR);
            return false;
        });
    }

    // navigate to login
    onBack() {
        browserHistory.push('/login');
    }

    // check duplicate email
    checkEmailonBlur(value) {
        let { strings } = this.props;
        let userEmail = this.refs.userEmail;
        let _this = this;
        contactUsernameExist(value).then(function (response) {
            if (response.success)
                userEmail.updateInputStatus();
            else {
                _this.setState({ error: null });
                let errorMsg = _this.props.notify.error(response.error, strings);
                userEmail.updateInputStatus(errorMsg);
            }
        }).catch(function (error) {
            this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // render JSX
    render() {
        let { strings } = this.props;
        return (
            <DocumentTitle className="login-section-main" title={strings.DOCUMENT_TITLE}>
                <header className="header-main">
                    <div className="small-container">
                        <div className="top-sec">
                            <img src={this.siteURL + "/static/images/logo.png"} alt="logo" />
                        </div>
                    </div>
                </header>
                <section className="sign-in-acc">
                    <div className="small-container">
                        <div className="sign-left forgot-center">
                            <div className="form-cover">
                                <h2>{strings.TITLE}</h2>
                                <div className="forgot-cnt">
                                    <p>{strings.ABOUT_LINE1}</p>
                                </div>
                                <form autoComplete="off" className="form-cover" onSubmit={this.onSubmit}>
                                    <div className="form-group">
                                        <Input inputProps={{
                                            name: 'userEmail',
                                            hintText: strings.CONTROLS.EMAIL_PLACE_HOLDER,
                                            floatingLabelText: strings.CONTROLS.EMAIL_LABEL
                                        }}
                                            onBlurInput={this.checkEmailonBlur}
                                            eReq={strings.CONTROLS.EMAIL_REQ_MESSAGE}
                                            eInvalid={strings.CONTROLS.EMAIL_VALIDATE_MESSAGE}
                                            isClicked={this.state.isClicked} ref="userEmail" />
                                        <span className={(this.state.error != null) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                                    </div>
                                    <div className="form-group">
                                        <Recaptcha ref={e => recaptchaInstance = e} sitekey={RECAPTCHA_KEY}></Recaptcha>
                                    </div>
                                    <div className="form-group forgot-btn">
                                        <div className="col-md-12">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <BusyButton
                                                        inputProps={{
                                                            name: 'btnSubmit',
                                                            label: strings.CONTROLS.SUBMIT_LABEL,
                                                            className: 'button1Style forgot-button'
                                                        }}
                                                        redirectUrl={null}
                                                        loaderHeight={25} fullWidth={true}
                                                        onClick={this.onSubmit} ></BusyButton>
                                                </div>
                                                <div className="col-md-6">
                                                    <Button
                                                        inputProps={{
                                                            name: 'btnBack',
                                                            label: strings.CONTROLS.BACK_LABEL,
                                                            className: 'button2Style forgot-button'
                                                        }}
                                                        fullWidth={true}
                                                        onClick={this.onBack} ></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="if-you-need forgot-if-need"><span>{strings.ABOUT_LINE2}</span></div>
                    </div>
                </section>
            </DocumentTitle>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        }
    }
}

export default connect(
    null,
    mapDispatchToProps
)(Decorator('ForgotPassword', ForgotPassword));
