'use strict';

/*************************************
 * Button component
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import lodash from 'lodash';

class Button extends PureComponent {

    constructor(props) {
        super(props);
        if (this.props.loading) {
            this.state = {
                isLoading: false
            }
        }
    }

    // Handle button click
    onClickEvent(e) {        
        let {loading, buttonClick} = this.props;
        e.preventDefault();
        if (loading) {
            this.setState({ isLoading: true });
            setTimeout(function () {
                buttonClick();
                this.setState({ isLoading: false });
            }.bind(this), 10)
        }
        else
            buttonClick();
    }

    // Render button component with loading effect
    render() {
        const inputProps = lodash.omit(this.props.inputProps, ['disabled', 'value']);
        let props = this.props;
        let isLoading = props.loading ? this.state.isLoading : false;
        return (
            <button
                type="button"
                {...inputProps}
                disabled={this.props.inputProps.disabled || isLoading}
                onClick={this.onClickEvent.bind(this)}>
                <div className={isLoading ? 'loading-zone' : 'hidden'}>
                    <div className='loading'></div>
                </div>
                {isLoading ? (props.loadingText ? props.loadingText : 'Loading...') : props.inputProps.value}
            </button>
        )
    }
}

// Define propTypes of button
Button.propTypes = {
    inputProps: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool,
        className: React.PropTypes.string
    }),
    loading: React.PropTypes.bool,
    loadingText: React.PropTypes.string,
    buttonClick: React.PropTypes.func.isRequired
}

Button.defaultProps = {
    inputProps: {
        disabled: false,
        className: ''
    },
    loading: false
}

export default Button