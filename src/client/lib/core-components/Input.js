'use strict';

/*************************************
 * Input component
 * such as name, mobile number, username, postcode etc...
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import { sanitizers } from '../../../shared/format/string';

class Input extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isFocus: false,
            error: this.props.eReq
        }
        this.changeInput = this.changeInput.bind(this);
    }

    // Validate input value
    validInput(input) {
        let props = this.props;
        if (!input) {
            return props.eReq;
        }
        else if (props.eServerValidation) {
            return props.eServerValidation(input)
        }
        return null;
    }

    // Update error state based on input
    updateErrorState(type, name) {
        let isValid = false;
        let validInput = this.validInput(sanitizers.trim(name));
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

    // Handle onChange/onBlur events
    changeInput(e) {
        if (e.type == 'blur') {
            if (!this.state.isFocus)
                this.setState({ isFocus: true });
            this.refs.refInput.value = sanitizers.trim(this.refs.refInput.value);
        }
        var name = this.refs.refInput.value;
        let isValid = this.updateErrorState(e.type, name);
        this.props.formSetValue(this.props.inputProps.name, name, isValid, true);
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        let val = sanitizers.trim(this.refs.refInput.value);
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
                    className="form-control input-box" type="text" ref="refInput"
                    onBlur={this.changeInput}
                    onChange={this.changeInput} />
                <span className={(this.state.error != null && (this.state.isFocus || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define PropTypes
Input.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool
    }),
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eServerValidation: React.PropTypes.func,
    isClicked: React.PropTypes.bool.isRequired,
    formSetValue: React.PropTypes.func.isRequired
};

export default Input