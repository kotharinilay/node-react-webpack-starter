 'use strict';

/*************************************
 * Color picker component
 * *************************************/

import React, { Component } from 'react';
import ColorPicker from 'rc-color-picker';

// import css of color picker
import 'rc-color-picker/assets/index.css';

class ColorPickerComponent extends Component {
    constructor(props) {
        super(props);
    }

    // Render ColorPicker component
    render() {
        return (
            <div style={{ textAlign: 'center' }}>
                <ColorPicker
                    color={this.props.color}
                    onChange={this.props.changeHandler}>
                    <span className="react-custom-trigger">Choose Color</span>
                </ColorPicker>
            </div>
        )
    }
}

// Define propTypes of ColorPicker
ColorPickerComponent.propTypes = {
    color: React.PropTypes.string,
    changeHandler: React.PropTypes.func.isRequired
}

// Set defaultProps of ColorPicker
ColorPickerComponent.defaultProps = {
    color: '#000000'
}

export default ColorPickerComponent;