'use strict';

/**************************
 * expose app header
 * such as Logo, SearchBar, ModuleBar, PropertyBar and UserBar etc.
 * **************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';

import SearchBar from './search_collapse';
import ModuleBar from './module_collapse';
import PropertyBar from './property_collapse';
import UserBar from './user_collapse';
import localization from '../../../../localization/index';


class Header extends Component {
    constructor(props) {
        super(props);
        this.translate = this.props.translate;
        this.changeLanguage = this.changeLanguage.bind(this);
    }

    changeLanguage(lang) {
        this.props.setLocale(lang);
        localization.loadLanguageSettings(lang);
    }

    render() {
        return (
            <div className="dashbord-header">
                <div className="dash-logo">
                    <Link to="/"><img src="./static/images/dash-logo.png" alt="dash-logo" /></Link>
                </div>

                <p className="pull-left" style={{ marginLeft: '10px' }}>
                    <button
                        className="btn btn-default btn-xs"
                        style={this.props.locale == 'en' ? { border: '1px solid #ddd' } : { border: 'opx' }}
                        onClick={() => this.changeLanguage('en')}>English</button>
                    <button
                        className="btn btn-default btn-xs"
                        style={this.props.locale == 'zh' ? { border: '1px solid #ddd' } : { border: 'opx' }}
                        onClick={() => this.changeLanguage('zh')}>Chinese</button>
                </p>

                <div className="logo-right">
                    <SearchBar disableOnClickOutside={true} translate={this.translate} />
                    <ModuleBar disableOnClickOutside={true} translate={this.translate} />
                    <PropertyBar disableOnClickOutside={true} translate={this.translate} />
                    <UserBar disableOnClickOutside={true} translate={this.translate} />
                </div>
            </div >
        )
    }
}

export default Header