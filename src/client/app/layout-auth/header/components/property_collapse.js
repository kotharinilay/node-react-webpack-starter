'use strict';

/************************************
 * expose collapsible property component
 * Show property logo and list of PICs that are accessible to users
 * ********************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import outsideClick from 'react-onclickoutside';

class PropertyBar extends Component {
    constructor(props) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.state = {
            visible: false
        }
        this.multiLang = 'Header.PropertyBar.'
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
            <div className={'top-fance-icon ' + (this.state.visible ? 'active' : '')} ref="clickEvent" onClick={this.openPopup} >
                <span className="demo-pro-img"><img src="./static/images/fence-icon.png" alt="fence" /></span>
                <span>{this.translate(this.multiLang + 'NA123456')}<b>{this.translate(this.multiLang + 'DemoProperty')}</b></span>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                    <div className="top-dropdown">
                        <div className="form-group is-empty">
                            <input placeholder={this.translate(this.multiLang + 'TypePICSearch')} id="inputEmail01" className="form-control input-box" type="email" />
                        </div>
                        <div className="add-search-cnt">
                            <div className="yellow-pipe">
                            </div>
                            <h5>{this.translate(this.multiLang + 'NA123456')}<span>{this.translate(this.multiLang + 'DemoProducer')}</span></h5>
                        </div>
                        <div className="add-search-cnt">
                            <div className="orange-pipe">
                            </div>
                            <h5>{this.translate(this.multiLang + 'NA123456')}<span>{this.translate(this.multiLang + 'DemoProducer')}</span></h5>
                        </div>
                        <div className="add-search-cnt">
                            <div className="sky-blue-pipe">
                            </div>
                            <h5>{this.translate(this.multiLang + 'NA123456')}<span>{this.translate(this.multiLang + 'DemoProducer')}</span></h5>
                        </div>
                        <a href="#" className="search-btn ripple-effect">{this.translate(this.multiLang + 'AdvanceSearch')}</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default outsideClick(PropertyBar)