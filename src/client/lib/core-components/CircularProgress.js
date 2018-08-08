'use strict';

/*************************************
 * CircularProgress component
 * *************************************/

import React from 'react';
import PureComponent from '../wrapper-components/PureComponent';
import CircularProgress from 'material-ui/CircularProgress';
import { circularProgressStyle } from '../../../../assets/js/mui-theme';

class CircularProgressComponent extends PureComponent {
    constructor(props) {
        super(props);
    }

    // Render component
    render() {
        let props = this.props;
        return (
            <CircularProgress {...circularProgressStyle} {...props.inputProps} />
        )
    }
}

// Define PropTypes
CircularProgressComponent.propTypes = {
    inputProps: React.PropTypes.shape({
        size: React.PropTypes.number.isRequired,
        thickness: React.PropTypes.number.isRequired,
        className: React.PropTypes.string,
        color: React.PropTypes.string
    }).isRequired
};

export default CircularProgressComponent