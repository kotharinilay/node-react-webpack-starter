'use strict';

/*************************************
 * main entry point when app is requested from browser    
 * *************************************/

import ReactDOM from 'react-dom';
import React from 'react';
import AppRoutes from './configure-store-provider';

// when is dom is ready, it renders the react app using AppRoute components
// it injects the html markup to main container
$(function () {    
    ReactDOM.render(<AppRoutes />, document.getElementById('main'));
    
    setTimeout(function () {        
        $.material.init(); // get working material ripple effects    
    }, 100);

});