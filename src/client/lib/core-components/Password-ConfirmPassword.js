'use strict';

/*************************************
 * Password - ConfirmPassword component
 * Password and ConfirmPassword both fields display together (For Signup, NLIS credential etc...)
 * *************************************/

import React from 'react'
import PureComponent from '../wrapper-components/PureComponent'

class Password extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            error: this.props.eReq,
            isFocus: false,
            errorCP: this.props.eReqCP,
            isFocusCP: false
        }
        this.changePassword = this.changePassword.bind(this);
        this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
    }

    // Validate password
    validPassword(input) {
        if (!input) {
            return this.props.eReq;
        }
        return null;
    }

    // Update error state based on Password
    updateErrorState(type, password) {
        let isValid = false;
        const validInput = this.validPassword(password);
        if (validInput && type == 'blur') {
            this.setState({ error: validInput });
        }
        else {
            if (type == 'blur')
                this.setState({ error: null });
            isValid = true;
        }
        return isValid;
    }

    // Update error state based on ConfirmPassword
    updateErrorStateCP(type, password, confirmPassword) {
        let isValid = false;
        let validInput = this.validConfirmPassword(confirmPassword, password);
        if (validInput && type == 'blur') {
            this.setState({ errorCP: validInput });
        }
        else {
            if (type == 'blur')
                this.setState({ errorCP: null });
            isValid = true;
        }
        return isValid;
    }

    // Validate when onBlur event handle by Password
    checkConfirmPassword(password, confirmPassword) {
        let props = this.props;
        if (confirmPassword) {
            let isValid = false;
            if (confirmPassword != password) {
                this.setState({ errorCP: props.eCPNotMatch });
            }
            else {
                this.setState({ errorCP: null });
                isValid = true;
            }
            props.formSetValue(props.inputPropsCP.name, confirmPassword, isValid);
        }
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

    // Handle onChange/onBlur events by Password
    changePassword(e) {
        let props = this.props;
        let password = this.refs.passwordInput.value;
        let isValid = this.updateErrorState(e.type, password);
        props.formSetValue(props.inputProps.name, password, isValid, true);
        if (e.type == 'blur') {
            this.checkConfirmPassword(password, props.inputPropsCP.value);
            if (!this.state.isFocus) {
                this.setState({ isFocus: true });
            }
        }
    }

    // Handle onChange/onBlur events by ConfirmPassword
    changeConfirmPassword(e) {
        let props = this.props;
        let confirmPassword = this.refs.confirmPasswordInput.value;
        let isValid = this.updateErrorStateCP(e.type, props.inputProps.value, confirmPassword);
        props.formSetValue(props.inputPropsCP.name, confirmPassword, isValid, true);
        if (e.type == 'blur' && !this.state.isFocusCP) {
            this.setState({ isFocusCP: true });
        }
    }

    // To update both component based on predefine values
    componentDidMount() {
        let props = this.props;
        let val = this.refs.passwordInput.value;
        let valCP = this.refs.confirmPasswordInput.value;

        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, '', true, false);
        }
        else if (val) {
            this.updateErrorState('blur', val);
            this.checkConfirmPassword(val, valCP);
        }

        if (!props.eReqCP) {
            props.formSetValue(props.inputPropsCP.name, '', true, false);
        }
        else if (valCP) {
            this.updateErrorStateCP('blur', val, valCP);
        }
    }

    // Render both component with error message
    render() {
        return (
            <div>
                <div>
                    <input
                        {...this.props.inputProps}
                        className="form-control" type="password" ref="passwordInput"
                        onChange={this.changePassword}
                        onBlur={this.changePassword} />
                    <span className={(this.state.error != null && (this.state.isFocus || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                </div>
                <div>
                    <input
                        {...this.props.inputPropsCP}
                        className="form-control" type="password" ref="confirmPasswordInput"
                        onChange={this.changeConfirmPassword}
                        onBlur={this.changeConfirmPassword} />
                    <span className={(this.state.errorCP != null && (this.state.isFocus || this.state.isFocusCP || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.errorCP}</span>
                </div>
            </div>
        );
    }
}

// Define propTypes of Password - ConfirmPassword
Password.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string.isRequired
    }),
    inputPropsCP: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string.isRequired
    }),
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eReqCP: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eCPNotMatch: React.PropTypes.string,
    isClicked: React.PropTypes.bool.isRequired,
    formSetValue: React.PropTypes.func.isRequired
};

export default Password