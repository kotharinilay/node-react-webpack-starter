'use strict';

/********************************************
 * Demo widget - eNVD
 * ******************************************/

import React, { Component } from 'react';
import Loader from './_Loader';
import Header from '../components/WidgetHeader';

class WidgetNVD extends Component {

    // initialie default props/state
    constructor(props) {
        super(props);

        this.state = { ready: false };
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

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

        let content = <div className="box-middle">
            <ul>
                <li><a href="#"> <b>1</b> Draft</a></li>
                <li><a href="#"><b>2</b>  In transit</a></li>
            </ul>
        </div>;

        return (
            <div className="stock-box">
                <Header
                    className={className}
                    ready={ready}
                    titleCount="3"
                    titleText="eNVD(s)"
                    reload={this.reload}
                    remove={this.remove} />
                {this.props.renderContent(ready, content)}
            </div>
        );
    }
};

export default WidgetNVD;