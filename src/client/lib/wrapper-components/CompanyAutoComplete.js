'use strict';

import React, { Component } from 'react';
import outSideClick from 'react-onclickoutside';
import Highlight from 'react-highlighter';
import { Scrollbars } from '../../../../assets/js/react-custom-scrollbars';
import { map as _map } from 'lodash';

import Input from '../../lib/core-components/Input';
import { getCompanyLookup } from '../../services/private/livestock';
import { hexToRgba } from '../../../shared/index';
import { NOTIFY_ERROR } from '../../app/common/actiontypes';
import Find from '../../app/common/find';

class CompanyAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            key: Math.random(),
            visible: false,
            isClicked: false,
            dataSource: [],
            searchValue: null
        }

        this.renderCompany = this.renderCompany.bind(this);
        this.fetchCompany = this.fetchCompany.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.selectCompany = this.selectCompany.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    selectCompany(item) {
        this.props.selectCompany({ Id: item.Id, Name: item.Name });
        this.setState({ searchValue: item.Name, visible: false });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.findCompany) {
            let payload = nextProps.findCompany.Payload;
            if (nextProps.findCompany.TargetKey == this.props.targetKey && payload) {
                this.props.selectCompany({ Id: payload.UUID });
                this.setState({ searchValue: payload.Name })
            }
        }
    }

    // render company search result
    renderCompany() {
        if (this.state.dataSource.length > 0 && this.state.visible == true) {

            let highlight = { backgroundColor: "#fec34e" };
            return (<Scrollbars autoHide autoHeight autoHeightMax={220}>
                {_map(this.state.dataSource, (item, index) => {
                    let rgb = '#fff';
                    if (item.ColorCode && typeof (item.ColorCode) == 'object') {
                        let colorObj = JSON.parse(item.ColorCode);
                        rgb = hexToRgba(colorObj.color, colorObj.alpha)
                    }
                    else if (item.ColorCode && typeof (item.ColorCode) == 'string') {
                        rgb = hexToRgba(item.ColorCode, 100);
                    }
                    let address = item.Address;
                    return < div key={index} style={{ borderLeft: "2px solid " + rgb }
                    } className="add-search-cnt" onClick={() => { this.selectCompany(item); }} >
                        {
                            this.state.searchValue != null && this.state.searchValue != undefined && this.state.searchValue.length > 0
                                ? (<h5>
                                    <Highlight search={this.state.searchValue} matchStyle={highlight}>{item.Name}</Highlight>
                                    <Highlight search={this.state.searchValue} matchStyle={highlight}>{address}</Highlight>
                                </h5>)
                                :
                                (<h5>
                                    {item.Name}
                                    <span>{address}</span>
                                </h5>)
                        }
                    </div>
                })}

            </Scrollbars>);
        }
    }

    handleClickOutside(event) {
        this.setState({ visible: false });
    }

    innerClick(e) { e.stopPropagation(); }

    // Get list of property on change
    fetchCompany(value) {
        let _this = this;
        if (value == null || value.length == 0) {
            _this.props.selectCompany({ Id: null });
            _this.setState({ dataSource: [], searchValue: value });
            _this.refs.CompanyName.updateInputStatus();
            return;
        }
        return getCompanyLookup(25, {
            'c.Name': value
        }).then(function (response) {
            if (response.success == true) {
                _this.setState({ dataSource: response.data, searchValue: value, visible: true });
            }
            else {
                _this.setState({ dataSource: [], searchValue: value, visible: false });
            }
            _this.refs.CompanyName.updateInputStatus();
        }).catch(function (error) {

            _this.refs.CompanyName.updateInputStatus();
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    onBlur(value) {
        if (value == null || value.length == 0) {
            this.props.selectCompany({ Id: null });
            this.setState({ searchValue: null });
        }
        else {
            let dataSource = this.state.dataSource;
            if (dataSource != null) {
                let filter = dataSource.filter(function (f) {
                    return f.Name.toLowerCase() == value.toLowerCase();
                });
                if (filter.length == 0) {
                    this.props.selectCompany({ Id: null });
                    this.setState({ searchValue: null });
                }
                if (filter.length > 0) {
                    this.props.selectCompany({ Id: filter[0].Id });
                    this.setState({ searchValue: filter[0].Name, visible: false });
                }

            }
        }
        this.refs.CompanyName.updateInputStatus();
    }

    render() {

        let inputProps = { ...this.props.inputProps, name: 'CompanyName' };

        return (
            <div>
                <div>
                    <Input inputProps={inputProps}
                        initialValue={this.state.searchValue}
                        updateOnChange={true}
                        onChangeInput={this.fetchCompany}
                        onBlurInput={this.onBlur}
                        ref="CompanyName" />
                    <img src={this.siteURL + '/static/images/add-search-icon.png'} style={{ position: 'absolute', right: '20px', top: '30px', cursor: 'pointer' }}
                        onClick={() => {
                            this.props.openFindCompany({
                                TargetKey: this.props.targetKey || 'company'
                            })
                        }} />
                </div>
                <div className='pic-autocomplete-selection'>
                    {this.renderCompany()}
                </div>
                <Find company={true} />
            </div>
        );
    }
}

export default outSideClick(CompanyAutoComplete);