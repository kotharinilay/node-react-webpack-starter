'use strict';

/************************************
 * expose collapsible user component
 * Shows user avatar, name of user and service.
 * ********************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import outsideClick from 'react-onclickoutside';

class UserBar extends Component {
    constructor(props) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.state = {
            visible: false
        }
        this.multiLang = 'Header.UserBar.'
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
            <div className={'top-user ' + (this.state.visible ? 'active' : '')} ref="clickEvent" onClick={this.openPopup} >
                <span><img src="./static/images/user-icon.png" alt="user-icon" /></span>
                <h6 className="top-main-name">{this.translate(this.multiLang + 'AndrewDavidson')}<b>{this.translate(this.multiLang + 'Producer')}</b></h6>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                    <div className="top-dropdown">
                        <div className="u-profile">
                            <img src="./static/images/user-icon2.png" alt="user-icon" />
                            <span>{this.translate(this.multiLang + 'AndrewDavidson')}<b>{this.translate(this.multiLang + 'ProducerAbattairSaleAgent')}</b></span>
                        </div>
                        <div className="expire-on">
                            <span>{this.translate(this.multiLang + 'Expires')}</span>
                        </div>
                        <div className="edit-pro">
                            <ul>
                                <li><a href="#">{this.translate(this.multiLang + 'EditProfile')}</a></li>
                                <li><a href="#">{this.translate(this.multiLang + 'ChangePassword')}</a></li>
                                <li><a href="#">{this.translate(this.multiLang + 'Signout')}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default outsideClick(UserBar)