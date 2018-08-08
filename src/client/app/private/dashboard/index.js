'use strict';

/******************************************
 * Dashboard 
 ******************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Home from './components/Home';
import Configure from './components/Configure';
import NotificationBoard from './components/NotificationBoard';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';
import { notifyToaster } from '../../common/actions';

class Dashboard extends Component {

    constructor(props) {
        super(props);
    }

    // Perform header search
    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined)
            return;
        else if (nextProps.topSearch.searchText == null)
            return;
        browserHistory.push('/livestock');
    }

    render() {
        let { strings } = this.props;
        let component = null;

        // if screen parameter is provided with "configure" value
        if (this.props.params && this.props.params.screen == "configure") {
            component = <Configure
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.CONFIGURE, COMMON: strings.COMMON }} />;
        }
        else if (this.props.params && this.props.params.screen == "notification") {   // if screen parameter is provided with "notification" value
            component = <NotificationBoard
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.NOTIFICATION_BOARD, COMMON: strings.COMMON }} />;
        }
        else {
            component = <Home
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.WIDGETSCREEN, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        authUser: state.authUser,
        topSearch: state.header.topSearch
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Decorator('Dashboard', Dashboard));