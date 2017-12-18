// load react dependacies
import React, { Component } from 'react';
import ReactNotificationSystem from 'react-notification-system';
import { connect } from 'react-redux';
import { get } from 'lodash';

// expose Layout as react component
class ReduxNotificationSystem extends Component {
    constructor(props) {
        super(props);

        // Default messages
        this.SUCCESS_MSG = 'Success!';
        this.INFO_MSG = 'Sorry, something went wrong. Please try again.';
        this.ERROR_MSG = 'Sorry, something went wrong. Please try again.';

        // Positions
        this.POSITIONS =
            {
                TOP_LEFT: 'tl', TOP_RIGHT: 'tr', TOP_CENTER: 'tc',
                BOTTOM_LEFT: 'bl', BOTTOM_RIGHT: 'br', BOTTOM_CENTER: 'bc'
            };
        // 0 is false and more than zero is dismiss seconds.
        this.AUTO_DISMISS = 3;
    }

    // receive updated props from store 
    // show/hide popup accordingly
    componentWillReceiveProps(nextProps) {
        
        var props = Object.assign({},nextProps);
        
        if ((nextProps.strings !== null && nextProps.level === 'error') || (nextProps.level === 'error' && nextProps.message==null)){
            props.message = get(nextProps.strings, nextProps.message, this.ERROR_MSG);        
        }

        let options = {
            position: this.POSITIONS.BOTTOM_RIGHT,
            autoDismiss: this.AUTO_DISMISS,
            ...props
        };
        this._notificationSystem.addNotification(options);
    }

    componentDidMount() {
        this._notificationSystem = this.refs.notificationSystem;
    }

    render() {
        return (
            <ReactNotificationSystem ref="notificationSystem" />
        );
    }
}

var mapStateToProps = (state) => {
    return {
        ...state.common.notificationSystem
    }
}

export default connect(
    mapStateToProps,
    null
)(ReduxNotificationSystem)