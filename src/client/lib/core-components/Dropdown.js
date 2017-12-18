'use strict';

/*************************************
 * Dropdown list component
 * *************************************/

import React, { Component } from 'react';
import { omit, map, find, values, isEqual } from 'lodash';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mandatory } from '../../lib/index';
import { dropdownStyle, errorStyle } from '../../../../assets/js/mui-theme';

class DropdownComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            visited: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: ''
        }
        this.onChange = this.onChange.bind(this);
        this.data = [...this.props.dataSource];
    }

    // Perform validation of selected values
    validInput(value) {
        let props = this.props;
        if (!value)
            return props.eReq;
        else if (props.eClientValidation)
            return props.eClientValidation(value)
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
    onChange(e, index, value) {
        this.fieldStatus.dirty = true;
        this.fieldStatus.visited = true;
        this.fieldStatus.value = value;
        this.fieldStatus.valid = this.updateErrorState(this.fieldStatus.value);
        this.updateToStore();
        this.setState({ value: value, visited: true });
        if (this.fieldStatus.valid || this.props.callOnChange) {
            if (this.props.onSelectionChange) {
                this.props.onSelectionChange(this.fieldStatus.value, e.target.textContent);
            }
        }
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // Add hintText to dataSource
    bindHintText() {
        let props = this.props;
        const valueField = props.valueField;
        const textField = props.textField;
        const hintText = props.inputProps.hintText;
        if (hintText) {
            if (!find(this.data, d => d[textField] === hintText)) {
                this.data.unshift({
                    [valueField]: null,
                    [textField]: hintText
                });
            }
        }
    }

    // Update fieldStatus of input
    updateDropdownStatus(errorMessage) {
        this.fieldStatus.valid = errorMessage ? false : true;
        this.setState({ error: (this.fieldStatus.valid ? null : errorMessage) });
        this.updateToStore();
    }

    // Check component need rerender based on props and state
    shouldComponentUpdate(nextProps, nextState) {
        let isChanged = false;
        let props = this.props;
        let state = this.state;

        if (state.value != nextState.value || state.error != nextState.error || state.visited != nextState.visited || props.isClicked != nextProps.isClicked)
            isChanged = true;
        if (!isEqual(props.dataSource, nextProps.dataSource))
            isChanged = true;
        return isChanged;
    }

    // To update component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let value = null;

        if (props.inputProps.value)
            value = props.inputProps.value;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.setState({ value: value, error: null });
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Render items from dataSource
    renderItems() {
        return (
            map(
                this.data,
                (d, index) =>
                    <MenuItem key={index} value={d[this.props.valueField]} primaryText={d[this.props.textField]} />
            )
        );
    }

    // Render component with error message
    render() {
        let props = this.props;
        let state = this.state;

        this.data = [...props.dataSource];
        const inputProps = omit(props.inputProps, ['value']);
        let manipulateProps = Object.assign({}, inputProps);

        if (props.eReq != null && props.hideStar == false) {
            manipulateProps.hintText = mandatory(manipulateProps.hintText);
        }
        this.bindHintText();
        return (
            <SelectField
                {...dropdownStyle}
                {...manipulateProps}
                floatingLabelFixed={true}
                value={state.value}
                fullWidth={props.fullWidth}
                onChange={this.onChange}
                maxHeight={200}
                autoWidth={true}
                errorStyle={errorStyle}
                errorText={(state.error != null && (state.visited || props.isClicked)) ? state.error : ''}>
                {props.renderItems ? props.renderItems(this.data, props.valueField, props.textField) : this.renderItems()}
            </SelectField>
        )
    }
}

// Define propTypes of dropdown
DropdownComponent.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        value: React.PropTypes.any,
        hintText: React.PropTypes.node,
        disabled: React.PropTypes.bool,
        floatingLabelText: React.PropTypes.node
    }).isRequired,
    fullWidth: React.PropTypes.bool,
    isClicked: React.PropTypes.bool.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eClientValidation: React.PropTypes.func,
    formSetValue: React.PropTypes.func,
    onSelectionChange: React.PropTypes.func,
    callOnChange: React.PropTypes.bool,
    hideStar: React.PropTypes.bool,
    renderItems: React.PropTypes.func
}

// Define defaultProps of dropdown
DropdownComponent.defaultProps = {
    fullWidth: true,
    eReq: null,
    isClicked: true,
    callOnChange: false,
    hideStar: false,
    dataSource: []
}

export default DropdownComponent