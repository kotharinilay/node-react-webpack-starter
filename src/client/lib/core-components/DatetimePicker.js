'use strict';

/*************************************
 * Datetime picker component 
 * Reference link : https://github.com/YouCanBookMe/react-datetime
 * *************************************/

import React from 'react';
import Datetime from 'react-datetime';
import lodash from 'lodash';
import PureComponent from '../wrapper-components/PureComponent';
import moment from '../../../shared/format/date';

class DatetimePicker extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            error: null
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
        else if (!moment.isValid(input))
            return props.eInvalid;
        return null;
    }

    // Restrict date inside the datepicker popup
    validDate(current) {
        let props = this.props.dateFilter;
        if (props) {
            let date = moment.currentDateTime().DateTimeFormat;
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
    changeInput(val, isDirty) {
        let isValid = false;
        let validInput = this.validInput(val);
        if (validInput) {
            this.setState({ error: validInput });
        }
        else {
            this.setState({ error: null });
            isValid = true;
        }
        
        if (isDirty === undefined)
            isDirty = true;

        this.props.formSetValue(this.props.inputProps.name, val, isValid, isDirty);
    }

    // Handle onBlur event
    blurInput(val) {
        let validInput = this.validInput(val);
        if (validInput != this.state.error) {
            this.setState({ error: validInput });
        }
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, props.value, true, false);
        }
        else if (props.defaultValue) {
            this.changeInput(moment.dateTime(props.defaultValue).ValueOf, false);
        }
    }

    // Render component with error message
    render() {
        let props = lodash.omit(this.props, ['formSetValue', 'inputProps', 'dateFilter']);
        return (
            <div>
                <Datetime
                    {...props}
                    {...this.props.inputProps}
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
    value: React.PropTypes.any.isRequired,
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string,
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
    defaultValue: React.PropTypes.any.isRequired,
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
    formSetValue: React.PropTypes.func.isRequired
}

// Set defaultProps of DatetimePicker
DatetimePicker.defaultProps = {
    closeOnSelect: true,
    dateFormat: 'DD-MM-YYYY',
    eInvalid: 'Invalid input'
}

export default DatetimePicker