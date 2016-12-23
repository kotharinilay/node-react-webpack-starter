'use strict';

/*************************************
 * Password component
 * Display single password field to page
 * *************************************/

import React from 'react'
import PureComponent from '../wrapper-components/PureComponent'

class Password extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isFocus: false,
            error: this.props.eReq
        }
        this.changePassword = this.changePassword.bind(this);
    }

    // Validate password
    validPassword(input) {
        if (!input) {
            return this.props.eReq;
        }
        return null;
    }

    // Update error state based on input
    updateErrorState(type, password) {
        let isValid = false;
        let validInput = this.validPassword(password);
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

    // Handle onChange event
    changePassword(e) {
        let password = this.refs.passwordInput.value;
        if (e.type == 'blur' && !this.state.isFocus) {
            this.setState({ isFocus: true });
        }
        let isValid = this.updateErrorState(e.type, password);
        this.props.formSetValue(this.props.inputProps.name, password, isValid, true);
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        let val = this.refs.passwordInput.value;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, val, true, false);
        }
        else if (val) {
            this.updateErrorState('blur', val);
        }
    }

    // Render component with error message
    render() {
        return (
            <div>
                <input
                    {...this.props.inputProps}
                    className="form-control" type="password" ref="passwordInput"
                    onChange={this.changePassword}
                    onBlur={this.changePassword} />
                <span className={(this.state.error != null && (this.state.isFocus || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        );
    }
}

// Define propTypes of Password
Password.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string.isRequired
    }),
    isClicked: React.PropTypes.bool.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    formSetValue: React.PropTypes.func.isRequired
};

export default Password