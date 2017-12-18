'use strict';

/*************************************
 * Load material-ui theme and configure style if needed
 * Reference links : http://www.material-ui.com/#/customization/themes
 * https://github.com/callemall/material-ui/tree/master/src/styles
 * *************************************/

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

// Define externalStyle for muiTheme
const primaryColor = '#009688';
const externalStyle = {
    checkbox: {
        checkedColor: primaryColor,
        boxColor: '#898c8e'
    }
}

// export lightBaseTheme for components
export const muiTheme = getMuiTheme(lightBaseTheme, externalStyle);

// Define individual style for circularProgress components
export const circularProgressStyle = {
    color: primaryColor
}

// Define individual style for textField components
export const textFieldStyle = {
    style: {
        fontSize: '13px'
    },
    inputStyle: {
        color: '#37444b',
        fontWeight: '400',
        letterSpacing: '0.6px'
    },
    hintStyle: {
        color: '#9ba1a5',
        fontWeight: '400',
        letterSpacing: '0.6px'
    },
    underlineFocusStyle: {
        borderColor: primaryColor
    },
    floatingLabelFocusStyle: {
        color: primaryColor
    }
}

// Define individual style for raisedButton components
export const raisedButtonStyle = {
    style: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        letterSpacing: '2px',
        borderRadius: '0px',
        height: 'inherit',
        lineHeight: 'inherit',
        color: '#ffffff'
    },
    labelStyle: {
        letterSpacing: '2px'
    },
    disabledBackgroundColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
    labelColor: '#ffffff'
}

// Define individual style for checkBox components
export const checkBoxStyle = {
    labelStyle: {
        fontWeight: '300',
        color: '#37444b', // rgb(0, 150, 136)
        margin: '0 0 0 -2px',
        fontSize: '14px',
        letterSpacing: '0.8px'
    }
}

// Define individual style for radioButton components
export const radioButtonStyle = {
    style: {
        width: 'auto',
        marginRight: '20px'
    },
    iconStyle: {
        marginRight: '5px'
    },
    labelStyle: {
        width: 'auto'
    },
    radioButtonGroupStyle: {
        display: 'flex'
    }
}

export const toggleSwitchStyle = {
    thumbSwitchedStyle: {
        backgroundColor: '#476348',//'#769277',
    },
    thumbStyle: {
        backgroundColor: '#cdd0d2',
    },
    trackSwitchedStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    trackStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    }
}

export const dropdownStyle = {
    style: {
        fontSize: '13px',
        color: '#37444b'
    },
    menuItemStyle: {
        fontSize: '13px',
        color: '#37444b',
        //backgroundColor: 'green'
    },
    selectedMenuItemStyle: {
        fontSize: '13px',
        color: '#c35f4b'
    },
    hintStyle: {
        lineHeight: '-15px',
        color: '#f5f5f5',
        fontWeight: '100'
    },
    menuStyle: {
        //backgroundColor: 'red'
    },
    listStyle: {
        //backgroundColor: 'blue',
    }
}

export const autoCompleteStyle = {
    textFieldStyle: {
        fontSize: '13px',
        color: '#FF0000'
    },
    inputStyle: {
        fontSize: '13px',
        color: '#37444b'
    },
    listStyle: {
        fontSize: '13px',
        lineHeight: '10px',
        color: "red",
        maxHeight: '200px'
    },
    menuStyle: {
        fontSize: '13px',
        lineHeight: '10px',
        color: "green"
    },
    underlineFocusStyle: {
        borderColor: primaryColor
    },
    floatingLabelFocusStyle: {
        color: primaryColor
    }
}

export const errorStyle =
    {
        fontSize: '13px'
    }