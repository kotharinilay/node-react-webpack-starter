'use strict';

/**************************
 * layout for authenticated routes consisting
 * header, sidebar, footer and dynamic child components
 * **************************** */

// load react dependacies
import React, { Component } from 'react';
import { Link } from 'react-router';

// load app components
import Header from './header';
import Navigation from './navigation'
import Footer from './footer';

// expose Layout as react component
class Layout extends Component {
    render() {
        return (
            <div className="dashboard-main">
                <Header />
                <Navigation />
                <div className="dashboard-middle">{this.props.children}</div>
                <Footer />
            </div>
        );
    }
}

export default Layout