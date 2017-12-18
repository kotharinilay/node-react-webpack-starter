'use strict';

/**************************
 * general layout for unauthenticated routes such as
 * login, signup, forgot password etc
 * **************************** */

// load react dependacies
import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import ConfirmPopup from '../../lib/core-components/ConfirmationPopup';
import NotificationSystem from '../../lib/wrapper-components/ReduxNotificationSystem';
import Footer from './footer';

// expose Layout as react component
class Layout extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="app-container">
                <div className="col-md-12">{this.props.children}</div>
                <Footer />
                <ConfirmPopup   />
                <NotificationSystem />
            </div>
        );
    }
}

export default connect()(Layout);