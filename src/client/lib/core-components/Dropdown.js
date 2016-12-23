'use strict';

/*************************************
 * Dropdown list component
 * *************************************/

import React from 'react'
import PureComponent from '../wrapper-components/PureComponent';
import lodash from 'lodash';

class Select extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: this.props.eReq
        }
        this.changeSelect = this.changeSelect.bind(this);
        this.data = lodash.values(this.props.dataSource);
    }

    // Perform validation of selected values
    validInput(value, text) {
        let props = this.props;
        if (value == props.inputProps.placeholder)
            return props.eReq;
        else if (props.eServerValidation)
            return props.eServerValidation(value, text)
        return null;
    }

    // Update error state based on input
    updateErrorState(value, text) {
        let isValid = false;
        let validInput = this.validInput(value, text);
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
    changeSelect(e) {
        let select = this.refs.refSelect;
        let value = select.options[select.selectedIndex].value;
        let text = select.options[select.selectedIndex].text;

        let isValid = this.updateErrorState(value, text);
        this.props.formSetValue(this.props.inputProps.name, value, isValid, true, text);
    }

    // Add placeholder to dataSource
    bindPlaceholder() {
        let props = this.props;
        const valueField = props.valueField;
        const textField = props.textField;
        const iPH = props.inputProps.placeholder;
        if (iPH) {
            if (!lodash.find(this.data, d => d[valueField] === iPH)) {
                this.data.unshift({
                    [valueField]: iPH,
                    [textField]: iPH
                });
            }
        }
    }

    // Check component need rerender based on props and state
    shouldComponentUpdate(nextProps, nextState) {
        let props = this.props;
        let isChanged = false;
        const iPH = props.inputProps.placeholder;
        const select = this.refs.refSelect;
        let value = select.options[select.selectedIndex].value;
        if (iPH && value == iPH)
            value = "";

        if (props.inputProps.value != value || props.isDirty != nextProps.isDirty || props.isClicked != nextProps.isClicked)
            isChanged = true;
        if (!_.isEqual(props.dataSource, nextProps.dataSource))
            isChanged = true;
        return isChanged;
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        const select = this.refs.refSelect;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, '', true, false);
        }
        if (!props.inputProps.placeholder) {
            const value = select.options[select.selectedIndex].value;
            const text = select.options[select.selectedIndex].text;
            this.updateErrorState(value, text);
            props.formSetValue(props.inputProps.name, value, true, false, text);
        }
        if (props.iSelectedIndex && this.data.length > props.iSelectedIndex) {
            select.selectedIndex = props.iSelectedIndex;
            const value = select.options[select.selectedIndex].value;
            const text = select.options[select.selectedIndex].text;
            this.updateErrorState(value, text);
            props.formSetValue(props.inputProps.name, value, true, false, text);
        }
        if (props.iSelectedValue && lodash.find(this.data, d => d[props.valueField] === props.iSelectedValue)) {
            select.value = props.iSelectedValue
            const value = select.options[select.selectedIndex].value;
            const text = select.options[select.selectedIndex].text;
            this.updateErrorState(value, text);
            props.formSetValue(props.inputProps.name, value, true, false, text);
        }
        if (props.iSelectedText) {
            const data = lodash.find(this.data, d => d[props.textField] === props.iSelectedText);
            if (data) {
                select.value = data[props.valueField];
                const value = select.options[select.selectedIndex].value;
                const text = select.options[select.selectedIndex].text;
                this.updateErrorState(value, text);
                props.formSetValue(props.inputProps.name, value, true, false, text);
            }
        }
    }

    // Render items from dataSource
    renderItems() {
        return (
            lodash.map(
                this.data,
                (d, index) =>
                    <option key={index} value={d[this.props.valueField]}>{d[this.props.textField]}</option>
            )
        );
    }

    // Render component with error message
    render() {
        this.data = lodash.values(this.props.dataSource);
        this.bindPlaceholder();
        return (
            <div className="form-group caret-img">
                <select className="form-control"
                    {...this.props.inputProps}
                    onChange={this.changeSelect}
                    ref="refSelect">
                    {this.renderItems()}
                </select>
                <span className={(this.state.error != null && (this.props.isDirty || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define propTypes of dropdown
Select.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        disabled: React.PropTypes.bool
    }),
    isDirty: React.PropTypes.bool.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eServerValidation: React.PropTypes.func,
    dataSource: React.PropTypes.object.isRequired,
    formSetValue: React.PropTypes.func.isRequired,
    iSelectedIndex: React.PropTypes.number,
    iSelectedValue: React.PropTypes.string,
    iSelectedText: React.PropTypes.string
};

export default Select