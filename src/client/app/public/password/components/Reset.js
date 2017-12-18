'use strict';

/***************************************
 * consist forgot password UI controls and logic
 * ******************************** */

// react, redux dependancies
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
// core components
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import CircularProgress from '../../../../lib/core-components/CircularProgress';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { resetKeyIsValid, resetPassword } from '../../../../services/public/password';
import { clientLogout } from '../../../../services/public/login';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { notifyToaster } from '../../../common/actions';

class ResetPassword extends Component {
    // constructor
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.resetKey = "";
        this.state = {
            isClicked: false,
            loading: true,
            invalidUrl: false,
            isExpired: null,
            userId: '',
            isPassUpdated: false
        }
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onBack = this.onBack.bind(this);
        this.resetPassSchema = ['password'];
    }

    // Handle change password button click
    onChangePassword(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.resetPassSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked) {
                this.setState({ isClicked: true });
            }
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.refs.password.state.error });
            return false;
        }
        let obj = getForm(this.resetPassSchema, this.refs);
        let _this = this;
        let {strings} = this.props;
        resetPassword(this.state.userId, obj.password).then(function (res) {
            if (res.success) {
                _this.setState({ isPassUpdated: true });
            }
            else {
                let errorMsg = _this.props.notify.error(res.error, strings);
                _this.refs.password.setState({ error: errorMsg });
            }
        }).catch(function (err) {
           _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Call api to check key
    componentDidMount() {
        clientLogout();
        if (!(this.props.params && this.props.params.resetpassword) && browserHistory)
            // Return to login page if invalid key
            browserHistory.push('/login');
        else {
            // Update state based on reset key
            this.resetKey = this.props.params.resetpassword;
            let _this = this;
            resetKeyIsValid(this.resetKey).then(function (res) {
                if (res.success) {
                    _this.setState({ loading: false, isExpired: res.expired, userId: res.success ? res.id : '' });
                }
                else if (res.badRequest) {
                    _this.setState({ loading: false, invalidUrl: res.error });
                }
            }).catch(function (err) {
               _this.props.notifyToaster(NOTIFY_ERROR);
            });
        }
    }

    // navigate to login
    onBack() {
        browserHistory.push('/login');
    }

    // render loading content
    renderLoading(strings) {
        return (<div className="forgot-cnt mt25">
            <CircularProgress inputProps={{ size: 20, thickness: 3, className: 'mr5' }} />
            <span>{strings.LOADING}</span>
        </div>);
    }

    // render content for reset password / change password
    renderChangePassword(strings) {
        return (<form autoComplete="off" className="form-cover" onSubmit={this.onChangePassword}>
            <Input inputProps={{
                autoFocus: true,
                name: 'password',
                type: 'password',
                floatingLabelText: strings.CONTROLS.PASSWORD_LABEL,
                hintText: strings.CONTROLS.PASSWORD_PLACE_HOLDER
            }}
                strengthBar={true}
                eReq={strings.CONTROLS.PASSWORD_REQ_MESSAGE}
                minLength={8}
                eLength={strings.CONTROLS.MUST_CHAR_REQ_MESSAGE}
                isClicked={this.state.isClicked} ref="password" />
            <br />
            {strings.PASS_REQUIREMENTS}
            <ul className="reset-pass">
                <li>{strings.MUST_CHAR}</li>
                <li>{strings.DIFF_FROM_EMAIL}</li>
            </ul>
            <div className="form-group forgot-btn checkemail-btn">
                <div className="col-md-12">
                    <div className="row">
                        <Button
                            inputProps={{
                                type: 'submit',
                                name: 'btnChangePassword',
                                label: strings.CONTROLS.CHANGE_PASS_LABEL,
                                className: 'button1Style forgot-button'
                            }}
                            fullWidth={true}
                            onClick={this.onChangePassword} ></Button>
                    </div>
                </div>
            </div>
        </form>);
    }

    // render content if requested link expired
    renderLinkExpired(strings) {
        return (<div>
            <div className="forgot-cnt mt25">
                <p>
                    {strings.LINK_EXPIRED_LINE1}<br />
                    {strings.LINK_EXPIRED_LINE2}
                </p>
            </div>
            <div className="form-group forgot-btn checkemail-btn">
                <div className="col-md-12">
                    <div className="row">
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
        </div>);
    }

    // render content if password updated
    renderPasswordUpdated(strings) {
        return (<div>
            <div className="forgot-cnt mt25">
                <p>
                    {strings.PASSWORD_UPDATED}
                </p>
            </div>
            <div className="form-group forgot-btn checkemail-btn">
                <div className="col-md-12">
                    <div className="row">
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
        </div>);
    }

    // render content if requested link is invalid
    renderInvalidUrl(strings) {
        return (<div>
            <div className="forgot-cnt mt25">
                <p>
                    {translate(multiLang + this.state.invalidUrl)}
                </p>
            </div>
            <div className="form-group forgot-btn checkemail-btn">
                <div className="col-md-12">
                    <div className="row">
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
        </div>);
    }

    // render content based on requested url
    renderContent() {
        if (this.state.loading)
            return this.renderLoading(this.props.strings);

        if (this.state.isPassUpdated)
            return this.renderPasswordUpdated(this.props.strings);

        if (this.state.invalidUrl)
            return this.renderInvalidUrl(this.props.strings);

        if (!this.state.isExpired)
            return this.renderChangePassword(this.props.strings);
        else
            return this.renderLinkExpired(this.props.strings);
    }

    // render JSX
    render() {
        let {strings} = this.props;
        return (
            <div className="login-section-main">
                <header className="header-main">
                    <div className="small-container">
                        <div className="top-sec">
                            <img src={this.siteURL + "/static/images/logo.png"} alt="logo" />
                        </div>
                    </div>
                </header>
                <section className="sign-in-acc">
                    <div className="small-container">
                        <div className="sign-left forgot-center checkemail-center">
                            <div className="form-cover">
                                <h2 className="zero-margin">{strings.TITLE}</h2>
                                {this.renderContent()}
                            </div>
                        </div>
                        <div className="if-you-need"><span>{strings.ABOUT_LINE2}</span></div>
                    </div>
                </section>
            </div>
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
)(Decorator('ResetPassword', ResetPassword));
