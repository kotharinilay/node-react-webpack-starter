'use strict';

/*************************************
 * Autocomplete dropdown components
 * Use it to display Autocomplete dropdown in page
 * *************************************/

import React from 'react';
import axios from 'axios';
import Promise from 'bluebird';
import PureComponent from './PureComponent';
import Autocomplete from '../core-components/_Autocomplete';
import { sanitizers } from '../../../shared/format/string';
import lodash from 'lodash';

class AutocompleteWrap extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            isLoading: false
        }
        this.onChange = this.onChange.bind(this);
    }

    // Get list of data from given URL through api
    getData(value) {
        var self = this;
        return new Promise(function (resolve, reject) {
            return axios.get(self.props.apiUrl.replace('$$$', value))
                .then(function (response) {
                    resolve(response.data.results);
                })
                .catch(function (error) {
                    console.log(error);
                    reject(error);
                });
        })
    }

    // Handle onChange event
    onChange(e, value) {
        this.setState({ isLoading: true });
        var self = this;
        return this.getData(value).then(function (items) {
            self.setState({ dataSource: items, isLoading: false });
        });
    }

    // To update component based on given values
    componentDidMount() {
        let props = this.props;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, '', true, false);
        }
        if (props.iSelectedValue && props.iSelectedText) {
            this.onChange(this, sanitizers.trim(props.iSelectedText));
            this.refs.autocompleteInput.setState({ value: sanitizers.trim(props.iSelectedText) });
            props.formSetValue(props.inputProps.name, props.iSelectedValue, true, false);
        }
        // if (props.iSelectedValue) {
        //     return this.getData('').then(function (items) {
        //         lodash.map(items, (d, index) => {
        //             if (d[self.props.valueField] == props.iSelectedValue) {
        //                 self.onChange(this, d[self.props.textField]);
        //                 self.refs.autocompleteInput.setState({ value: d[self.props.textField] });
        //                 props.formSetValue(props.inputProps.name, d[self.props.valueField], true);
        //             }
        //         })
        //     });
        // }
    }

    // Render Autocomplete component
    render() {
        return (
            <Autocomplete ref='autocompleteInput'
                {...this.props.inputProps}
                items={this.state.dataSource}
                iText={this.props.textField} iValue={this.props.valueField}
                eReq={this.props.eReq} eInvalid={this.props.eInvalid}
                formSetValue={this.props.formSetValue}
                onChange={this.onChange}
                isDirty={this.props.isDirty}
                isClicked={this.props.isClicked}
                isLoading={this.state.isLoading}
                resetLoading={() => this.setState({ isLoading: false })}
                />
        )
    }
}

// Define propTypes of Autocomplete 
AutocompleteWrap.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        disabled: React.PropTypes.bool
    }),
    isDirty: React.PropTypes.bool.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    apiUrl: React.PropTypes.string.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    isDirty: React.PropTypes.bool.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    eInvalid: React.PropTypes.string,
    iSelectedValue: React.PropTypes.string,
    iSelectedText: React.PropTypes.string,
    formSetValue: React.PropTypes.func.isRequired
}
export default AutocompleteWrap