import React, { Component } from 'react';
import Email from '../../../../lib/core-components/Email';
import Password from '../../../../lib/core-components/Password';
import Button from '../../../../lib/core-components/Button';

class Login extends Component {
    render() {
        debugger;
        return (
            <div className="login-section-main">
                <div className="login-cover">
                    <header className="header-main">
                        <div className="small-container">
                            <div className="top-sec">
                                <a href="dashboard.html"><img src="./static/images/logo.png" alt="logo" /></a>
                            </div>
                        </div>
                    </header>
                    <section className="sign-in-acc">
                        <div className="small-container">
                            <div className="sign-left">
                                <div className="form-cover">
                                    <h2>Sign in to your account</h2>
                                    <div className="form-group is-empty is-password">
                                        <label className="col-md-2 control-label" htmlFor="inputEmail">Email</label>
                                        <div className="col-md-10">
                                            <Email
                                                inputProps={{ name: "Email", id: "Email", value: this.props.login.Email.value, placeholder: 'Enter email address' }}
                                                eReq="Please enter email address" eInvalid="Invalid email address"
                                                formSetValue={this.props.loginFormSetValue} isClicked={this.props.login.isClicked} />
                                        </div>
                                    </div>
                                    <div className="form-group is-empty is-password">
                                        <label className="col-md-2 control-label" htmlFor="inputEmail">Password</label>
                                        <div className="col-md-10">
                                            <input type="password" placeholder="Enter password" id="inputEmail01" className="form-control input-box" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="col-md-6 check-btn">
                                            <div className="row">
                                                <div className="checkbox">
                                                    <label>
                                                        <input type="checkbox" /><span className="checkbox-material"></span> <b>Remember me</b>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 forgot-pass">
                                            <a href="#">Forgot Password?</a>
                                        </div>
                                    </div>
                                    <div className="sign-main">
                                        <a href="dashboard.html" className="ripple-effect btn btn-raised  btn-primary">Sign in</a>
                                    </div>
                                </div>
                            </div>
                            <div className="sign-right">
                                <div className="right-cover">
                                    <h2>Create your aglive account</h2>
                                    <p>Join Aglive's revolutionary evidence-based tracking and authentication-enabled
                            technology allowing food to be tracked from "paddock to plate" through the food production value chain.</p>
                                    <p>Real-time digitized NVD solutions that provide complete traceabiliy of livestock through farm to saleyards,
                            processors and beyond.</p>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="ag-envd">
                                                <h3>Aglive eNVD <span>Free Mob eNVD</span></h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row">
                                            <div className="ag-pro">
                                                <h3>Aglive Pro <span>Full Farm Management</span></h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 signup-bottom"><a href="#">Signup now</a></div>
                                </div>

                            </div>
                            <div className="if-you-need"><span>If you need help please call our friendly Australian based support team on 1-300-893-473</span></div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }
}

export default Login;