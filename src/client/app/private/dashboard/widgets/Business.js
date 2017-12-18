'use strict';

/********************************************
 * Demo widget - Business
 * ******************************************/

import React, { Component } from 'react';
import Loader from './_Loader';
import Header from '../components/WidgetHeader';

class WidgetBusiness extends Component {

    // initialie default props/state
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = { ready: false }
        this.load = this.load.bind(this);
        this.reload = this.reload.bind(this);
        this.remove = this.remove.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // when component is rendered in browser
    componentWillMount() {
        this.mounted = true;
        this.load();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // set state to ready after certain interval
    load() {
        var _this = this;
        setTimeout(function () {
            _this.stateSet({ ready: true });
        }, 500);
    }

    // reload component
    reload() {
        this.stateSet({ ready: false });
        this.load();
    }

    // hide widget from dashboard
    remove() {
        this.props.hideWidget(this.props.name);
    }

    render() {
        var ready = this.state.ready;
        let className = "box-head";

        if (this.props.titleColor) {
            className = className + " " + this.props.titleColor;
        }

        const content = <div className="box-middle">
            <ul>
                <li><a href="#"><b>4</b>  Contact(s)</a></li>
                <li><a href="#"><b>2</b>  Aglive User(s)</a></li>
            </ul>
        </div>;

        return (
            <div className="stock-box">
                <Header
                    className={className}
                    ready={ready}
                    titleText="Aglive Pty Ltd"
                    reload={this.reload}
                    remove={this.remove} />

                {this.props.renderContent(ready, content)}
            </div>);
    }
};

export default WidgetBusiness;