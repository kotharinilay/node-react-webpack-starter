'use strict';

/******************************
 * expose login component
 * **************************** */

import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

import Input from '../../../../lib/core-components/Input';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Button from '../../../../lib/core-components/Button';
import CheckBox from '../../../../lib/core-components/CheckBox';
import Recaptcha from '../../../../lib/core-components/Recaptcha';
import DocumentTitle from '../../../../lib/wrapper-components/DocumentTitle';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { post } from '../../../../lib/http/http-service';
import { setToken } from '../../../../lib/http/token-management';

import cookieFn from '../../../../../shared/cookie';
import { RECAPTCHA_KEY } from '../../../../../../ecosystem/client';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

let recaptchaInstance = null;

class Login extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        let loginAttempt = parseInt(cookieFn.getCookie('loginAttempt'));
        this.state = {
            isClicked: false,
            error: null,
            enableCaptcha: loginAttempt >= 3 ? true : false
        }
        this.loginUser = this.loginUser.bind(this);
        this.loginSchema = ['loginEmail', 'loginPassword', 'RememberMe'];
    }

    // create a reset function
    resetRecaptcha() {
        recaptchaInstance.reset();
    };

    loginUser(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.loginSchema, this.refs);
        if (isFormValid) {
            if (this.state.enableCaptcha) {
                if (!recaptchaInstance.getResponse()) {
                    this.props.notifyToaster(NOTIFY_ERROR, { message: "Recaptcha is required !" });
                    return false;
                }
            }
            let obj = getForm(this.loginSchema, this.refs);
            let data = "grant_type=password&client_id=webapp&client_secret=aglivev3webapp&username=" + obj.loginEmail + "&password=" + obj.loginPassword;
            var _this = this;

            return post('/oauth/token', data, { 'Content-Type': 'application/x-www-form-urlencoded' }, null, false).then(function (res) {
                setToken(res.data.Token, obj.RememberMe)
                cookieFn.deleteCookie('loginAttempt');
                _this.props.setUserInfo(res.data.userInfo);
                _this.props.setTopPIC(res.data.userInfo.TopPIC);
                return true;
            }).catch(function (err) {
                if (_this.state.enableCaptcha) _this.resetRecaptcha();
                let loginAttempt = cookieFn.getCookie('loginAttempt');
                if (!loginAttempt) {
                    cookieFn.createCookie('loginAttempt', 1, 1);
                }
                else {
                    let value = parseInt(loginAttempt) + 1;
                    cookieFn.createCookie('loginAttempt', value, 1);
                    if (value >= 3) {
                        _this.setState({ enableCaptcha: true })
                    }
                }

                _this.setState({ error: err.response.data.error_description })
            });
        }
        else {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
        }
    }

    render() {
        let { strings } = this.props;
        let redirect = null;
        ;
        if (this.props.location.query && this.props.location.query.redirect) {
            redirect = this.props.location.query.redirect;
        }
        else {
            redirect = "/dashboard";
        }

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
                        <div className="sign-left">
                            <form autoComplete="off" className="form-cover" onSubmit={this.loginUser}>
                                <h2>{strings.TITLE}</h2>
                                <div className="form-group is-password">
                                    <label className="col-md-2 control-label" htmlFor="loginEmail">{strings.CONTROLS.EMAIL_LABEL}</label>
                                    <div className="col-md-10">
                                        <Input inputProps={{
                                            name: 'loginEmail',
                                            hintText: strings.CONTROLS.EMAIL_PLACE_HOLDER
                                        }}
                                            hideStar={true}
                                            eReq={strings.CONTROLS.EMAIL_REQ_MESSAGE}
                                            eInvalid={strings.CONTROLS.EMAIL_VALIDATE_MESSAGE}
                                            isClicked={this.state.isClicked} ref="loginEmail" />
                                    </div>
                                </div>
                                <div className="form-group is-password">
                                    <label className="col-md-2 control-label" htmlFor="loginPassword">{strings.CONTROLS.PASSWORD_LABEL}</label>
                                    <div className="col-md-10">
                                        <Input inputProps={{
                                            name: 'loginPassword',
                                            type: 'password',
                                            hintText: strings.CONTROLS.PASSWORD_PLACE_HOLDER
                                        }}
                                            hideStar={true}
                                            eReq={strings.CONTROLS.PASSWORD_REQ_MESSAGE}
                                            isClicked={this.state.isClicked} ref="loginPassword" />
                                        <span className={(this.state.error != null) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                                    </div>
                                </div>
                                <div className={this.state.enableCaptcha ? 'form-group' : 'hidden'}>
                                    <Recaptcha ref={e => recaptchaInstance = e} sitekey={RECAPTCHA_KEY}></Recaptcha>
                                </div>
                                <div className="form-group">
                                    <div className="col-md-6 check-btn">
                                        <div className="row">
                                            <CheckBox inputProps={{
                                                name: 'RememberMe',
                                                label: strings.CONTROLS.REMEMBERME_LABEL
                                            }}
                                                isClicked={this.state.isClicked} ref="RememberMe" />
                                        </div>
                                    </div>
                                    <div className="col-md-6 forgot-pass">
                                        <Link to="/forgotpassword"> {strings.CONTROLS.FORGOTPASSWORD_LABEL}</Link>
                                    </div>
                                </div>
                                <div className="sign-main">
                                    <BusyButton
                                        inputProps={{
                                            type: 'submit',
                                            name: 'btnSubmit',
                                            label: strings.CONTROLS.SIGNIN_LABEL,
                                            className: 'button1Style signin-button'
                                        }}
                                        fullWidth={true}
                                        redirectUrl={redirect}
                                        onClick={this.loginUser}></BusyButton>
                                </div>
                            </form>
                        </div>
                        <div className="sign-right">
                            <div className="right-cover">
                                <h2>{strings.CREATE_AGLIVE_ACCOUNT}</h2>
                                <p>{strings.DESCRIPTION_LINE1}</p>
                                <p>{strings.DESCRIPTION_LINE2}</p>
                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="ag-pro">
                                            <h3>{strings.AGLIVE_PRO_LABEL} <span>{strings.FULLFARM_MANAGEMENT_LABEL}</span></h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 signup-bottom"><a href="#">{strings.CONTROLS.SIGNUPNOW_LABEL}</a></div>
                            </div>
                        </div>
                        <div className="if-you-need"><span>{strings.FOOTER_TEXT}</span></div>
                    </div>
                </section>
            </DocumentTitle>
        );
    }
}

// wrap with notification
export default Login;