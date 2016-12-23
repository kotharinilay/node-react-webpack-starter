'use strict';

/************************************
 * expose collapsible module component
 * Such as Livestock, Grain & Fodder, Security and Setting & Setup etc.
 * ********************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import outsideClick from 'react-onclickoutside';

class ModuleBar extends Component {
    constructor(props) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.state = {
            visible: false
        }
        this.multiLang = 'Header.ModuleBar.'
        this.translate = this.props.translate;
    }

    handleClickOutside(event) {
        if (this.state.visible) {
            this.setState({ visible: false });
            this.props.disableOnClickOutside();
        }
        else {
            this.props.enableOnClickOutside();
        }
    }

    innerClick(e) {
        e.stopPropagation();
    }

    openPopup() {
        this.setState({ visible: !this.state.visible });
        if (!this.state.visible)
            this.props.enableOnClickOutside();
    }

    render() {
        return (
            <div className={'top-module ' + (this.state.visible ? 'active' : '')} ref="clickEvent" onClick={this.openPopup} >
                <span><img src="./static/images/mo-icon.png" alt="icon" /></span>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                    <div className="top-dropdown">
                        <div className="mo-dro-cover">
                            <ul>
                                <li className="active">
                                    <a href="#">
                                        <img src="./static/images/live-stoct-dropmenu.png" alt="img" className="blk-co-icon" />
                                        <img src="./static/images/live-stoct-icon.png" alt="img" className="hover-icon" />
                                        <span>{this.translate(this.multiLang + 'Livestock')}</span></a>
                                </li>
                                <li>
                                    <a href="#">
                                        <img src="./static/images/grain-icon.png" alt="img" className="blk-co-icon" />
                                        <img src="./static/images/grain-icon-hover.png" alt="img" className="hover-icon" />
                                        <span>{this.translate(this.multiLang + 'GrainFodder')}</span></a>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <a href="#">
                                        <img src="./static/images/lock-icon.png" alt="img" className="blk-co-icon" />
                                        <img src="./static/images/lock-icon-hover.png" alt="img" className="hover-icon" />
                                        <span>{this.translate(this.multiLang + 'Security')}</span></a>
                                </li>
                                <li>
                                    <a href="#">
                                        <img src="./static/images/setting-icon.png" alt="img" className="blk-co-icon" />
                                        <img src="./static/images/setting-icon-hover.png" alt="img" className="hover-icon" />
                                        <span>{this.translate(this.multiLang + 'SettingSetup')}</span></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default outsideClick(ModuleBar)