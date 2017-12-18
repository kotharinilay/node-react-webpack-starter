'use strict';

/**************************
 * layout for authenticated routes consisting
 * header, sidebar, footer and dynamic child components
 * **************************** */

// load react dependacies
import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

// load app components
import Header from './header';
import Navigation from './navigation'
import Footer from './footer';
import ConfirmPopup from '../../lib/core-components/ConfirmationPopup';
import Decorator from '../../lib/wrapper-components/AbstractDecorator';
import NotificationSystem from '../../lib/wrapper-components/ReduxNotificationSystem';
import { Scrollbars } from '../../../../assets/js/react-custom-scrollbars';

// expose Layout as react component
class Layout extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="dashboard-main">
                <Header />
                <Navigation />
                <div className="dashboard-middle">                    
                        {this.props.children}                    
                </div>
                <Footer />
                <ConfirmPopup />
                <NotificationSystem />
            </div>
        );
    }
}

export default Decorator('PrivateLayout', Layout);