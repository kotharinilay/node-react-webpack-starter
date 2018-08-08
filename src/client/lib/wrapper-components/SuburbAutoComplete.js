'use strict';

/***********************************
 * Auto complete for suburb and fill 
 * state  and post code from selected suburb
 * *********************************/

import React, { Component } from 'react';
import Input from '../../lib/core-components/Input';
import AutoComplete from '../../lib/core-components/AutoComplete';
import { getSuburbDetails } from '../../services/private/setup';
import { bufferToUUID } from '../../../shared/uuid';

class SuburbAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.state = {
            suburbId: this.props.suburbSelectedValue, //? bufferToUUID(this.props.suburbSelectedValue) : '',
            suburbName: this.props.suburbSearchText ? this.props.suburbSearchText : '',
            stateId: this.props.stateDefaultId ? bufferToUUID(this.props.stateDefaultId) : '',
            stateName: this.props.stateDefaultValue ? this.props.stateDefaultValue : '',
            stateSystemCode: null,
            suburbPostCode: this.props.postcodeDefaultValue ? this.props.postcodeDefaultValue : '',
            isValid: true
        }
    }

    onSelectionChange(valueObj) {
        if (valueObj.Id) {
            let _this = this;
            if (valueObj.Id != this.state.suburbId) {
                getSuburbDetails(valueObj.Id).then(function (res) {
                    if (res.data) {
                        if (_this.props.onStateChange) {
                            _this.props.onStateChange(res.data.StateSystemCode, res.data.DefaultGPS);
                        }
                        _this.setState({
                            suburbId: res.data.Id,
                            suburbName: res.data.SuburbName,
                            stateId: res.data.StateId,
                            stateName: res.data.StateName,
                            stateSystemCode: res.data.StateSystemCode,
                            suburbPostCode: res.data.PostCode,
                            isValid: true
                        });
                        _this.refs[_this.props.suburbName].refs.refElement.setState({ searchText: res.data.SuburbName })
                        _this.refs[`${_this.props.suburbName}_state`].setState({ value: res.data.StateName || '' });
                        _this.refs[`${_this.props.suburbName}_postcode`].setState({ value: res.data.PostCode || '' });
                    }
                    else {
                        _this.setState({
                            suburbId: valueObj.Id,
                            suburbName: valueObj.SuburbName,
                            stateId: null,
                            stateName: null,
                            stateSystemCode: null,
                            suburbPostCode: null,
                            isValid: _this.props.isRequired ? false : true
                        });
                        _this.refs[_this.props.suburbName].refs.refElement.setState({ searchText: valueObj.SuburbName || '' })
                        _this.refs[`${_this.props.suburbName}_state`].setState({ value: '' });
                        _this.refs[`${_this.props.suburbName}_postcode`].setState({ value: '' });
                    }
                });
            }
        }
        else {
            this.setState({
                suburbId: null,
                suburbName: null,
                stateId: null,
                stateName: null,
                stateSystemCode: null,
                suburbPostCode: null,
                isValid: !this.props.isRequired
            });
            this.refs[this.props.suburbName].refs.refElement.setState({ searchText: '' })
            this.refs[`${this.props.suburbName}_state`].setState({ value: '' });
            this.refs[`${this.props.suburbName}_postcode`].setState({ value: '' });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.countryId != nextProps.countryId) {
            this.onSelectionChange({});
            this.refs[this.props.suburbName].setState({ dataSource: [] });
            this.refs[this.props.suburbName].refs.refElement.setState({ searchText: "" })
        }
        if (this.props.suburbSelectedValue != nextProps.suburbSelectedValue && this.props.fatchData) {
            this.onSelectionChange({ Id: nextProps.suburbSelectedValue });
        }
    }


    render() {
        let { strings } = this.props;
        return (
            <div className={this.props.componentClass} >
                <div className={this.props.suburbClass}>
                    <AutoComplete inputProps={{
                        name: this.props.suburbName,
                        id: this.props.suburbName,
                        hintText: this.props.suburbHintText || strings.SUBURB_PLACEHOLDER,
                        floatingLabelText: this.props.suburbfloatingLabelText || strings.SUBURB_LABEL,
                        className: "inputStyle inputStyle2",
                        disabled: this.props.isDisabled
                    }}
                        searchText={this.props.suburbSearchText}
                        eReq={this.props.isRequired ? this.props.reqMessage : null}
                        eInvalid={null}
                        selectedValue={this.props.suburbSelectedValue}
                        textField="SuburbName" valueField="Id"
                        apiUrl={`/api/private/suburb/getall?countryId=${this.props.countryId}&search=$$$`}
                        isClicked={this.props.isClicked} ref={this.props.suburbName}
                        onSelectionChange={this.onSelectionChange} />
                </div>
                <div className={this.props.stateClass}>
                    <Input inputProps={{
                        name: `${this.props.suburbName}_state`,
                        id: `${this.props.suburbName}_state`,
                        hintText: this.props.stateHintText || strings.STATE_PLACEHOLDER,
                        floatingLabelText: this.props.statefloatingLabelText || strings.STATE_LABEL,
                        disabled: true
                    }}
                        onChangeInput={this.props.onStateChange}
                        maxLength={50} initialValue={this.props.stateDefaultValue}
                        ref={`${this.props.suburbName}_state`} />
                </div>
                <div className={this.props.postcodeClass}>
                    <Input inputProps={{
                        name: `${this.props.suburbName}_postcode`,
                        id: `${this.props.suburbName}_postcode`,
                        hintText: this.props.postcodeHintText || strings.POSTCODE_PLACEHOLDER,
                        floatingLabelText: this.props.postcodefloatingLabelText || strings.POSTCODE_LABEL,
                        disabled: true
                    }}
                        maxLength={10} initialValue={this.props.postcodeDefaultValue}
                        ref={`${this.props.suburbName}_postcode`} />
                </div>
            </div>
        );
    }
}

// Define propTypes of dropdown
SuburbAutoComplete.propTypes = {
    componentClass: React.PropTypes.string,
    countryId: React.PropTypes.string,
    suburbClass: React.PropTypes.string,
    suburbName: React.PropTypes.string.isRequired,
    suburbfloatingLabelText: React.PropTypes.string,
    suburbHintText: React.PropTypes.string,
    suburbSearchText: React.PropTypes.string,
    suburbSelectedValue: React.PropTypes.any,
    isRequired: React.PropTypes.bool,
    reqMessage: React.PropTypes.string,
    isClicked: React.PropTypes.bool.isRequired,

    stateClass: React.PropTypes.string,
    stateHintText: React.PropTypes.string,
    statefloatingLabelText: React.PropTypes.string,
    stateDefaultValue: React.PropTypes.string,
    stateDefaultId: React.PropTypes.any,

    postcodeClass: React.PropTypes.string,
    postcodeHintText: React.PropTypes.string,
    postcodefloatingLabelText: React.PropTypes.string,
    postcodeDefaultValue: React.PropTypes.string
}

// Define defaultProps of dropdown
SuburbAutoComplete.defaultProps = {
    componentClass: '',
    suburbClass: '',
    stateClass: '',
    postcodeClass: '',
    isRequired: false,
    suburbSelectedValue: '',
    stateDefaultValue: '',
    suburbfloatingLabelText: null,
    countryId: ''
}

export default SuburbAutoComplete;