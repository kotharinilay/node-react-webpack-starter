'use strict';

/*********************************************
 * consists private routes which requires valid auth token
 ********************************************/

import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import { injectAsyncReducer } from '../redux-store/index';
import { checkAuth } from '../services/public/login';

// To create separate bundle at runtime
if (typeof require.ensure === "undefined") {
    require.ensure = require('node-ensure');
}

// export routes
const Private = (store) => (
    <Route path="/" onChange={checkAuth} onEnter={checkAuth} getComponent={(nextState, cb) => {
        require.ensure([], () => {
            injectAsyncReducer(store, 'header', require('../app/private/header/reducer').default);
            cb(null, require('../app/private/index').default)
        })
    }}>
        <IndexRedirect to="/dashboard" />

        <Route path="/dashboard(/:screen)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/dashboard').default)
            })
        }}>
        </Route>

        <Route path="/contact(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/contact').default)
            })
        }}></Route>
    </Route>
);

export default Private;