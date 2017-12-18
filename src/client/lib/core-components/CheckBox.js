'use strict';

/*************************************
 * Checkbox component
 * *************************************/

import React from 'react'
import PureComponent from '../wrapper-components/PureComponent';
import { omit } from 'lodash';
import Checkbox from 'material-ui/Checkbox';
import { checkBoxStyle } from '../../../../assets/js/mui-theme';

class Input extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            visited: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: false
        }
        this.onCheck = this.onCheck.bind(this);
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
        let isValid = true;
        let errorMessage = this.validInput(value);
        if (errorMessage)
            isValid = false;
        this.setState({ error: (isValid ? null : errorMessage) });
        return isValid;
    }

    // Handle onChange event
    onCheck(e) {        
          
        let value = e.target.checked;
        this.fieldStatus.dirty = true;
        this.fieldStatus.visited = true;
        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(this.fieldStatus.value);
        this.updateToStore();
        if (!this.state.visited)
            this.setState({ visited: true });

        if (e.type == 'change' && this.props.onCheck) {                        
            this.props.onCheck(value);
        }
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

        if (props.inputProps.defaultChecked)
            value = props.inputProps.defaultChecked;

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

    // Render checkbox component with error message
    render() {
        let props = this.props;
        let state = this.state;
        const inputProps = omit(props.inputProps, ['label']);
        return (
            <div>
                <Checkbox
                    {...checkBoxStyle}
                    {...inputProps}
                    className={props.className + " checkboxStyle"}
                    onCheck={this.onCheck}
                    label={props.inputProps.label}
                    labelPosition={props.labelPosition}
                    iconStyle={{ marginRight: '5px' }} />
                <span className={(state.error != null && (state.visited || props.isClicked)) ? 'error-message' : 'hidden'}>{state.error}</span>
            </div>
        )
    }
}

// Define propTypes of checkbox
Input.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        label: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        defaultChecked: React.PropTypes.bool
    }).isRequired,
    labelPosition: React.PropTypes.string.isRequired,
    isClicked: React.PropTypes.bool,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    formSetValue: React.PropTypes.func
}

// Define defaultProps of checkbox
Input.defaultProps = {
    eReq: null,
    labelPosition: 'right',
    isClicked: true,
    inputProps: {
        label: null
    }
}

export default Input