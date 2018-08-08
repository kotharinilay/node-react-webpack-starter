'use strict';

/*************************************
 * Loading Indicator component
 * *************************************/

import React from 'react';
import CircularProgress from './CircularProgress';
import PureComponent from '../wrapper-components/PureComponent';

class LoadingIndicator extends PureComponent {
    constructor(props) {
        super(props);
    }

    // Render component
    render() {
        let props = this.props;
        if (!props.onlyIndicator) {
            return (<div className={"stock-list" + props.className}>
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="loading-ind-outer">
                            <CircularProgress inputProps={{ size: props.size, thickness: props.thickness, color: props.color }} />
                            <span className="loading-ind-content">{props.loadingText}</span>
                        </div>
                    </div>
                </div>
            </div>);
        }
        else {
            return (<div className={"loading-ind-outer " + props.className}>
                <CircularProgress inputProps={{ size: props.size, thickness: props.thickness, color: props.color }} />
                <span className="loading-ind-content">{props.loadingText}</span>
            </div>);
        }
    }
}

// Define PropTypes
LoadingIndicator.propTypes = {
    onlyIndicator: React.PropTypes.bool,
    size: React.PropTypes.number,
    thickness: React.PropTypes.number,
    className: React.PropTypes.string
};

//Define defaultProps
LoadingIndicator.defaultProps = {
    onlyIndicator: false,
    size: 25,
    thickness: 3,
    className: "",
    loadingText: 'Please wait...',
    color: '#009688'
}

export default LoadingIndicator