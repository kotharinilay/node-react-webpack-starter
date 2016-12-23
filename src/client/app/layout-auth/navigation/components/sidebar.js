'use strict';

/**************************
 * Allows user to navigate between various screens that basically controls important data 
 * including livestock, company, business unit, configurations etc.
 * **************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';

class SideBar extends Component {
    render() {

        let {translate} = this.props;
        let multiLang = 'SideBar.'

        return (
            <div className="dash-left">
                <ul>
                    <li className="active">
                        <Link to="/livestock">
                            <i className="left-side-icon"><img src="./static/images/live-stoct-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/live-stoct-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Livestock')}</span></Link>
                    </li>
                    <li>
                        <a href="wizard.html">
                            <i className="left-side-icon"><img src="./static/images/envd-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/envd-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'eNVD')}</span></a>
                    </li>
                    <li>
                        <Link to="/test">
                            <i className="left-side-icon"><img src="./static/images/property-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/property-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Property')}</span></Link>
                    </li>
                    <li>
                        <a href="#">
                            <i className="left-side-icon"><img src="./static/images/bu-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/bu-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Business')}</span></a>
                    </li>
                    <li>
                        <a href="#">
                            <i className="left-side-icon"><img src="./static/images/conact-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/conact-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Contact')}</span></a>
                    </li>
                    <li>
                        <a href="report.html">
                            <i className="left-side-icon"><img src="./static/images/support-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/support-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Report')}</span></a>
                    </li>
                </ul>
                <ul className="ul-setting">
                    <li>
                        <a href="setup.html">
                            <i className="left-side-icon"><img src="./static/images/set-up-icon.png" alt="livestock" /></i>
                            <i className="left-icon-hover"><img src="./static/images/set-up-icon-hover.png" alt="livestock" /></i>
                            <span>{translate(multiLang + 'Setup')}</span></a>
                    </li>
                </ul>
                <div className="clear"></div>
            </div>
        );
    }
}

export default SideBar;