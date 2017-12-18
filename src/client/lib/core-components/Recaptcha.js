'use strict';

/**************************************
 * google recaptcha component
 * ************************************* */

import React, { PropTypes, Component } from 'react';
import CircularProgress from '../core-components/CircularProgress';
import { loadRecaptchaScript } from '../wrapper-components/FormActions';

const isReady = () => typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined';
let readyCheck;

export default class Recaptcha extends Component {

    // initialization
    constructor(props) {
        super(props);
        this.widgetId = "";
        this.state = {
            isLoading: true,
            ready: isReady(),
        };
        this._renderRecaptcha = this._renderRecaptcha.bind(this);
        this.reset = this.reset.bind(this);
        this.getResponse = this.getResponse.bind(this);
        if (!this.state.ready) {
            readyCheck = setInterval(this._updateReadyState.bind(this), 1000);
        }
    };

    // load recaptcha script
    componentWillMount() {
        loadRecaptchaScript();
    }

    componentDidMount() {
        if (this.state.ready) {
            this._renderRecaptcha();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { render } = this.props;

        if (this.state.ready && !prevState.ready) {
            this._renderRecaptcha();
        }
    }

    componentWillUnmount() {
        clearInterval(readyCheck);
    }

    reset() {
        if (this.state.ready) {
            grecaptcha.reset(this.widgetId);
        }
    }

    getResponse() {
        if (this.state.ready) {
            return grecaptcha.getResponse(this.widgetId);
        }
    }

    _updateReadyState() {
        if (isReady()) {
            this.setState({
                ready: true,
            });

            clearInterval(readyCheck);
        }
    }

    _renderRecaptcha() {
        this.widgetId = grecaptcha.render(this.props.elementID, {
            sitekey: this.props.sitekey,
            theme: this.props.theme,
            size: this.props.size,
            tabindex: this.props.tabindex,
            type: this.props.type,
            callback: (this.props.verifyCallback) ? this.props.verifyCallback : undefined,
            'expired-callback': (this.props.expiredCallback) ? this.props.expiredCallback : undefined,
        });

        this.setState({ isLoading: false });

        if (this.props.onloadCallback)
            this.props.onloadCallback();
    }

    render() {
        return (
            <div>
                {this.state.isLoading ? <CircularProgress inputProps={{ size: this.props.circularSize, thickness: this.props.circularThickness }} /> : null}
                <div id={this.props.elementID}>
                </div>
            </div>);
    }
}

const propTypes = {
    className: PropTypes.string,
    onloadCallbackName: PropTypes.string,
    elementID: PropTypes.string,
    onloadCallback: PropTypes.func,
    verifyCallback: PropTypes.func,
    expiredCallback: PropTypes.func,
    render: PropTypes.string,
    sitekey: PropTypes.string,
    theme: PropTypes.string,
    type: PropTypes.string,
    verifyCallbackName: PropTypes.string,
    expiredCallbackName: PropTypes.string,
    size: PropTypes.string,
    tabindex: PropTypes.string,
    progressColor: PropTypes.string,
};

const defaultProps = {
    elementID: 'g-recaptcha',
    onloadCallback: undefined,
    onloadCallbackName: 'onloadCallback',
    verifyCallback: undefined,
    verifyCallbackName: 'verifyCallback',
    expiredCallback: undefined,
    expiredCallbackName: 'expiredCallback',
    render: 'onload',
    theme: 'light',
    type: 'image',
    size: 'normal',
    tabindex: '0',
    circularSize: 25,
    circularThickness: 3,
    circularColor: '#63648A'
};

Recaptcha.propTypes = propTypes;
Recaptcha.defaultProps = defaultProps;