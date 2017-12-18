'use strict';

/************************************
 * expose collapsible module component
 * Such as Livestock, Grain & Fodder, Security and Setting & Setup etc.
 * ********************************** */

import React, { Component } from 'react';
import outSideClick from 'react-onclickoutside';
import { map } from 'lodash';
import { getMenuIds } from '../../../../../shared/index';

class ModuleMenu extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.moduleMenu = window.__MENUS__.moduleMenu;
        this.controlMenu = window.__MENUS__.controlMenu;

        this.strings = this.props.strings;

        this.state = {
            visible: false,
            selected: this.props.moduleId || null
        }

        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
    }

    // handle outside click
    handleClickOutside(event) {
        if (this.state.visible) {
            this.setState({ visible: false });
            this.props.disableOnClickOutside();
        }
        else {
            this.props.enableOnClickOutside();
        }
    }

    // handle innerclick of menus
    innerClick(e) {
        e.stopPropagation();
    }

    // open dropdown menu area
    openPopup() {
        this.setState({ visible: !this.state.visible });
        if (!this.state.visible)
            this.props.enableOnClickOutside();
    }

    // set moduleId, controlMenuId to store on module click
    setSelectedModule(moduleId) {
        let menuIds = getMenuIds(moduleId);
        this.props.setModule(menuIds.moduleId, menuIds.controlMenuId);
        this.setState({ selected: moduleId, visible: false });
        this.props.disableOnClickOutside();
    }

    // set active class to selected module
    setActive(selectedId) {
        let selected = (selectedId == this.state.selected ? true : false);
        return selected ? 'active' : '';
    }

    // render module menus
    renderModuleMenu() {
        return (map(this.moduleMenu, (m, i) =>
            <li key={i} className={this.setActive(m.Id)} onClick={this.setSelectedModule.bind(this, m.Id)}>
                <a href="javascript:void(0);">
                    <img src={this.siteURL + "/static/images/modules/" + m.Icon} alt={m.Name} className="blk-co-icon" />
                    <img src={this.siteURL + "/static/images/modules/" + m.HoverIcon} alt={m.Name} className="hover-icon" />
                    <span>{m.Name}</span>
                </a>
            </li>));
    }

    // render component
    render() {
        return (<div className={'top-module ' + (this.state.visible ? 'active' : '')} ref="clickEvent" onClick={this.openPopup} >
            <span><img src={this.siteURL + "/static/images/mo-icon.png"} alt="icon" /></span>
            <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                <div className="top-dropdown">
                    <div className="mo-dro-cover">
                        <ul>
                            {this.renderModuleMenu()}
                        </ul>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default outSideClick(ModuleMenu)