'use strict';

/**************************
 * expose app footer
 * Show copyright information and corporate website URL
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getAppVersion } from '../../../../shared';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import ContactUs from './components/ContactUs';
import { notifyToaster } from '../../common/actions';

class Footer extends Component {
    constructor(props) {
        super(props);
        this.contactUs = this.contactUs.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.redirectToNotification = this.redirectToNotification.bind(this);
        this.state = {
            contactUsPopup: false
        }
    }

    // Open contact us popup
    contactUs() {
        this.setState({ contactUsPopup: true });
    }

    // Close contact us popup
    closePopup() {
        this.setState({ contactUsPopup: false });
    }

    redirectToNotification() {
        browserHistory.push('/dashboard/notification');
    }

    render() {
        let { strings } = this.props;
        return (
            <section className="copyright">
                <div className="privacy-po">
                    <div className="noti-cover">
                        <div className="notify" onClick={this.redirectToNotification}>
                            <span><em className="notify-count">13</em><b></b></span>
                        </div>
                    </div>
                    <ul>
                        <li><a href="#">{strings.PRIVACY_POLICY}</a></li>
                        <li><a href="#">{strings.LICENSE_AGREEMENT}</a></li>
                        <li><a href="#">{strings.HELP}</a></li>
                        <li><a onClick={this.contactUs}>{strings.CONTACT_US}</a></li>
                    </ul>
                    {this.state.contactUsPopup ?
                        <ContactUs
                            notifyToaster={this.props.notifyToaster}
                            strings={{ ...strings.CONTACTUS_POPUP, COMMON: strings.COMMON }}
                            closePopup={this.closePopup} />
                        : null}
                </div>
                <div className="copy-text">
                    <span>{strings.COPYRIGHT}&copy; {strings.COPYRIGHT_AGLIVE}   <b>{strings.VERSION} {getAppVersion()}</b></span>
                </div>
            </section>
        )
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
)(Decorator('Footer', Footer));