'use strict';

/************************************
 * expose collapsible property component
 * Show property logo and list of PICs that are accessible to users
 * ********************************** */

import React, { Component } from 'react';
import outSideClick from 'react-onclickoutside';
import Highlight from 'react-highlighter';
import { map as _map } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';

import { propertySearch } from '../../../../services/private/property';
import { setDefaultPIC } from '../../../../services/private/contact';
import { NOTIFY_ERROR, NOTIFY_INFO } from '../../../common/actiontypes';

import { hexToRgba } from '../../../../../shared/index';

class PropertySearch extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            visible: false,
            isClicked: false,
            dataSource: null,
            searchValue: null,
            topPIC: this.props.topPIC || {}
        }

        this.togglePopup = this.togglePopup.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.fetchProperty = this.fetchProperty.bind(this);
        this.getPropertyLogo = this.getPropertyLogo.bind(this);
    }

    handleClickOutside(event) {
        if (this.state.visible) {
            this.setState({ visible: false, searchValue: null });
            this.props.disableOnClickOutside();
        }
        else {
            this.props.enableOnClickOutside();
        }
    }

    innerClick(e) {
        e.stopPropagation();
    }

    togglePopup() {
        let _this = this;
        _this.props.enableOnClickOutside();

        propertySearch("").then(function (response) {

            _this.setState({ visible: !_this.state.visible });
            if (response.success == true) {
                _this.setState({ dataSource: response.data, searchValue: null });
            }
            else {
                _this.setState({ dataSource: null, searchValue: null });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Get list of property on change
    fetchProperty(value) {
        // refere contactEmailExist in forgot password page
        let PICSearch = this.refs.PICSearch;
        let _this = this;

        if (value == null || value.length == 0) {
            _this.setState({ dataSource: null, searchValue: value });
            PICSearch.updateInputStatus();
            return;
        }

        propertySearch(value).then(function (response) {
            PICSearch.updateInputStatus();
            if (response.success) {
                _this.setState({ dataSource: response.data, searchValue: value });
            }
            else {
                _this.setState({ dataSource: null, searchValue: value });
            }
        }).catch(function (error) {
            PICSearch.updateInputStatus();
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // set chosen as PIC as global 
    // update user preference
    selectPIC(obj) {
        let _this = this;
        setDefaultPIC(obj.PropertyId).then(function (res) {
            if (res.success == true) {
                _this.props.setTopPIC(obj);
            }
            _this.setState({ visible: false, searchValue: null });
            _this.props.disableOnClickOutside();
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    populateAccessiblePICs() {
        let _this = this;
        return
    }

    // get property logo or place holder image
    getPropertyLogo(url) {
        if (url) {
            return url;
        }
        return this.siteURL + "/static/images/fence-icon.png";
    }

    componentWillReceiveProps(nextProps) {
        let { topPIC } = nextProps;
        if (topPIC == undefined) {
            return;
        }

        this.setState({ topPIC: topPIC });
    }

    // render property search result
    renderProperty() {
        let { strings } = this.props;
        if (this.state.dataSource) {
            if (this.state.dataSource.propertyData.length > 0) {
                let highlight = { backgroundColor: "#fec34e" };
                return (<Scrollbars autoHide autoHeight autoHeightMax={220}>
                    {_map(this.state.dataSource.propertyData, (item, index) => {

                        let colorObj = JSON.parse(item.ColorCode);
                        let suburb = (item.SuburbName ? item.SuburbName + ", " : "") +
                            (item.StateCode ? item.StateCode + ", " : "") +
                            (item.PostCode ? item.PostCode + ", " : "");
                        suburb = suburb.trim();
                        suburb = suburb.length > 0 ? suburb.substr(0, suburb.length - 1) : "";

                        return < div key={index} style={{
                            borderLeft: "2px solid " + hexToRgba(colorObj.color, colorObj.alpha)
                        }
                        } className="add-search-cnt" onClick={this.selectPIC.bind(this, item)} >
                            {
                                this.state.searchValue != null && this.state.searchValue != undefined && this.state.searchValue.length > 0
                                    ? (<h5>
                                        <Highlight search={this.state.searchValue} matchStyle={highlight}>{item.PIC}</Highlight>
                                        <Highlight search={this.state.searchValue} matchStyle={highlight}>{item.Name}</Highlight>
                                        <Highlight search={this.state.searchValue} matchStyle={highlight}>{suburb}</Highlight>
                                    </h5>)
                                    :
                                    (<h5>
                                        {item.PIC}
                                        <span>{item.Name}</span>
                                        <span>{suburb}</span>
                                    </h5>)
                            }
                        </div>
                    })}

                </Scrollbars>);
            }
            else if (this.state.dataSource.contactData.length > 0) {
                let highlight = { backgroundColor: "#fec34e" };
                return (<Scrollbars autoHide autoHeight autoHeightMax={220}>
                    {_map(this.state.dataSource.contactData, (item, index) => {

                        let secondLine = (item.VehicleRegNumber ? item.VehicleRegNumber + ", " : "") +
                            (item.Mobile ? item.Mobile + ", " : "") +
                            (item.Email ? item.Email + ", " : "");
                        secondLine = secondLine.trim();
                        secondLine = secondLine.length > 0 ? secondLine.substr(0, secondLine.length - 1) : "";

                        return < div key={index} style={{ borderLeft: "2px solid transparent" }}
                            className="add-search-cnt" onClick={() => {
                                //this.selectPIC.bind(this, item) 
                            }} >
                            {
                                this.state.searchValue != null && this.state.searchValue != undefined && this.state.searchValue.length > 0
                                    ? (<h5>
                                        <Highlight search={this.state.searchValue} matchStyle={highlight}>{item.Name}</Highlight>
                                        <Highlight search={this.state.searchValue} matchStyle={highlight}>{secondLine}</Highlight>
                                    </h5>)
                                    :
                                    (<h5>
                                        {item.Name}
                                        <span>{suburb}</span>
                                    </h5>)
                            }
                        </div>
                    })}

                </Scrollbars>);
            }
            else
                return (<div className="no-property">
                    <h5>{strings.NO_PROPERTY}</h5>
                </div>);
        }
        else {
            return (<div className="no-property">
                <h5>{strings.NO_PROPERTY}</h5>
            </div>);
        }
    }

    // Render property search bar
    render() {
        let { strings } = this.props;
        return (
            <div className={'top-fance-icon ' + (this.state.visible ? 'active' : '')} ref="clickEvent" onClick={this.togglePopup} >
                <div className="property-search-lbl">
                    <div className="demo-pro-img"><img className="animated-img-bg" src={this.getPropertyLogo(this.state.topPIC.LogoUrl)} alt="fence" /></div>
                    <span>{this.state.topPIC.PIC}<b>{this.state.topPIC.Name}</b></span>
                </div>
                <div onClick={this.innerClick} className={'search-toggle ' + (this.state.visible ? 'popupShow' : 'popupHide')}>
                    <div className="top-dropdown">
                        <div className="form-group">
                            <Input inputProps={{
                                name: 'PICSearch',
                                hintText: strings.PIC_SERACH_PLACE_HOLDER
                            }}
                                initialValue={this.state.searchValue}
                                updateOnChange={true}
                                onChangeInput={this.fetchProperty}
                                ref="PICSearch" />
                        </div>
                        {this.renderProperty()}
                        <Button
                            inputProps={{
                                name: 'btnAdvanceSearch',
                                label: strings.SEARCH_BUTTON_LABEL,
                                className: 'button2Style search-button'
                            }} onClick={() => this.props.notifyToaster(NOTIFY_INFO, { message: 'Not implemented yet.' })}></Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default outSideClick(PropertySearch);