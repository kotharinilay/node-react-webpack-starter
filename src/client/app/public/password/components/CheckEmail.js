'use strict';

/***************************************
 * consist forgot password UI controls and logic
 * ******************************** */

// react, redux dependancies
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';
// core components
import Button from '../../../../lib/core-components/Button';

class CheckEmail extends Component {
    // constructor
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.onBack = this.onBack.bind(this);
    }

    componentWillMount() {
        // Return true if user comes from forgotpassword page
        if (!(this.props.location.state && this.props.location.state.forgotPasswordReq) && browserHistory)
            browserHistory.push('/login');
    }

    // navigate to login
    onBack() {
        browserHistory.push('/login');
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
                                <h2>{strings.TITLE}</h2>
                                <div className="forgot-cnt">
                                    <p>{strings.ABOUT_LINE1}</p>
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
                            </div>
                        </div>
                        <div className="if-you-need"><span>{strings.ABOUT_LINE2}</span></div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Decorator('CheckEmail',CheckEmail);