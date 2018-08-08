'use strict';

/*************************************
 * consist all routes for browser app  
 * *************************************/

// load react dependacies
import React from 'react'; 
import { Route, IndexRoute } from 'react-router';
import { injectAsyncReducer } from '../redux-store/index';
import { checkAuth } from '../services/public/login';
// load app routes
import Public from './public';
import Private from './private';

// To create separate bundle at runtime
if (typeof require.ensure === "undefined") {
    require.ensure = require('node-ensure');
}

// define app routes
const routes = (store) => (
    <Route >
        {Public(store)}
        {Private(store)}
        <Route path="*" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/common/NotFound').default)
            })
        } }></Route>
    </Route>
);

export default routes;