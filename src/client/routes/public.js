'use strict';

/*********************************************
 * consists public routes which does not require auth token
 ********************************************/

import React from 'react';
import { Route } from 'react-router';
import { injectAsyncReducer } from '../redux-store/index';
import { skipLogin } from '../services/public/login';

// To create separate bundle at runtime
if (typeof require.ensure === "undefined") {
    require.ensure = require('node-ensure');
}

const Public = (store) => (
    <Route getComponent={(nextState, cb) => {
        require.ensure([], () => {
            cb(null, require('../app/public').default)
        })
    } }>
        <Route path="/login(/:redirect)" onEnter={skipLogin} getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'authUser', require('../app/public/login/reducer').default);
                cb(null, require('../app/public/login').default)
            })
        } }></Route>
        <Route path="/forgotpassword" onEnter={skipLogin} getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/public/password/components/Forgot').default)
            })
        } }></Route>
        <Route path="/checkemail" onEnter={skipLogin} getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/public/password/components/CheckEmail').default)
            })
        } }></Route>
        <Route path="/resetpassword/:resetpassword" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/public/password/components/Reset').default)
            })
        } }></Route>
    </Route>
);

export default Public;