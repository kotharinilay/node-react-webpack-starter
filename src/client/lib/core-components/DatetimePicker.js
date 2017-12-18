'use strict';

/*************************************
 * Datetime picker component 
 * Reference link : https://github.com/YouCanBookMe/react-datetime
 * *************************************/

import React from 'react';
import Datetime from 'react-datetime';
import { omit } from 'lodash';
import PureComponent from '../wrapper-components/PureComponent';
import { isValid, currentDateTime, formatDateTime, localToUTC } from '../../../shared/format/date';

class DatetimePicker extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            visited: false,
            isLoading: false,
            error: this.props.eReq
        }
        this.fieldStatus = {
            visited: false,
            dirty: false,
            valid: false,
            value: ''
        }
        this.validDate = this.validDate.bind(this);
        this.changeInput = this.changeInput.bind(this);
        this.blurInput = this.blurInput.bind(this);

    }

    // Validate input values
    validInput(input) {
        let props = this.props;
        if (!input)
            return props.eReq;
        else if (!isValid(input))
            return props.eInvalid;
        return null;
    }

    // Restrict date inside the datepicker popup
    validDate(current) {
        let props = this.props.dateFilter;
        if (props) {
            let date = currentDateTime().DateTimeMoment;
            if (props.isBefore) {
                if (!props.isIncludeToday)
                    date = date.subtract(1, 'day');
                return current.isBefore(date);
            }
            else if (props.isAfter) {
                if (props.isIncludeToday)
                    date = date.subtract(1, 'day');
                return current.isAfter(date);
            }
        }
        return current;
    }

    // Handle onChange event
    changeInput(e, isDirty = true) {
        let isValid = true;
        this.fieldStatus.dirty = isDirty;
        let errorMessage = this.validInput(e);

        if (errorMessage) {
            isValid = false;
            this.fieldStatus.valid = false;
        }
        else {

            this.fieldStatus.value = e._d;
            this.fieldStatus.valid = true;
            this.updateToStore();
        }
        this.setState({ error: (isValid ? null : errorMessage) });
    }

    // Handle onBlur event
    blurInput(val) {
        this.fieldStatus.visited = true;
        if (!this.state.visited)
            this.setState({ visited: true });
        //let errorMessage = this.validInput(val);
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
        let value = null;

        if (props.defaultValue)
            value = props.defaultValue;

        if (!props.eReq) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
        }
        if (value) {
            isUpdateToStore = true;
            this.fieldStatus.valid = true;
            this.fieldStatus.value = value;
            this.setState({ error: null });
            this.changeInput(formatDateTime(value).DateTimeMoment, false);
        }

        if (isUpdateToStore)
            this.updateToStore();
    }

    // Render component with error message
    render() {
        let props = omit(this.props, ['formSetValue', 'inputProps', 'dateFilter']);
        return (
            <div className="custom-input-outer">
                <div className="custom-label">{this.props.inputProps.label}</div>
                <Datetime
                    {...props}
                    className={this.state.error != null ? 'errorBorder' : ''}
                    inputProps={this.props.inputProps}
                    {...this.props.dateFilter}
                    isValidDate={this.validDate}
                    onChange={this.changeInput}
                    onBlur={this.blurInput} />
                <span className={this.state.error != null ? 'error-message' : 'hidden'}>{this.state.error}</span>
            </div>
        )
    }
}

// Define propTypes of DatetimePicker
DatetimePicker.propTypes = {
    value: React.PropTypes.any,
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
        label: React.PropTypes.string,
        disabled: React.PropTypes.bool
    }).isRequired,
    dateFormat: React.PropTypes.oneOfType([
        React.PropTypes.string, //http://momentjs.com/docs/#/displaying/format/
        React.PropTypes.bool,
    ]).isRequired,
    timeFormat: React.PropTypes.oneOfType([
        React.PropTypes.string, //http://momentjs.com/docs/#/displaying/format/
        React.PropTypes.bool,
    ]),
    defaultValue: React.PropTypes.any,
    open: React.PropTypes.bool,
    viewMode: React.PropTypes.oneOfType([
        React.PropTypes.string, //'years', 'months', 'days', 'time'
        React.PropTypes.number,
    ]),
    className: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.array,
    ]),
    dateFilter: React.PropTypes.shape({
        isBefore: React.PropTypes.bool,
        isAfter: React.PropTypes.bool,
        isIncludeToday: React.PropTypes.bool,
        // minDate: React.PropTypes.oneOfType([
        //     React.PropTypes.string,
        //     React.PropTypes.bool,
        // ]).isRequired,
        // maxDate: React.PropTypes.oneOfType([
        //     React.PropTypes.string,
        //     React.PropTypes.bool,
        // ]).isRequired,
        // dateFormat: React.PropTypes.string.isRequired,        
    }),
    closeOnSelect: React.PropTypes.bool,
    timeConstraints: React.PropTypes.object, //{hours: {min: 9, max: 15, step: 2 }}    
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    eInvalid: React.PropTypes.string.isRequired,
    formSetValue: React.PropTypes.func
}

// Set defaultProps of DatetimePicker
DatetimePicker.defaultProps = {
    closeOnSelect: true,
    dateFormat: 'DD-MM-YYYY',
    timeFormat: 'hh:mm A',
    eInvalid: 'Invalid input'
}

export default DatetimePicker