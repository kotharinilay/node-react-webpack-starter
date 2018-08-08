'use strict';

/**************************
 * Map all actions and props to header component
 * such as search, setlocale actions and state of searchkey and locale.
 * **************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { withTranslate, IntlActions } from 'react-redux-multilingual';

import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { search, setModule } from './actions';
import localization from '../../../localization/index';
import { notifyToaster } from '../../common/actions';
import { openConfirmPopup, hideConfirmPopup } from '../../common/actions';
import { setTopPIC } from './actions';
import { getMenuIds } from '../../../../shared/index';

// components
import SearchBar from './components/SearchBar';
import ModuleMenu from './components/ModuleMenu';
import PropertySearch from './components/PropertySearch';
import UserMenu from './components/UserMenu';
import ChangePassword from './components/ChangePassword';

class Header extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            openChangePassword: false
        };
        this.changeLanguage = this.changeLanguage.bind(this);
        this.toggleChangePassword = this.toggleChangePassword.bind(this);
        this.redirectToHome = this.redirectToHome.bind(this);

        if (this.props.authUser) {
            this.companyLogo = this.props.authUser.CompanyLogo ? this.props.authUser.CompanyLogo
                : this.siteURL + "/static/images/no-image-available.png";
        }

    }

    changeLanguage(lang) {
        this.props.setLocale(lang);
        localization.loadLanguageSettings(lang);
    }

    toggleChangePassword(isOpen) {
        this.setState({ openChangePassword: isOpen });
    }

    redirectToHome() {
        let menuIds = getMenuIds(null, null, [], [], false);
        this.props.setModule(menuIds.moduleId, menuIds.controlMenuId);
    }

    render() {
        let { strings } = this.props;
        return (
            <div className="dashbord-header" key={this.props.moduleId + this.props.controlMenuId}>
                <div className="dash-logo">
                    <Link to="/dashboard" onClick={this.redirectToHome}><img src={this.siteURL + "/static/images/dash-logo.png"} alt="dash-logo" /></Link>
                </div>

                <p className="pull-left" style={{ marginLeft: '10px', display: 'none' }}>
                    <button
                        className="btn btn-default btn-xs"
                        style={this.props.locale == 'en' ? { border: '1px solid #ddd' } : { border: 'opx' }}
                        onClick={() => this.changeLanguage('en')}>{strings.LANGUAGE.ENGLISH}</button>
                    <button
                        className="btn btn-default btn-xs"
                        style={this.props.locale == 'zh' ? { border: '1px solid #ddd' } : { border: 'opx' }}
                        onClick={() => this.changeLanguage('zh')}>{strings.LANGUAGE.CHINESE}</button>
                </p>

                <div className="logo-right">
                    <SearchBar disableOnClickOutside={true} strings={strings.SEARCH_BAR} setSearch={this.props.search} notifyToaster={this.props.notifyToaster} />
                    <ModuleMenu disableOnClickOutside={true} strings={strings.MODULE_BAR} setModule={this.props.setModule} moduleId={this.props.moduleId} />
                    <div className='top-company-logo'>
                        <span><img className="company-icon animated-img-bg" src={this.companyLogo} alt="user-icon" /></span>
                    </div>
                    <PropertySearch disableOnClickOutside={true} strings={strings.PROPERTY_BAR} setTopPIC={this.props.setTopPIC} topPIC={this.props.topPIC} notifyToaster={this.props.notifyToaster} />
                    <UserMenu disableOnClickOutside={true} strings={strings.USER_BAR} notifyToaster={this.props.notifyToaster}
                        setModule={this.props.setModule} moduleId={this.props.moduleId}
                        authUser={this.props.authUser}
                        toggleChangePassword={this.toggleChangePassword}
                        openConfirmPopup={this.props.openConfirmPopup}
                        hideConfirmPopup={this.props.hideConfirmPopup} />
                    {this.state.openChangePassword ?
                        <ChangePassword
                            notifyToaster={this.props.notifyToaster}
                            strings={{ ...strings.USER_BAR.CHANGE_PASSWORD_COMPONENT, COMMON: strings.COMMON }}
                            toggleChangePassword={this.toggleChangePassword} />
                        : null}
                </div>
            </div >
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        search: (searchText) => {
            dispatch(search(searchText));
        },
        setLocale: (lan) => {
            dispatch(IntlActions.setLocale(lan));
        },
        setModule: (moduleId, controlMenuId) => {
            dispatch(setModule(moduleId, controlMenuId));
        },
        openConfirmPopup: (info) => {
            dispatch(openConfirmPopup(info));
        },
        hideConfirmPopup: (info) => {
            dispatch(hideConfirmPopup(info));
        },
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options));
        },
        setTopPIC: (payload) => {
            dispatch(setTopPIC(payload));
        }
    }
}

const mapStateToProps = (state) => {
    return {
        searchKey: state.header,
        moduleId: state.header.moduleId,
        locale: state.Intl.locale,
        authUser: state.authUser,
        topPIC: state.header.topPIC
    }
}


export default connect(mapStateToProps, mapDispatchToProps)
    (Decorator('Header', Header));