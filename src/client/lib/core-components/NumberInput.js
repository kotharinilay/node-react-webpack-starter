'use strict';

/*************************************
 * Number Input component (allows to enter number only)
 * Reference link : http://www.material-ui.com/#/components/text-field
 * https://material.io/guidelines/components/text-fields.html
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import { trim } from '../../../shared/format/string';
import TextField from 'material-ui/TextField';
import CircularProgress from '../core-components/CircularProgress';
import { textFieldStyle,errorStyle } from '../../../../assets/js/mui-theme';
import PasswordStrength from './PasswordStrength';
import { mandatory } from '../../lib/index';

class NumberInput extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            visited: false,
            isLoading: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: ''
        }
        this.changeInput = this.changeInput.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    onKeyPress(e) {
        var charCode = (e.which) ? e.which : e.keyCode;
        var number = e.target.value.split('.');
        if (this.props.numberType == "number" && charCode == 46) {
            e.preventDefault();
        }
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
        //just one dot
        if (number.length > 1 && charCode == 46) {
            e.preventDefault();
        }
        // if (this.props.format && this.props.numberType == "decimal") {
        //     let val = (e.target.value + String.fromCharCode(e.which)).split('.');
        //     let format = this.props.format.split('.');
        //     if (val.length == 1 && format[0].length > 0 && val[0].length > format[0].length) {
        //         e.preventDefault();
        //     }
        //     else if (val.length == 2 && (format[0].length > 0 && val[0].length > format[0].length || val[1].length > format[1].length)) {
        //         e.preventDefault();
        //     }
        // }
    }

    // Validate input value
    validInput(input) {
        let props = this.props;
        if (!input)
            return props.eReq;
        else if (props.eLength) {
            let inputLength = input.length;
            let {minLength, maxLength} = props;
            if ((minLength && maxLength && inputLength < minLength && inputLength > maxLength) ||
                (minLength && inputLength < minLength) ||
                (maxLength && inputLength > maxLength))
                return props.eLength;
        }
        else if (props.eClientValidation)
            return props.eClientValidation(input)
        return null;
    }

    // Update error state based on input
    updateErrorState(type, value) {
        let isValid = true;
        let errorMessage = this.validInput(trim(value));
        if (errorMessage)
            isValid = false;
        if (type == 'blur')
            this.setState({ error: (isValid ? null : errorMessage) });
        return isValid;
    }

    // Handle onChange/onBlur events
    changeInput(e) {
        let value = e.target.value;
        if (e.type == 'blur') {
            value = trim(e.target.value);
            this.fieldStatus.visited = true;
            if (!this.state.visited)
                this.setState({ visited: true });
        }
        else {
            this.fieldStatus.dirty = true;
        }

        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(e.type, this.fieldStatus.value);
        this.updateToStore();

        if (this.fieldStatus.valid) {
            if (e.type == 'blur' && this.props.onBlurInput) {
                this.setState({ isLoading: true });
                this.props.onBlurInput(this.fieldStatus.value);
            }
            else if (e.type == 'change' && this.props.onChangeInput) {
                this.setState({ isLoading: true });
                this.props.onChangeInput(this.fieldStatus.value);
            }
        }
    }

    // Update fieldStatus of input
    updateInputStatus(errorMessage) {
        this.setState({ isLoading: false });
        this.fieldStatus.valid = errorMessage ? false : true;
        this.setState({ error: (this.fieldStatus.valid ? null : errorMessage) });
        this.updateToStore();
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // To update component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = '';

        if (props.inputProps.defaultValue)
            value = trim(props.inputProps.defaultValue);

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.setState({ error: null });
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Render component with error message
    render() {
        let props = this.props;
        let state = this.state;
        let manipulateProps = Object.assign({},props.inputProps);

        if(props.eReq != null){
            manipulateProps.floatingLabelText = mandatory(manipulateProps.floatingLabelText);
        }
        return (
            <div style={{ position: 'relative' }}>
                {state.isLoading ?
                    <CircularProgress inputProps={{ size: 15, thickness: 2, className: 'input-loading' }} />
                    : <div className='input-loading'></div>}
                <TextField
                    {...textFieldStyle}
                    {...manipulateProps}
                    className={props.inputProps.floatingLabelText ? 'inputStyle inputStyle2 ' + props.className : 'inputStyle ' + props.className}
                    minLength={props.minLength}
                    maxLength={props.maxLength}
                    fullWidth={props.fullWidth}
                    errorText={(state.error != null && (state.visited || props.isClicked)) ? state.error : ''}
                    errorStyle={errorStyle}
                    onBlur={this.changeInput}
                    onChange={this.changeInput}
                    onKeyPress={this.onKeyPress} />
            </div>
        )
    }
}

// Define PropTypes
NumberInput.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        type: React.PropTypes.string,
        autoFocus: React.PropTypes.bool,
        hintText: React.PropTypes.string,
        defaultValue: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        floatingLabelText: React.PropTypes.node
    }).isRequired,
    className: React.PropTypes.string,
    minLength: React.PropTypes.number,
    maxLength: React.PropTypes.number,
    eLength: React.PropTypes.string,
    fullWidth: React.PropTypes.bool,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eClientValidation: React.PropTypes.func,
    isClicked: React.PropTypes.bool,
    formSetValue: React.PropTypes.func,
    onBlurInput: React.PropTypes.func,
    onChangeInput: React.PropTypes.func,
    numberType: React.PropTypes.string
};

//Define defaultProps
NumberInput.defaultProps = {
    fullWidth: true,
    eReq: null,
    isClicked: true,
    numberType: 'number',
    className: ''
}

export default NumberInput