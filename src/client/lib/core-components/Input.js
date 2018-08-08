'use strict';

/*************************************
 * Input component
 * such as name, email, password, multiLine input, mobile number, username, postcode etc...
 * Reference link : http://www.material-ui.com/#/components/text-field
 * https://material.io/guidelines/components/text-fields.html
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import { isEmail, trim } from '../../../shared/format/string';
import TextField from 'material-ui/TextField';
import CircularProgress from '../core-components/CircularProgress';
import { textFieldStyle, errorStyle } from '../../../../assets/js/mui-theme';
import PasswordStrength from './PasswordStrength';
import { mandatory } from '../../lib/index';
import { omit } from 'lodash';

class Input extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            visited: false,
            isLoading: false,
            error: this.props.eReq,
            value: this.props.initialValue || ''
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: ''
        }

        this.changeInput = this.changeInput.bind(this);
    }

    // Validate input value
    validInput(input) {
        let props = this.props;
        if (!input)
            return props.eReq;
        else if (props.eInvalid && !isEmail(input))
            return props.eInvalid;
        else if (props.eLength) {
            let inputLength = input.length;
            let { minLength, maxLength } = props;
            if ((minLength && maxLength && inputLength < minLength && inputLength > maxLength) ||
                (minLength && inputLength < minLength) ||
                (maxLength && inputLength > maxLength))
                return props.eLength;
        }
        else if (props.eClientValidation)
            return props.eClientValidation(input, props.inputProps.floatingLabelText)
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
            this.setState({ value: value })
            if (this.props.strengthBar) {
                this.refs.PWStrength.checkPasswordStrength(value);
            }
        }

        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(e.type, this.fieldStatus.value);
        this.updateToStore();

        if (this.fieldStatus.valid || this.props.callOnChange) {
            if (e.type == 'blur' && this.props.onBlurInput) {
                if (this.props.isLoading) {
                    this.setState({ isLoading: true });
                }
                this.props.onBlurInput(this.fieldStatus.value);
            }
            else if (e.type == 'change' && this.props.onChangeInput) {
                if (this.props.isLoading) {
                    this.setState({ isLoading: true });
                }
                this.props.onChangeInput(this.fieldStatus.value);
            }
        }
    }

    // Update fieldStatus of input
    updateInputStatus(errorMessage, forceUpdate = true) {
        if (forceUpdate) {
            this.fieldStatus.valid = errorMessage ? false : true;
            this.fieldStatus.visited = true;
            this.setState({ error: (this.fieldStatus.valid ? null : errorMessage), isLoading: false, visited: true });
            this.updateToStore();
        }
        else if (!forceUpdate && this.fieldStatus.visited) {
            this.fieldStatus.valid = errorMessage ? false : true;
            this.setState({ error: (this.fieldStatus.valid ? null : errorMessage), isLoading: false });
            this.updateToStore();
        }
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
        if (props.initialValue)
            value = trim(props.initialValue);

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

        if (props.eClientValidation && props.isClicked)
            this.setState({ error: props.eClientValidation(value, props.inputProps.floatingLabelText) });

        if (isUpdateToStore)
            this.updateToStore();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.initialValue != this.props.initialValue && this.props.updateOnChange) {
            this.fieldStatus.value = nextProps.initialValue;
            this.fieldStatus.valid = !this.fieldStatus.value && nextProps.eReq ? false : true;
            this.setState({ value: this.fieldStatus.value || '', error: this.fieldStatus.valid ? null : nextProps.eReq });
            this.updateToStore();
        }
    }

    // Render component with error message
    render() {
        let props = this.props;
        let state = this.state;
        let inputFieldStyle = {};
        let manipulateProps = Object.assign({}, props.inputProps);

        if (props.eReq != null && props.hideStar == false) {
            manipulateProps.floatingLabelText = mandatory(manipulateProps.floatingLabelText);
        }

        if (props.isUppercase) {
            inputFieldStyle = Object.assign({}, omit(textFieldStyle, ['inputStyle']));
            inputFieldStyle = {
                ...inputFieldStyle,
                inputStyle: { ...textFieldStyle.inputStyle, textTransform: 'uppercase' }
            };
        }
        else {
            inputFieldStyle = Object.assign({}, textFieldStyle);
        }

        return (
            <div style={{ position: 'relative' }}>
                {state.isLoading ?
                    <CircularProgress inputProps={{ size: 15, thickness: 2, className: props.inputProps.floatingLabelText ? 'input-loading input-loading2' : 'input-loading' }} />
                    : <div className='input-loading'></div>}
                <TextField
                    {...inputFieldStyle}
                    {...manipulateProps}
                    value={this.state.value}
                    className={props.inputProps.floatingLabelText && !props.multiLine ? 'inputStyle inputStyle2 ' + props.className : 'inputStyle ' + props.className}
                    minLength={props.minLength}
                    maxLength={props.maxLength}
                    fullWidth={props.fullWidth}
                    multiLine={props.multiLine}
                    rows={props.multiLine ? props.rows : 1}
                    rowsMax={props.multiLine ? props.rowsMax : 1}
                    errorText={(state.error != null && (state.visited || props.isClicked)) ? state.error : ''}
                    errorStyle={errorStyle}
                    onBlur={this.changeInput}
                    onChange={this.changeInput} />
                {props.strengthBar ? <PasswordStrength className="passwordStrength" ref="PWStrength" /> : null}
            </div>
        )
    }
}

// Define PropTypes
Input.propTypes = {
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
    multiLine: React.PropTypes.bool,
    rows: React.PropTypes.number,
    rowsMax: React.PropTypes.number,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    hideStar: React.PropTypes.bool,
    isLoading: React.PropTypes.bool,
    eInvalid: React.PropTypes.string,
    eClientValidation: React.PropTypes.func,
    isClicked: React.PropTypes.bool,
    formSetValue: React.PropTypes.func,
    onBlurInput: React.PropTypes.func,
    onChangeInput: React.PropTypes.func,
    strengthBar: React.PropTypes.bool,
    isUppercase: React.PropTypes.bool
};

//Define defaultProps
Input.defaultProps = {
    inputProps: {
    },
    className: '',
    fullWidth: true,
    multiLine: false,
    rows: 3,
    rowsMax: 3,
    eReq: null,
    eInvalid: null,
    isClicked: true,
    strengthBar: false,
    hideStar: false,
    isLoading: true,
    isUppercase: false
}

export default Input