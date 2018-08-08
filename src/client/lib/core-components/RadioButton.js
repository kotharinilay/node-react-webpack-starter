'use strict';

/*************************************
 * Radio button component
 * *************************************/

import React from 'react';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { radioButtonStyle } from '../../../../assets/js/mui-theme';
import PureComponent from '../wrapper-components/PureComponent';
import { omit, values, map } from 'lodash';

class RadioButtonComponent extends PureComponent {
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
            value: null
        }
        this.data = [...this.props.dataSource];
        this.onChange = this.onChange.bind(this);
    }

    // Perform radio button validation
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
    onChange(e, value) {
        this.fieldStatus.dirty = true;
        this.fieldStatus.visited = true;
        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(this.fieldStatus.value);
        this.updateToStore();
        if (!this.state.visited)
            this.setState({ visited: true });

        if (this.fieldStatus.valid || this.props.callOnChange) {
            if (this.props.onChange) {
                this.props.onChange(this.fieldStatus.value, e.target.textContent);
            }
        }
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputGroupProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // To update component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = null;

        if (props.inputGroupProps.defaultSelected != null && props.inputGroupProps.defaultSelected != undefined)
            value = props.inputGroupProps.defaultSelected;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value != null && value != undefined) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.setState({ error: null });
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Render radio button from dataSource
    renderItems() {
        let props = this.props;
        const rbtnStyle = omit(radioButtonStyle, ['radioButtonGroupStyle']);
        return (map(this.data, (d, index) =>
            <RadioButton
                {...rbtnStyle}
                key={index}
                id={props.inputGroupProps.name + d[props.valueField]}
                value={d[props.valueField]}
                label={d[props.textField]}
                disabled={props.disabled} />));
    }

    // Render radio button component
    render() {
        let props = this.props;
        let state = this.state;
        return (
            <div>
                <RadioButtonGroup
                    {...props.inputGroupProps}
                    style={props.horizontalAlign ? radioButtonStyle.radioButtonGroupStyle : {}}
                    onChange={this.onChange} >
                    {this.renderItems()}
                </RadioButtonGroup>
                <span className={(state.error != null && (state.visited || props.isClicked)) ? 'error-message' : 'hidden'}>{state.error}</span>
            </div >
        )
    }
}

// Define propTypes of radio button
RadioButtonComponent.propTypes = {
    inputGroupProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        defaultSelected: React.PropTypes.any,
        labelPosition: React.PropTypes.string
    }).isRequired,
    disabled: React.PropTypes.bool,
    horizontalAlign: React.PropTypes.bool,
    dataSource: React.PropTypes.array.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    formSetValue: React.PropTypes.func,
    onChange: React.PropTypes.func
}

// Define defaultProps of radio button
RadioButtonComponent.defaultProps = {
    eReq: null,
    disabled: false,
    horizontalAlign: false
}

export default RadioButtonComponent