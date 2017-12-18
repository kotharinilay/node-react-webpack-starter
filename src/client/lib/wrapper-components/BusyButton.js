'use strict';

/*************************************************
 * Button wrapper to display loading indicator
 * when button is clicked
 * ******************************************* */

import React from 'react';
import { browserHistory } from 'react-router';
import { omit } from 'lodash';

import PureComponent from './PureComponent';
import Button from '../core-components/Button';

class BusyButton extends PureComponent {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = { isLoading: false };
        this.clickcount = 1;
    }

    // conver onClick event into Promise
    // hide loader when promise completes
    onClick(e, data = null) {
        let { onClick } = this.props;
        var _this = this;
        this.setState({ isLoading: true });
        var promisify = new Promise(function (resolve, reject) {
            resolve(onClick(e, data));
        });

        promisify.then(function (res) {
            _this.setState({ isLoading: false });
            if (_this.props.redirectUrl && res == true) {                
                browserHistory.push(_this.props.redirectUrl);
            }
        });
    }

    render() {

        let loadingImage = null;

        // show svg loader when button's state is loading...
        if (this.state.isLoading) {
            var src = window.__SITE_URL__ + "/bower_components/SVG-Loaders/svg-loaders/puff.svg";
            var dimension = this.props.loaderHeight || 35;
            loadingImage = <img src={src} width={dimension} height={dimension} />;
        }
        var props = omit(this.props, ['onClick']);

        return (<Button {...props} disabled={this.state.isLoading} onClick={this.onClick} icon={loadingImage}></Button>);
    }
}

// proptype validator
BusyButton.propTypes = {
    ...Button.PropTypes,
    redirectUrl: React.PropTypes.string,
    loaderHeight: React.PropTypes.number
}

// default proptype value
BusyButton.defaultProps = {
    ...Button.defaultProps,
    loaderHeight: 35,
}

export default BusyButton;