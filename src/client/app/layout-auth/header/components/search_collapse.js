'use strict';

/************************************
 * expose collapsible search component
 * Allows user to search from screens loaded. 
 * It provides two kind of search – simple and advance search.
 * ********************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import outsideClick from 'react-onclickoutside';

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);

        this.multiLang = 'Header.SearchBar.'
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
            <div className={'top-search ' + (this.state.visible ? "active" : "")} ref="clickEvent" onClick={this.openPopup} >
                <span><img src="./static/images/search-icon.png" alt="search" /></span>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? "popupShow" : "popupHide")}>
                    <div className="top-dropdown">
                        <div className="add-search-top">
                            <div className="form-group is-empty">
                                <input placeholder={this.translate(this.multiLang + 'TypeSearch')} id="inputEmail" className="form-control input-box" type="email" />
                            </div>
                        </div>

                        <div className="search-btn-main">
                            <a href="#" className="search-btn advance-search ripple-effect">
                                {this.translate(this.multiLang + 'AdvanceSearch')}</a>
                            <a href="#" className="search-btn search-now ripple-effect">
                                {this.translate(this.multiLang + 'SearchNow')}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default outsideClick(SearchBar)