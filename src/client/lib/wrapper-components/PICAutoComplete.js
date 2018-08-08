
import React, { Component } from 'react';
import outSideClick from 'react-onclickoutside';
import Highlight from 'react-highlighter';
import { Scrollbars } from '../../../../assets/js/react-custom-scrollbars';
import { map as _map } from 'lodash';

import Input from '../../lib/core-components/Input';
import { propertySearch } from '../../services/private/property';
import { hexToRgba } from '../../../shared/index';
import { NOTIFY_ERROR } from '../../app/common/actiontypes';
import Find from '../../app/common/find';

class PICAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            key: Math.random(),
            visible: false,
            isClicked: false,
            dataSource: [],
            searchValue: null,
            name: null,
            suburb: null
        }

        this.renderProperty = this.renderProperty.bind(this);
        this.fetchProperty = this.fetchProperty.bind(this);
        this.innerClick = this.innerClick.bind(this);
        this.selectPIC = this.selectPIC.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    selectPIC(item) {
        this.props.selectPIC({ PIC: item.PIC, Id: item.PropertyId });
        this.setState({ searchValue: item.PIC, visible: false, name: item.Name, suburb: item.SuburbName + "," + item.StateCode + "," + item.PostCode });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.findPIC) {
            let payload = nextProps.findPIC.Payload;
            if (nextProps.findPIC.TargetKey == this.props.targetKey && payload) {
                this.setState({ searchValue: payload.PIC, name: payload.Name, suburb: payload.SuburbName + "," + payload.StateCode + "," + payload.PostCode })
                this.props.selectPIC({ PIC: payload.PIC, Id: payload.UUID });
                this.props.hideFindPIC(null);
            }
        }
        if (this.props.initialValue != nextProps.initialValue) {
            this.setState({ searchValue: nextProps.initialValue });
        }
    }

    // render property search result
    renderProperty() {
        if (this.state.dataSource.length > 0 && this.state.visible == true) {

            let highlight = { backgroundColor: "#fec34e" };
            return (<Scrollbars autoHide autoHeight autoHeightMax={220}>
                {_map(this.state.dataSource, (item, index) => {

                    let colorObj = JSON.parse(item.ColorCode);
                    let suburb = (item.SuburbName ? item.SuburbName + ", " : "") +
                        (item.StateCode ? item.StateCode + ", " : "") +
                        (item.PostCode ? item.PostCode + ", " : "");
                    suburb = suburb.length > 0 ? suburb.trim().substr(0, suburb.length - 1) : "";

                    return < div key={index} style={{
                        borderLeft: "2px solid " + hexToRgba(colorObj.color, colorObj.alpha)
                    }
                    } className="add-search-cnt" onClick={() => { this.selectPIC(item); }} >
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
    }

    handleClickOutside(event) {
        this.setState({ visible: false });
    }

    innerClick(e) { //e.stopPropagation(); 
    }

    // Get list of property on change
    fetchProperty(value) {
        let _this = this;
        if (value == null || value.length == 0) {
            _this.props.selectPIC(null);
            _this.setState({ dataSource: [], searchValue: value, name: null, suburb: null });
            _this.refs.PIC.updateInputStatus();
            return;
        }
        return propertySearch(value).then(function (response) {
            if (response.success == true) {
                _this.setState({ dataSource: response.data.propertyData, searchValue: value, visible: true });
            }
            else {
                _this.setState({ dataSource: [], searchValue: value, visible: falsem });
            }
            _this.refs.PIC.updateInputStatus();
        }).catch(function (error) {
            _this.refs.PIC.updateInputStatus();
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    onBlur(value) {
        if (value == null || value.length == 0) {
            this.props.selectPIC(null);
            this.setState({ name: null, suburb: null });
        }
        else {
            this.props.selectPIC({ PIC: value, Id: null });
        }
        this.refs.PIC.updateInputStatus(!value ? this.props.eReq : null);
    }

    render() {
        let inputProps = { ...this.props.inputProps, name: 'PIC' };
        return (
            <div>
                <div>
                    <Input inputProps={inputProps}
                        eReq={this.props.eReq || null}
                        initialValue={this.state.searchValue}
                        updateOnChange={true}
                        onChangeInput={this.fetchProperty}
                        onBlurInput={this.onBlur}
                        callOnChange={true}
                        ref="PIC" isClicked={this.props.isClicked} />
                    <img src={this.siteURL + '/static/images/add-search-icon.png'} style={{ position: 'absolute', right: '20px', top: '30px', cursor: 'pointer' }}
                        onClick={() => {
                            if (!inputProps.disabled)
                                this.props.openFindPIC({
                                    TargetKey: this.props.targetKey || 'pic'
                                })
                        }} />
                </div>
                <div className='pic-autocomplete-selection'>
                    {this.renderProperty()}
                </div>
                {this.props.showDetail ?
                    <div>
                        <Input inputProps={{
                            disabled: true,
                            name: 'Name',
                            floatingLabelText: 'Property Name',
                            hintText: 'Property Name'
                        }}
                            initialValue={this.state.name}
                            updateOnChange={true}
                            ref="name" />

                        <Input inputProps={{
                            disabled: true,
                            name: 'Suburb',
                            floatingLabelText: 'Suburb,State,Postcode',
                            hintText: 'Suburb,State,Postcode'
                        }}
                            initialValue={this.state.suburb}
                            updateOnChange={true}
                            ref="suburb" />
                    </div> : null}
                <Find property={true} />
            </div>
        );
    }
}

export default outSideClick(PICAutoComplete);