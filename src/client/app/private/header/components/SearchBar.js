'use strict';

/************************************
 * expose collapsible search component
 * Allows user to search from screens loaded. 
 * It provides two kind of search – simple and advance search.
 * ********************************** */

import React, { Component } from 'react';
import { Link } from 'react-router';
import outSideClick from 'react-onclickoutside';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import { NOTIFY_ERROR } from '../../../common/actiontypes';

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            visible: false,
            displayClear: false,
            inputKey: Math.random()
        }
        this.openPopup = this.openPopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.searchClick = this.searchClick.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.showClear = this.showClear.bind(this);
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

    searchClick(e) {
        e.preventDefault();
        let searchText = this.refs.searchTextbox.fieldStatus.value;
        if (searchText) {
            this.props.setSearch(searchText);
            this.setState({ visible: false });
            this.props.disableOnClickOutside();
        }
        else {
            this.props.notifyToaster(NOTIFY_ERROR, { message: 'Please specify search criteria.' })
        }
    }

    clearSearch(e) {
        e.preventDefault();
        this.setState({
            displayClear: false,
            inputKey: Math.random()
        });
        this.props.setSearch(null);
        this.setState({ visible: false });
        this.props.disableOnClickOutside();
    }

    showClear() {
        let searchTextbox = this.refs.searchTextbox;
        searchTextbox.updateInputStatus();
        this.setState({
            displayClear: searchTextbox.fieldStatus.value ? true : false
        });
    }

    render() {
        let { strings } = this.props;
        return (
            <div className={'top-search ' + (this.state.visible ? "active" : "")} ref="clickEvent" onClick={this.openPopup} >
                <span><img src={this.siteURL + "/static/images/search-icon.png"} alt="search" /></span>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? "popupShow" : "popupHide")}>
                    <form autoComplete="off" onSubmit={(e) => this.searchClick(e)}>
                        <div className="top-dropdown">
                            <div className="add-search-top">
                                <div className="form-group" key={this.state.inputKey}>
                                    <Input inputProps={{
                                        name: 'Search',
                                        hintText: strings.TYPESEARCH_PLACE_HOLDER
                                    }}
                                        onChangeInput={this.showClear}
                                        ref='searchTextbox' />
                                    {this.state.displayClear ?
                                        <a href="javascript:void(0)" className="btnClear" onClick={(e) => this.clearSearch(e)}>×</a> : null}
                                </div>
                            </div>

                            <div className="search-btn-main">
                                <Button
                                    inputProps={{
                                        name: 'btnAdvanceSearch',
                                        label: strings.ADVANCE_SEARCH_LABEL,
                                        className: 'button2Style search-button'
                                    }} onClick={() => console.log('button clicked')}></Button>

                                <Button
                                    inputProps={{
                                        name: 'btnSearchNow',
                                        label: strings.SEARCH_NOW_LABEL,
                                        className: 'button2Style search-button mr10'
                                    }} onClick={(e) => this.searchClick(e)}></Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        )
    }
}

export default outSideClick(SearchBar);