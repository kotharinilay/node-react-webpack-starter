'use strict';

/***************************************************
 * Notification Message System  
 * *************************************************** */

import React, { Component } from 'react';
import ReactNotificationSystem from 'react-notification-system';
import {get} from 'lodash';

function NotificationSystem(ComposedComponent) {
    return class NotificationSystem extends ComposedComponent {
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

            // bind events
            this.success = this.success.bind(this);
            this.error = this.error.bind(this);
            this.warning = this.warning.bind(this);
            this.info = this.info.bind(this);
            this.custom = this.custom.bind(this);
        }

        // show success notification to user
        success(message, strings = null, action = null) {

            if (strings)
                message = get(strings, message, this.SUCCESS_MSG);

            let options = {
                title: 'Success',
                message: message,
                position: this.POSITIONS.BOTTOM_RIGHT,
                autoDismiss: this.AUTO_DISMISS,
                action: action,
                level: 'success'
            };

            this._notificationSystem.addNotification(options);
            return message;
        }

        // show error notification to user
        error(message = this.ERROR_MSG, strings = null, action = null) {
            
            if (strings)
                message = get(strings, message, this.ERROR_MSG);

            let options = {
                title: 'Error',
                message: message,
                position: this.POSITIONS.BOTTOM_RIGHT,
                autoDismiss: this.AUTO_DISMISS,
                action: action,
                level: 'error'
            };

            this._notificationSystem.addNotification(options);
            return message;
        }

        // show warning notification to user
        warning(message, strings = null, action = null) {

            if (strings)
                message = get(strings, message, this.ERROR_MSG);

            let options = {
                title: 'Warning',
                message: message,
                position: this.POSITIONS.BOTTOM_RIGHT,
                autoDismiss: this.AUTO_DISMISS,
                action: action,
                level: 'warning'
            };

            this._notificationSystem.addNotification(options);
            return message;
        }

        // show info to user
        info(message, strings = null, action = null) {

            if (strings)
                message = get(strings, message, this.INFO_MSG);

            let options = {
                title: 'Information',
                message: message,
                position: this.POSITIONS.BOTTOM_RIGHT,
                autoDismiss: this.AUTO_DISMISS,
                action: action,
                level: 'info'
            };

            this._notificationSystem.addNotification(options);
            return message;
        }

        // custom notify requires 
        // all params to be provided
        custom(options) {
            this._notificationSystem.addNotification(options);
        }

        componentDidMount() {
            this._notificationSystem = this.refs.notificationSystem;
        }

        render() {

            const divStyle = { display: 'inline' };

            return (
                <div style={divStyle}>
                    <ComposedComponent {...this.props}
                        notify={{
                            success: this.success,
                            error: this.error,
                            warning: this.warning,
                            info: this.info,
                            custom: this.custom
                        }} />
                    <ReactNotificationSystem ref="notificationSystem" />
                </div>
            );
        }
    }
}

module.exports = NotificationSystem;