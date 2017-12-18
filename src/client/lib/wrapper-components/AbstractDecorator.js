'use strict';

/**************************************
 * default implementation for any component
 * ***********************************/

import React from 'react';
import { withTranslate } from 'react-redux-multilingual';
import ReactNotificationSystem from 'react-notification-system';
import {get} from 'lodash';

const msgOptions = {
    SUCCESS_MSG : 'Success!',
    INFO_MSG : 'Sorry, something went wrong. Please try again.',
    ERROR_MSG: 'Sorry, something went wrong. Please try again.',
    POSITIONS :
    {
        TOP_LEFT: 'tl', TOP_RIGHT: 'tr', TOP_CENTER: 'tc',
        BOTTOM_LEFT: 'bl', BOTTOM_RIGHT: 'br', BOTTOM_CENTER: 'bc'
    },
    AUTO_DISMISS : 0
};            

module.exports = (Key, Component) => {    
        return withTranslate(React.createClass({                  
                
            // show success notification to user
            success(message, strings = null, action = null) {

                if (strings)
                    message = get(strings, message, msgOptions.SUCCESS_MSG);

                let options = {
                    title: 'Success',
                    message: message,
                    position: msgOptions.POSITIONS.BOTTOM_RIGHT,
                    autoDismiss: msgOptions.AUTO_DISMISS,
                    action: action,
                    level: 'success'
                };

                this._notificationSystem.addNotification(options);
                return message;
            },
            // show error notification to user
            error(message = this.ERROR_MSG, strings = null, action = null) {
                
                if (strings)
                    message = get(strings, message, msgOptions.ERROR_MSG);

                let options = {
                    title: 'Error',
                    message: message,
                    position: msgOptions.POSITIONS.BOTTOM_RIGHT,
                    autoDismiss: msgOptions.AUTO_DISMISS,
                    action: action,
                    level: 'error'
                };

                this._notificationSystem.addNotification(options);
                return message;
            },
            // show warning notification to user
            warning(message, strings = null, action = null) {

                if (strings)
                    message = get(strings, message, msgOptions.ERROR_MSG);
                    
                let options = {
                    title: 'Warning',
                    message: message,
                    position: msgOptions.POSITIONS.BOTTOM_RIGHT,
                    autoDismiss: msgOptions.AUTO_DISMISS,
                    action: action,
                    level: 'warning'
                };

                this._notificationSystem.addNotification(options);
                return message;
            },
            // show info to user
            info(message, strings = null, action = null) {

                if (strings)
                    message = get(strings, message, msgOptions.INFO_MSG);

                let options = {
                    title: 'Information',
                    message: message,
                    position: msgOptions.POSITIONS.BOTTOM_RIGHT,
                    autoDismiss: msgOptions.AUTO_DISMISS,
                    action: action,
                    level: 'info'
                };

                this._notificationSystem.addNotification(options);
                return message;
            },
            // custom notify requires 
            // all params to be provided
            custom(options) {
                this._notificationSystem.addNotification(options);
            },
            componentDidMount() {
                this._notificationSystem = this.refs.notificationSystem;
            },
            loader(_this = null, visible = false, key = 'isLoading') 
            {
                if (visible)
                    $('#loader').removeClass('hidden');
                else
                    $('#loader').addClass('hidden');
                if (_this && key)
                    _this.setState({ [key]: visible });
            },
            render(){
             
                let translate = this.props.translate;
                let strings = translate(Key);
                const divStyle = { display: 'block' };

                return (
                <div style={divStyle}>
                    <Component 
                    {...this.props} {...this.state} strings={strings} loader={this.loader} 
                    notify={{
                            success: this.success,
                            error: this.error,
                            warning: this.warning,
                            info: this.info,
                            custom: this.custom
                        }} 
                    />
                    <ReactNotificationSystem ref="notificationSystem" />
                </div>);
            }
    }));   
}
