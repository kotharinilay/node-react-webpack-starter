'use strict';

/************************************** 
 * matches requested route with react router
 * renders respective component on server and deliver markup to template
 * note: this is only for first time when req is received
 ***************************************/

import React from 'react';
import ReactDOM from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import createRoutes from './../../client/routes';
import configureStore from './../../client/redux-store';
import { Provider } from 'react-redux'

//for multi language
import { IntlProvider } from 'react-redux-multilingual'
import translations from '../../client/localization/translations'
import localization from '../../client/localization/index'

// universal routing and rendering
module.exports = (req, res) => {
    let reduxState = {}
    let store = configureStore(reduxState);
    localization.checkLanguage(store);
    let routes = createRoutes(store);
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
        console.log("url: " + req.url);
        // in case of error display the error message
        if (err) {
            return res.status(500).send(err.message);
        }

        // in case of redirect propagate the redirect to the browser
        if (redirectLocation) {
            return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }        

        // generate the React markup for the current route
        let markup;
        console.log('call router');
        if (renderProps) {
            // if the current route matched we have renderProps
            markup = ReactDOM.renderToString(
                <Provider store={store}>
                    <IntlProvider translations={translations}>
                        <RouterContext {...renderProps} />
                    </IntlProvider>
                </Provider>);

        } else {
            // otherwise we can render a 404 page
            markup = ReactDOM.renderToString(<NotFoundPage />);
            res.status(404);
        }

        // push html and state to template        
        return res.render('index', { markup, reduxState });
    });
}