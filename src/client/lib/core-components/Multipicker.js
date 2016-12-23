'use strict';

/*************************************
 * Multipicker component to select multiple values from dropdown
 * Reference link : https://jedwatson.github.io/react-select/
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import Select from 'react-select';
import axios from 'axios';

class Multipicker extends PureComponent {
    constructor(props) {
        super(props);
        if (!this.props.inputProps.value) {
            this.props.inputProps.value = [];
        }
        this.state = {
            isFocus: false,
            error: this.props.eReq
        }
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.getData = this.getData.bind(this);
    }

    // Validate input value
    validInput(input) {
        if (!input || input.length == 0) {
            return this.props.eReq;
        }
        return null;
    }

    // Handle onChange event
    onChange(value, isDirty) {
        let isValid = false;
        let validInput = this.validInput(value);
        if (!validInput) {
            isValid = true;
        }

        if (isDirty === undefined) {
            isDirty = true;
            this.setState({ isFocus: true });
        }        

        this.props.formSetValue(this.props.inputProps.name, value, isValid, isDirty);
    }

    // Handle onBlur event
    onBlur() {
        let validInput = this.validInput(this.refs.refInput.props.value);
        if (validInput) {
            this.setState({ error: validInput });
        }
        else {
            this.setState({ error: null });
        }
    }

    // Get list of data from api from given URL
    getData(input) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }
        return axios.get(this.props.apiUrl.replace('$$$', input))
            .then((response) => {
                return { options: response.data.results };
            })
            .catch(function (error) {
                reject(error);
            });
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, [], true, false);
        }
        if (props.iSelectedValueText) {
            this.onChange(props.iSelectedValueText, false);
        }
    }

    // Render component with error message
    render() {
        return (
            <div>
                <Select.Async ref="refInput"
                    valueKey={this.props.valueField} labelKey={this.props.textField}
                    {...this.props.inputProps}
                    multi={true} backspaceRemoves={true}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    loadOptions={this.getData}
                    />
                <span className={(this.state.error != null && (this.state.isFocus || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define propTypes of Multipicker
Multipicker.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.array
        ]).isRequired
    }),
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    isClicked: React.PropTypes.bool.isRequired,
    apiUrl: React.PropTypes.string.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    iSelectedValueText: React.PropTypes.array,
    formSetValue: React.PropTypes.func.isRequired
}

export default Multipicker