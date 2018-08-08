'use strict';

/*************************************
 * Password - ConfirmPassword component
 * Password and ConfirmPassword both fields display together (For Signup, NLIS credential etc...)
 * *************************************/

import React from 'react'
import TextField from 'material-ui/TextField';
import PureComponent from '../wrapper-components/PureComponent'
import { textFieldStyle, errorStyle } from '../../../../assets/js/mui-theme';
import PasswordStrength from './PasswordStrength';
import { mandatory } from '../../lib/index';

class Password extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            error: this.props.eReq,
            visited: false,
            errorCP: this.props.eReqCP,
            visitedCP: false
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: '',
            valueCP: ''
        }
        this.changePassword = this.changePassword.bind(this);
        this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
    }

    // Validate password
    validPassword(input) {
        if (!input)
            return this.props.eReq;
        else if (this.props.eLength) {
            let inputLength = input.length;
            let { minLength, maxLength } = this.props;
            if ((minLength && maxLength && inputLength < minLength && inputLength > maxLength) ||
                (minLength && inputLength < minLength) ||
                (maxLength && inputLength > maxLength))
                return this.props.eLength;
        }
        return null;
    }

    // Validate when onChange/onBlur event handle by ConfirmPassword
    validConfirmPassword(confirmPassword, password) {
        let props = this.props;
        if (!confirmPassword)
            return props.eReqCP;
        else if (confirmPassword != password)
            return props.eCPNotMatch;
        return null;
    }

    // Update error state based on Password
    updateErrorState(type, password) {
        
        let isValid = true;
        let errorMessage = this.validPassword(password);
        if (errorMessage)
            isValid = false;
        if (type == 'blur')
            this.setState({ error: (isValid ? null : errorMessage) });
        return isValid;
    }

    // Update error state based on ConfirmPassword
    updateErrorStateCP(type, password, confirmPassword) {
        let isValid = true;
        let errorMessage = this.validConfirmPassword(confirmPassword, password);
        if (errorMessage)
            isValid = false;
        if (type == 'blur')
            this.setState({ errorCP: (isValid ? null : errorMessage) });
        return isValid;
    }

    // Validate when onBlur event handle by Password
    checkConfirmPassword(password, confirmPassword) {
        
        if (confirmPassword) {
            let props = this.props;
            let isValid = true;
            let errorMessage = null;
            if (confirmPassword != password) {
                isValid = false;
                errorMessage = props.eCPNotMatch;
            }
            this.setState({ errorCP: errorMessage });

            this.fieldStatus.visited = true;
            this.fieldStatus.dirty = true;
            this.fieldStatus.valid = isValid;
            this.fieldStatus.value = password;

            this.updateToStore();
            return isValid;
        }
        else
            return false;
    }

    // Handle onChange/onBlur events by Password
    changePassword(e) {
        
        let props = this.props;
        let password = e.target.value;
        let isValid = this.updateErrorState(e.type, password);
        if (e.type == 'blur') {
            this.fieldStatus.visited = true;
            isValid = this.checkConfirmPassword(password, this.fieldStatus.valueCP);
            if (!this.state.visited) {
                this.setState({ visited: true, visitedCP: true });
            }
        }
        else {
            this.fieldStatus.dirty = true;
            if (this.props.strengthBar) {
                this.refs.PWStrength.checkPasswordStrength(password);
            }
        }

        this.fieldStatus.valid = isValid;
        this.fieldStatus.value = password;
        this.updateToStore();
    }

    // Handle onChange/onBlur events by ConfirmPassword
    changeConfirmPassword(e) {
        
        let props = this.props;
        let confirmPassword = e.target.value;
        let isValid = this.updateErrorStateCP(e.type, this.fieldStatus.value, confirmPassword);
        if (e.type == 'blur' && !this.state.visitedCP) {
            this.setState({ visitedCP: true });
        }

        this.fieldStatus.valid = isValid;
        this.fieldStatus.valueCP = confirmPassword;
        this.updateToStore();
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // To update both component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = props.defaultValue;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.fieldStatus.valueCP = value;
            this.setState({ error: null, errorCP: null });
        }

        if (isUpdateToStore)
            this.updateToStore();

    }

    // Render both component with error message
    render() {
        let props = this.props;
        let state = this.state;

        let manipulateProps = Object.assign({}, props.inputProps);
        if (props.eReq != null) {
            manipulateProps.floatingLabelText = mandatory(manipulateProps.floatingLabelText);
        }

        let manipulatePropsCP = Object.assign({}, props.inputPropsCP);
        if (props.eReqCP != null) {
            manipulatePropsCP.floatingLabelText = mandatory(manipulatePropsCP.floatingLabelText);
        }

        return (
            <div style={{ position: 'relative' }}>
                <TextField
                    {...textFieldStyle}
                    {...manipulateProps}
                    className={props.inputProps.floatingLabelText ? 'inputStyle inputStyle2 ' + props.className : 'inputStyle ' + props.className}
                    defaultValue={props.defaultValue}
                    type="password"
                    fullWidth={props.fullWidth}
                    errorText={(state.error != null && (state.visited || props.isClicked)) ? state.error : ''}
                    onBlur={this.changePassword}
                    errorStyle={errorStyle}
                    onChange={this.changePassword} />
                {props.strengthBar ? <PasswordStrength className={this.props.passwordStrengthClass || ''} ref="PWStrength" /> : null}
                <TextField
                    {...textFieldStyle}
                    {...manipulatePropsCP}
                    className={props.inputProps.floatingLabelText ? 'inputStyle inputStyle2 ' + props.classNameCP : 'inputStyle ' + props.classNameCP}
                    defaultValue={props.defaultValue}
                    type="password"
                    fullWidth={props.fullWidth}
                    errorText={(state.errorCP != null && ((state.visited && state.visitedCP) || props.isClicked)) ? state.errorCP : ''}
                    errorStyle={errorStyle}
                    onBlur={this.changeConfirmPassword}
                    onChange={this.changeConfirmPassword} />
            </div>
        );
    }
}

// Define propTypes of Password - ConfirmPassword
Password.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        hintText: React.PropTypes.string,
        floatingLabelText: React.PropTypes.node
    }).isRequired,
    inputPropsCP: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        hintText: React.PropTypes.string,
        floatingLabelText: React.PropTypes.node
    }).isRequired,
    className: React.PropTypes.string,
    classNameCP: React.PropTypes.string,
    minLength: React.PropTypes.number,
    maxLength: React.PropTypes.number,
    eLength: React.PropTypes.string.isRequired,
    defaultValue: React.PropTypes.string,
    fullWidth: React.PropTypes.bool,
    isClicked: React.PropTypes.bool.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eReqCP: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eCPNotMatch: React.PropTypes.string,
    formSetValue: React.PropTypes.func,
    strengthBar: React.PropTypes.bool
};

//Define defaultProps
Password.defaultProps = {
    fullWidth: true,
    isClicked: true,
    eCPNotMatch: 'Password not match',
    strengthBar: false,
    className: '',
    classNameCP: ''
}

export default Password