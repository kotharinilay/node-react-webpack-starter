'use strict';

/**********************************************
 * convert all the labels,titles to the chosen language
 * pass all as props under strings obj
 **********************************************/

import React, { Component } from 'react';
import { withTranslate } from 'react-redux-multilingual';

// expect unique key parameter
module.exports = (key) => {
    return Component => {
        // wrap with translate object to get {translate} as props
        return withTranslate(class Translation extends Component {

            constructor(props) {
                super(props);
                
                this.loader = this.loader.bind(this);
            }

            /**********************************************
             * set/reset loading
             * set loading without state : loading(null, true)
             * set loading with state : loading(this, true)
             * reset loading without state : loading()
             * reset loading with state (if key= 'isLoading') : loading(this)
             * reset loading with state : loading(this, false, 'keyName')
             **********************************************/
            loader(_this = null, visible = false, key = 'isLoading') {
                if (visible)
                    $('#loader').removeClass('hidden');
                else
                    $('#loader').addClass('hidden');
                if (_this && key)
                    _this.setState({ [key]: visible });
            }

            render() {
                let translate = this.props.translate;
                let strings = translate(key);
                return <Component {...this.props} {...this.state} strings={strings} loader={this.loader} />;
            }
        });
    }
}



