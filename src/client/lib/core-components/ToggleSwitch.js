'use strict';

/*************************************
 * Toggle Switch component
 * *************************************/

import React from 'react'
import Toggle from 'material-ui/Toggle';
import PureComponent from '../wrapper-components/PureComponent';
import { toggleSwitchStyle } from '../../../../assets/js/mui-theme';

class ToggleSwitch extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            visited: false,
            error: this.props.eReq,
            value: this.props.initialValue
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: false
        }
        this.onToggle = this.onToggle.bind(this);
    }

    // Perform Toggle validation
    validInput(value) {
        let props = this.props;
        if (props.eReq && !value)
            return props.eReq;
        return null;
    }

    // Update error state based on input
    updateErrorState(value) {
        let isValid = true;
        let errorMessage = this.validInput(value);
        if (errorMessage)
            isValid = false;
        this.setState({ error: (isValid ? null : errorMessage) });
        return isValid;
    }

    // Handle onChange event
    onToggle(e) {
        let value = e.target.checked;
        this.fieldStatus.dirty = true;
        this.fieldStatus.visited = true;
        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(this.fieldStatus.value);
        this.setState({ value: value });
        this.updateToStore();
        if (!this.state.visited)
            this.setState({ visited: true });
        if (this.props.onToggleChange)
            this.props.onToggleChange(this.props.inputProps.name, value);
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // To update component based on predefine values such as eReq, defaultChecked etc...
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = false;

        if (props.initialValue)
            value = props.initialValue;

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

    // Render Toggle component with error message
    render() {
        let props = this.props;
        let state = this.state;

        return (
            <div>
                <Toggle defaultToggled={this.state.value} {...toggleSwitchStyle} {...props.inputProps} onToggle={this.onToggle} />
                <span className={(state.error != null && (state.visited || props.isClicked)) ? 'error-message' : 'hidden'}>{state.error}</span>
            </div>
        )
    }
}

// Define propTypes of toggle switch
ToggleSwitch.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool,
        //defaultToggled: React.PropTypes.bool
    }).isRequired,
    isClicked: React.PropTypes.bool,
    initialValue: React.PropTypes.bool,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    onToggleChange: React.PropTypes.func,
    formSetValue: React.PropTypes.func
}

// Define defaultProps of toggle switch
ToggleSwitch.defaultProps = {
    eReq: null,
    isClicked: true,
    initialValue: false
}

export default ToggleSwitch