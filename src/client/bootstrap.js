'use strict';

/*************************************
 * main entry point when app is requested from browser    
 * *************************************/

import ReactDOM from 'react-dom';
import React from 'react';
require('es6-promise').polyfill();
import App from './configure-provider';
import { loadCulture } from '../shared/format/date';
import firebaseInit from './firebase-setup';

// when dom is ready, it renders the react app 
// it injects the html markup to main container
window.onload = function () {
    loadCulture();
    firebaseInit.initialize();
    ReactDOM.render(<App />, document.getElementById('main'), function () {
        // console.log('app  ready');
    });
};
