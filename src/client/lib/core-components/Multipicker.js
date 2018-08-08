'use strict';

/*************************************
 * Multipicker component to select multiple values from dropdown
 * Reference link : https://jedwatson.github.io/react-select/
 * *************************************/

import React from 'react';
import Select from 'react-select';
import { values, map } from 'lodash';
import { get } from '../../lib/http/http-service';
import PureComponent from '../wrapper-components/PureComponent';
import { mandatory } from '../../lib/index';

class Multipicker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: [],
            visited: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: []
        }

        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    // Validate input value
    validInput(input) {
        if (!input || input.length == 0) {
            return this.props.eReq;
        }
        return null;
    }

    // Handle onBlur events
    onBlur(e) {
        this.fieldStatus.visited = true;
        this.fieldStatus.valid = this.updateErrorState(e.type, this.fieldStatus.value);
        this.updateToStore();
        this.setState({ value: this.fieldStatus.value, visited: this.fieldStatus.visited });
    }

    // Handle onChange events
    onChange(value) {
        this.fieldStatus.dirty = true;
        this.fieldStatus.value = [];
        map(value, (d, index) => this.fieldStatus.value.push(d[this.props.valueField]));
        this.fieldStatus.valid = this.updateErrorState('change', this.fieldStatus.value);
        this.updateToStore();
        this.setState({ value: this.fieldStatus.value });
    }


    // Update error state based on input
    updateErrorState(type, value) {
        let isValid = true;
        let errorMessage = this.validInput(value);
        if (errorMessage)
            isValid = false;
        if (type == 'blur')
            this.setState({ error: (isValid ? null : errorMessage) });
        return isValid;
    }

    // To update component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = [];

        if (props.inputProps.defaultValue && props.inputProps.defaultValue.length > 0)
            value = props.inputProps.defaultValue;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value.length > 0) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.setState({ value: value, error: null });
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // Render component with error message
    render() {

        let manipulateProps = Object.assign({}, this.props.inputProps);

        if ( this.props.eReq != null) {
            manipulateProps.placeholder = mandatory(manipulateProps.placeholder);
        }

        return (
            <div>
                <div className="custom-label">{this.props.inputProps.label}</div>
                <Select
                    {...manipulateProps}
                    value={this.state.value}
                    ref="refInput" matchPos="start"
                    valueKey={this.props.valueField} labelKey={this.props.textField}
                    multi={true} backspaceRemoves={true}
                    onChange={this.onChange} onBlur={this.onBlur}
                    options={this.props.dataSource} />
                <span className={(this.state.error != null && (this.state.visited || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define propTypes of Multipicker
Multipicker.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        label: React.PropTypes.string,
        placeholder: React.PropTypes.node,
        defaultValue: React.PropTypes.array
    }),
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    dataSource: React.PropTypes.array,
    isClicked: React.PropTypes.bool.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    iSelectedValueText: React.PropTypes.array,
    formSetValue: React.PropTypes.func
}

export default Multipicker