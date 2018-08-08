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

import LoadingBar, { resetLoading } from 'react-redux-loading-bar';

// expose Layout as react component
class Layout extends Component {

    constructor(props) {
        super(props);
        this.hideLoadingIndicator = this.hideLoadingIndicator.bind(this);
    }

    componentDidUpdate() {
        this.hideLoadingIndicator();
    }
    componentDidMount() {
        this.hideLoadingIndicator();
    }

    hideLoadingIndicator() {
        let _this = this;
        setTimeout(function () {
            _this.props.resetLoading();
        }, 100);
    }

    render() {
        return (
            <div className="app-container">
                <LoadingBar style={{ backgroundColor: '#c35f4b', zIndex: 99999 }} />
                <div className="col-md-12">{this.props.children}</div>
                <Footer />
                <ConfirmPopup />
                <NotificationSystem />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetLoading: () => {
            dispatch(resetLoading())
        }
    }
}

export default connect(null, mapDispatchToProps)(Layout);