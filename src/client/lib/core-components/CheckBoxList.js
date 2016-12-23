'use strict';

/*************************************
 * Checkbox list component
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import lodash from 'lodash';

class Input extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: this.props.eReq
        }
        this.changeInput = this.changeInput.bind(this);
        this.data = lodash.values(this.props.dataSource);
    }

    // Perform checkbox list validation
    validInput(value) {
        if (!value)
            return this.props.eReq;
        return null;
    }

    // Get the list of checked values
    getCheckedValues() {
        var checkedValues = $('input[name=' + this.props.inputProps.name + ']:checked').map(function (index, domElement) {
            return $(domElement).val();
        });
        return $.map(checkedValues, function (value, index) {
            return [value];
        }).join();
    }

    // Handle onChange event
    changeInput(e) {
        var value = this.getCheckedValues();
        const validInput = this.validInput(value);
        let isValid = false;
        if (validInput) {
            this.setState({ error: validInput });
        }
        else {
            this.setState({ error: null });
            isValid = true;
        }

        this.props.formSetValue(this.props.inputProps.name, value, isValid);
    }

    // To update component based on predefine values such as eReq, iSelectedValue etc...
    componentDidMount() {
        let props = this.props;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, '', true, false);
        }
        if (props.iSelectedValue) {
            const valueField = props.valueField;
            const name = props.inputProps.name;
            const filterData = this.data.filter(d => props.iSelectedValue.match(new RegExp("(?:^|,)" + d[valueField] + "(?:,|$)")));

            $.each(filterData, function (index, data) {
                const value = data[valueField];
                document.getElementById(name + value).checked = true;
            });

            var value = this.getCheckedValues();
            props.formSetValue(name, value, true, false);
        }
    }

    // Render items of checkbox list from dataSource
    renderItems() {
        var style = {
            marginRight: '10px'
        }
        var lblStyle = {
            fontWeight: 'normal',
            marginLeft: '2px'
        }
        let props = this.props;
        return (
            lodash.map(
                this.data,
                (d, index) =>
                    <div key={index} className={'check-btn ' + (props.iHorizontalDirection != null ? 'pull-left' : '')} style={style}>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"
                                    id={props.inputProps.name + d[props.valueField]}
                                    name={props.inputProps.name} value={d[props.valueField]}
                                    onChange={this.changeInput} />
                                <span className="checkbox-material"></span>
                                <span className="checkbox-material"></span>
                                <b>{d[props.textField]}</b>
                            </label>
                        </div>
                    </div>
            )
        );
    }

    // Render checkbox list component with error message
    render() {
        return (
            <div className="form-group">
                <div>
                    {this.renderItems()}
                    <div className="clearfix"></div>                    
                    <span className={(this.state.error != null && (this.props.isDirty || this.props.isClicked)) ? 'error-message' : 'hidden'}>{this.state.error}</span>
                </div>
            </div>
        )
    }
}

// Define propTypes of checkbox list
Input.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired
    }),
    eReq: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool,
    ]),
    isDirty: React.PropTypes.bool.isRequired,
    isClicked: React.PropTypes.bool.isRequired,
    textField: React.PropTypes.string.isRequired,
    valueField: React.PropTypes.string.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    formSetValue: React.PropTypes.func.isRequired,
    iSelectedValue: React.PropTypes.string,
    iSelectedText: React.PropTypes.string
}

export default Input