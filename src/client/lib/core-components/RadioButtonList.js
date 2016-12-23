'use strict';

/*************************************
 * Radio button list component
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
        this.data = lodash.values(this.props.dataSource);
    }

    // Handle onChange event
    changeInput(e) {
        let props = this.props;
        var value = $('input[name=' + props.inputProps.name + ']:checked').val();
        const data = lodash.find(this.data, (d, i) => d[props.valueField] === value);
        if (data) {
            if (this.state.error)
                this.setState({ error: null });
            const text = data[props.textField];
            props.formSetValue(props.inputProps.name, value, true, text);
        }
        else {
            this.setState({ error: props.eReq });
        }
    }

    // To update component based on predefine values
    componentDidMount() {
        let props = this.props;
        const input = this.refs.refInput;
        if (!props.eReq) {
            props.formSetValue(props.inputProps.name, '', true, false);
        }
        if (props.iSelectedValue) {
            const data = lodash.find(this.data, (d, i) => d[props.valueField] === props.iSelectedValue);
            if (data) {
                const value = data[props.valueField];
                const text = data[props.textField];
                document.getElementById(props.inputProps.name + value).checked = true;
                props.formSetValue(props.inputProps.name, value, true, false, text);
            }
        }
        if (props.iSelectedText) {
            const data = lodash.find(this.data, d => d[props.textField] === props.iSelectedText);
            if (data) {
                const value = data[props.valueField];
                const text = data[props.textField];
                document.getElementById(props.inputProps.name + value).checked = true;
                props.formSetValue(props.inputProps.name, value, true, false, text);
            }
        }
    }

    // Render radio button list from dataSource
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
                    <div key={index} className={props.iHorizontalDirection != null ? 'pull-left' : ''} style={style}>
                        <input type="radio" ref="refInput"
                            id={props.inputProps.name + d[props.valueField]} name={props.inputProps.name} value={d[props.valueField]}
                            onChange={this.changeInput.bind(this)} />
                        <label style={lblStyle} htmlFor={props.inputProps.name + d[props.valueField]}>{d[props.textField]}</label>
                    </div>
            )
        );
    }

    // Render RadioButtonList component
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

// Define propTypes of RadioButtonList
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
    iSelectedValue: React.PropTypes.string
}

export default Input