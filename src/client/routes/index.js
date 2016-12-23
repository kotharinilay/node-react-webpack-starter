'use strict';

/*************************************
 * consist all routes for browser app  
 * *************************************/

// load react dependacies
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { injectAsyncReducer } from '../redux-store/index';

// To create separate bundle at runtime
if (typeof require.ensure === "undefined") {
    require.ensure = require('node-ensure');
}

// define app routes
const routes = (store) => (
    <Route>
        <Route getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/layout-unauth').default)
            })
        } }>
            <Route path="/login" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    injectAsyncReducer(store, 'login', require('../app/layout-unauth/login/reducer').default);
                    cb(null, require('../app/layout-unauth/login').default)
                })
            } }></Route>
        </Route>

        <Route path="/" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'header', require('../app/layout-auth/header/reducer').default);
                cb(null, require('../app/layout-auth/index').default)
            })
        } }>
            <IndexRoute getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/dashboard').default)
                })
            } }></IndexRoute>
            <Route path="/livestock" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/livestock').default)
                })
            } }></Route>
        </Route>

        <Route path="*" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/common/NotFound').default)
            })
        } }></Route>
    </Route>
);

export default routes;