'use strict';

/*************************************
 * Checkbox component
 * *************************************/

import React from 'react'
import PureComponent from '../wrapper-components/PureComponent';
import lodash from 'lodash';

class Input extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: this.props.eReq
        }
        this.changeInput = this.changeInput.bind(this);
    }

    // Perform checkbox validation
    validInput(value) {
        let props = this.props;
        if (props.eReq && !value)
            return props.eReq;
        return null;
    }

    // Update error state based on input
    updateErrorState(value) {
        let isValid = false;
       let validInput = this.validInput(value);        
        if (validInput) {
            this.setState({ error: validInput });
        }
        else {
            this.setState({ error: null });
            isValid = true;
        }
        return isValid;
    }

    // Handle onChange event
    changeInput(e) {
        let value = this.refs.refInput.checked;
        let isValid = this.updateErrorState(value);
        this.props.formSetValue(this.props.inputProps.name, value, isValid, true);
    }

    // To update component based on predefine values such as eReq, checked etc...
    componentDidMount() {
        let props = this.props;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, props.inputProps.checked, true, false);
        }
        else if (props.inputProps.checked) {
            this.updateErrorState(props.inputProps.checked);
        }
    }

    // Render checkbox component with error message
    render() {
        const inputProps = lodash.omit(this.props.inputProps, ['text']);
        return (
            <div>
                <div className="check-btn">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" ref="refInput"
                                {...inputProps}
                                onChange={this.changeInput} />
                            <span className="checkbox-material"></span>
                            <span className="checkbox-material"></span>
                            <b>{this.props.inputProps.text}</b>
                        </label>
                    </div>
                </div>
                <span className={(this.state.error != null && (this.props.isDirty || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define propTypes of checkbox
Input.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool,
        checked: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.bool,
        ])
    }),
    isDirty: React.PropTypes.bool.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    formSetValue: React.PropTypes.func.isRequired
}

export default Input