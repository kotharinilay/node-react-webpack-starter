'use strict';

/*************************************
 * AutoComplete component with static datasource
 * Reference link : http://www.material-ui.com/#/components/auto-complete
 * *************************************/

import React from 'react';
import { values } from 'lodash';
import PureComponent from '../wrapper-components/PureComponent';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from '../core-components/CircularProgress';
import { mandatory } from '../../lib/index';
import { autoCompleteStyle, errorStyle } from '../../../../assets/js/mui-theme';

class StaticAutoComplete extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: this.props.dataSource || [],
            visited: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: ''
        }
        this.onUpdateInput = this.onUpdateInput.bind(this);
        this.onNewRequest = this.onNewRequest.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource.length != this.props.dataSource.length && this.props.updateOnChange)
            this.setState({ dataSource: nextProps.dataSource });
    }


    // Fired when user search the text
    onUpdateInput(value) {
        var self = this;
        if (!this.fieldStatus.dirty) {
            this.fieldStatus.dirty = true;
            this.updateToStore();
        }
    }

    // Fired when select value from dropdown menu
    onNewRequest(value) {
        this.validateInput(value);
    }

    // Handle onBlur event
    onBlur(e) {
        this.fieldStatus.visited = true;
        if (e.target.value) {
            this.validateInput(e.target.value);
        }
        else {
            this.fieldStatus.valid = this.props.eReq ? false : true;
            this.fieldStatus.value = "";
            this.updateToStore();
            this.setState({ visited: true, error: this.props.eReq ? this.props.eReq : null });
            if (this.props.onSelectionChange) {
                this.props.onSelectionChange(this.fieldStatus.value);
            }
        }
    }

    // Validate the selected/search value 
    validateInput(value) {
        let fieldStatus = this.fieldStatus;
        fieldStatus.visited = true;
        fieldStatus.dirty = true;

        let errorMessage = null;
        let obj = value;
        if (typeof (value) == 'string')
            obj = this.state.dataSource.find(x => (x[this.props.textField] || '').toLowerCase() == (value || '').toLowerCase());
        if (obj) {
            fieldStatus.value = obj;
            fieldStatus.valid = true;
        }
        else {
            fieldStatus.value = value;
            fieldStatus.valid = this.props.eInvalid ? false : true;
            errorMessage = this.props.eInvalid;
        }

        this.updateToStore();
        this.setState({ visited: true, error: errorMessage });
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(this.fieldStatus.value);
        }
    }

    // Update store values - (name, value, valid, dirty, visited)
    updateToStore() {
        if (this.props.formSetValue)
            this.props.formSetValue(this.props.inputProps.name, this.fieldStatus.value, this.fieldStatus.valid, this.fieldStatus.dirty, this.fieldStatus.visited);
    }

    // To update component based on predefine values
    componentWillMount() {
        let props = this.props;
        let isUpdateToStore = false;
        let text = props.searchText;
        let value = props.selectedValue;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value && text) {
            let selectedVal = { 0: { [this.props.textField]: text, [this.props.valueField]: value } };
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = { [this.props.textField]: text, [this.props.valueField]: value };
            let ds = values(selectedVal);
            this.setState({ error: null, dataSource: ds });
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Render component with error message
    render() {
        let props = this.props;
        let state = this.state;
        let manipulateProps = Object.assign({}, props.inputProps);

        if (props.eReq != null) {
            manipulateProps.floatingLabelText = mandatory(manipulateProps.floatingLabelText);
        }

        return (
            <div>
                <AutoComplete
                    {...manipulateProps}
                    className="autoCompleteStyle"
                    searchText={props.searchText}
                    filter={AutoComplete.caseInsensitiveFilter}
                    dataSource={state.dataSource}
                    {...autoCompleteStyle}
                    onUpdateInput={this.onUpdateInput}
                    onNewRequest={this.onNewRequest}
                    onBlur={this.onBlur}
                    fullWidth={props.fullWidth}
                    dataSourceConfig={{ text: props.textField, value: props.valueField }}
                    openOnFocus={true}
                    errorText={(state.error != null && (state.visited || props.isClicked)) ? state.error : ''}
                    errorStyle={errorStyle} />
            </div>
        )
    }
}

// Define PropTypes
StaticAutoComplete.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        hintText: React.PropTypes.string,
        disabled: React.PropTypes.bool
    }).isRequired,
    fullWidth: React.PropTypes.bool,
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eInvalid: React.PropTypes.string,
    isClicked: React.PropTypes.bool.isRequired,
    formSetValue: React.PropTypes.func,
    selectedValue: React.PropTypes.any,
    searchText: React.PropTypes.string,
    onSelectionChange: React.PropTypes.func
};

//Define defaultProps
StaticAutoComplete.defaultProps = {
    fullWidth: true,
    eReq: null,
    eInvalid: 'Invalid input value.',
    isClicked: true
}

export default StaticAutoComplete