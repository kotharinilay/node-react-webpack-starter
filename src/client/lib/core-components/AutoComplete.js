'use strict';

/*************************************
 * AutoComplete component
 * Reference link : http://www.material-ui.com/#/components/auto-complete
 * *************************************/

import React from 'react';
import axios from 'axios';
import Promise from 'bluebird';
import { values } from 'lodash';
import PureComponent from '../wrapper-components/PureComponent';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from '../core-components/CircularProgress';
import { mandatory } from '../../lib/index';
import { autoCompleteStyle, errorStyle } from '../../../../assets/js/mui-theme';

class AutoCompleteComponent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: false,
            visited: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: {}
        }
        this.onUpdateInput = this.onUpdateInput.bind(this);
        this.onNewRequest = this.onNewRequest.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.isBlurReq = false;
    }

    // Get list of data from given URL through api
    getData(value) {
        var self = this;
        return new Promise(function (resolve, reject) {
            return axios.get(self.props.apiUrl.replace('$$$', value))
                .then(function (response) {
                    resolve(response.data.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        })
    }

    // Fired when user search the text
    onUpdateInput(value) {
        this.setState({ isLoading: true });
        var self = this;
        if (!this.fieldStatus.dirty) {
            this.fieldStatus.dirty = true;
            this.updateToStore();
        }
        return this.getData(value).then(function (items) {
            self.setState({
                dataSource: items,
                isLoading: false
            });
        });
    }

    // Fired when select value from dropdown menu
    onNewRequest(value) {
        if (!this.isBlurReq)
            this.validateInput(value);
        this.isBlurReq = false;
    }

    // Handle onBlur event
    onBlur(e) {
        this.fieldStatus.visited = true;
        this.isBlurReq = true;
        if (e.target.value) {
            this.validateInput(e.target.value);
        }
        else {
            this.fieldStatus.valid = this.props.eReq ? false : true;
            this.fieldStatus.value = {};
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
        if (!this.isBlurReq) {
            fieldStatus.value = value;
            fieldStatus.valid = true;
            this.updateToStore();
            this.setState({ visited: true, error: null });
        }
        else {
            var self = this;
            let errorMessage = null;
            this.setState({ isLoading: true });
            return this.getData(value).then(function (items) {
                if (items.length == 1 && items[0][self.props.textField] == value) {
                    fieldStatus.value = items[0];
                    fieldStatus.valid = true;
                }
                else {
                    fieldStatus.valid = false;
                    errorMessage = self.props.eInvalid;
                }
                self.updateToStore();
                self.setState({ isLoading: false, visited: true, error: errorMessage });
                if (self.props.onSelectionChange) {
                    self.props.onSelectionChange(self.fieldStatus.value);
                }
            });
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
                <div style={{ position: 'relative' }}>
                    <CircularProgress inputProps={{ size: 15, thickness: 2, className: (state.isLoading ? 'input-loading' : 'hidden') }} />
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
                        errorStyle={errorStyle}
                        ref="refElement" />
                </div>
            </div>
        )
    }
}

// Define PropTypes
AutoCompleteComponent.propTypes = {
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
    apiUrl: React.PropTypes.string.isRequired,
    selectedValue: React.PropTypes.any,
    searchText: React.PropTypes.string,
    onSelectionChange: React.PropTypes.func
};

//Define defaultProps
AutoCompleteComponent.defaultProps = {
    fullWidth: true,
    eReq: null,
    eInvalid: 'Invalid input value.',
    isClicked: true
}

export default AutoCompleteComponent