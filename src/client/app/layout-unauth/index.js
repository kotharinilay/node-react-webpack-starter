'use strict';

/**************************
 * general layout for unauthenticated routes such as
 * login, signup, forgot password etc
 * **************************** */

// load react dependacies
import React, { Component } from 'react';
import { Link } from 'react-router';

// expose Layout as react component
export default class UnAuthLayout extends Component {
    render() {
        return (
            <div className="app-container">
                <div className="col-md-12">{this.props.children}</div>
            </div>
        );
    }
}