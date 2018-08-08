'use strict';

/*************************************
 * Color picker component
 * *************************************/

import React, { Component } from 'react';
import { Panel as ColorPickerPanel } from 'rc-color-picker';

// import css of color picker
import 'rc-color-picker/assets/index.css';

class ColorPickerComponent extends Component {
    constructor(props) {
        super(props);
    }

    // Render ColorPicker component
    render() {
        return (
            <div style={{ textAlign: 'left', ...this.props.style }} className={this.props.className}>
                {this.props.clickOnOuter || this.props.selectionVisible ? <div className="colorpicker-outer" onClick={this.props.clickOnOuter}></div> : null}
                <ColorPickerPanel
                    color={this.props.color}
                    alpha={this.props.alpha}
                    mode="RGB"
                    onChange={this.props.changeHandler}>
                </ColorPickerPanel>
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
    color: '#36c',
    alpha: 100,
    className: '',
    selectionVisible: false
}

export default ColorPickerComponent;