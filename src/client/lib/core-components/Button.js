'use strict';

/*************************************
 * Button component
 * *************************************/

import React from 'react'; 
import { browserHistory } from 'react-router';
import PureComponent from '../wrapper-components/PureComponent';
import { omit } from 'lodash';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import { raisedButtonStyle } from '../../../../assets/js/mui-theme';
import Promise from 'bluebird';

class Button extends PureComponent {
    constructor(props) {
        super(props);
        this.onClickEvent = this.onClickEvent.bind(this);
    }

    // Handle button click
    onClickEvent(e, data = null) {        
        let onClick = this.props.onClick;
        if (onClick)
            onClick(e, data);
    }

    // Render button component with loading effect
    render() {
       
        const inputProps = omit(this.props.inputProps, ['disabled', 'label']);
        let props = this.props;

        return (
            <div className="display-inline">
                <RaisedButton
                    {...raisedButtonStyle}
                    {...inputProps}
                    label={this.props.inputProps.label}
                    fullWidth={props.fullWidth}
                    primary={props.primary}
                    icon={props.icon}
                    disabled={props.inputProps.disabled}
                    onClick={this.onClickEvent}>
                </RaisedButton>
            </div>
        )
    }
}

// Define propTypes of button
Button.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool,
        className: React.PropTypes.string
    }),
    icon: React.PropTypes.object,
    backgroundColor: React.PropTypes.string,
    labelColor: React.PropTypes.string,
    fullWidth: React.PropTypes.bool
}

// Define defaultProps of button
Button.defaultProps = {
    fullWidth: false
}

export default Button