'use strict';

/**************************
 * Allows user to navigate between various screens that basically controls important data 
 * including livestock, company, business unit, configurations etc.
 * **************************** */

import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { map } from 'lodash';
import { contains } from '../../../../../shared/format/string';
import { getIgnoreModule } from '../../../../../shared/index';
import { getCurrentURL } from '../../../../lib/index';
import { NOTIFY_INFO } from '../../../common/actiontypes';

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.controlMenu = window.__MENUS__.controlMenu;

        this.state = {
            selected: this.props.controlMenuId || null,
            moduleId: this.props.moduleId || null,
            setupClicked: this.props.controlMenuId || this.urlPath != '/usersetup' ? false : true
        }

        this.menu = [];
        this.ignoreModule = getIgnoreModule();
    }

    // get control menu on componentWillMount
    componentWillMount() {
        if (this.state.moduleId) {
            this.getControlMenus(this.state.moduleId);
        }
    }

    // get control menu on module selection
    componentWillReceiveProps(nextProps) {
        if (nextProps.moduleId) {
            this.setState({ selected: nextProps.controlMenuId });
            this.getControlMenus(nextProps.moduleId);
        }
    }

    // load control menu based on moduleId
    getControlMenus(moduleId) {
        this.menu = [];
        map(this.controlMenu, c => {
            if (c.ModuleId == moduleId) {
                this.menu.push(c);
            }
        });
    }

    // set controlMenuId to store on control menu click
    setSelectedControlMenu(controlMenuId, setupClicked = false, IsSetupMenu = 0, menu = null) {
        // for temporary perpose only
        if (menu.Name == 'Report') {
            this.props.notifyToaster(NOTIFY_INFO, { message: 'Not implemented yet.' });
        }
        // for temporary perpose only

        this.props.setModule(this.props.moduleId, controlMenuId, IsSetupMenu ? Math.random() : null);
        this.setState({ selected: controlMenuId, setupClicked: setupClicked });
    }

    // redirect to page if control menu is selected
    redirectToPage(redirectURL) {
        this.urlPath = getCurrentURL();
        if (this.urlPath != redirectURL && !contains(this.urlPath, redirectURL + '/')) {
            browserHistory.push(redirectURL);
        }
    }

    // return selected menu class name
    setActive(selectedId, redirectURL = null) {
        let selected = (selectedId == this.state.selected ? true : false);
        if (selected && redirectURL) {
            this.redirectToPage(redirectURL);
        }
        else if (selected && this.state.setupClicked) {
            selected = true;
        }
        else {
            selected = false;
        }
        return selected ? 'active' : '';
    }

    // render control menu
    renderControlMenu() {
        if (this.menu.length > 0) {
            return (
                map(this.menu, (m, i) =>
                    <li key={i} className={this.setActive(m.Id, m.RedirectURL)} onClick={this.setSelectedControlMenu.bind(this, m.Id, false, m.IsSetupMenu, m)} >
                        <Link to={m.RedirectURL || "#"}>
                            <i className="left-side-icon"><img src={this.siteURL + "/static/images/modules/" + m.Icon} alt={m.Name} /></i>
                            <i className="left-icon-hover"><img src={this.siteURL + "/static/images/modules/" + m.HoverIcon} alt={m.Name} /></i>
                            <span>{m.Name}</span></Link>
                    </li>)
            );
        }
        else {
            return null;
        }
    }

    // render setup link at bottom
    renderSetupMenu() {
        if (!this.ignoreModule.includes(this.props.moduleId)) {
            return (
                <li className={this.setActive(null, null)} onClick={this.setSelectedControlMenu.bind(this, null, true)} >
                    <Link to="/usersetup/species">
                        <i className="left-side-icon"><img src={this.siteURL + "/static/images/modules/control-setup.png"} alt={this.props.strings.SETUP_LABEL} /></i>
                        <i className="left-icon-hover"><img src={this.siteURL + "/static/images/modules/control-setup-hover.png"} alt={this.props.strings.SETUP_LABEL} /></i>
                        <span>{this.props.strings.SETUP_LABEL}</span></Link>
                </li>
            );
        }
        else {
            return null;
        }
    }

    // render component
    render() {
        let { strings } = this.props;
        this.urlPath = getCurrentURL();
        return (
            <div className="dash-left">
                <ul>
                    {this.renderControlMenu()}
                </ul>
                <ul className="ul-setting">
                    {this.renderSetupMenu()}
                </ul>
                <div className="clear"></div>
            </div>
        );
    }
}

export default SideBar;