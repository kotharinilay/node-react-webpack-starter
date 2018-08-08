'use strict';

/************************************** 
 * matches requested route with react router
 * renders respective component on server and deliver markup to template
 * note: this is only for first time when req is received
 ***************************************/

// load npm dependacies
import React from 'react';
import ReactDOM from 'react-dom/server';
import { match } from 'react-router';

// routes and store
import allRoutes from './../../client/routes';
import publicRoutes from './../../client/routes/public';
import configureStore, { injectAsyncReducer } from './../../client/redux-store';
import NotFound from './../../client/app/common/NotFound';

import { getModuleControlMenus } from '../repository/module';
import { bufferToUUID } from '../../shared/uuid/index';

// Handle onTouchTap for material-ui
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import { validateTokenOnRequest } from './token';

// universal routing and rendering
module.exports = (req, res) => {
    let reduxState = null;
    let store = configureStore(reduxState);
    let all_routes = allRoutes(store);
    let public_routes = publicRoutes(store);
    let language = 'en';

    // allow public routes to be accessible for everyone if token is not available
    match({ routes: public_routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (renderProps == undefined) { req.url = '/login'; }
    });

    // match all other routes validating token
    match({ routes: all_routes, location: req.url }, (err, redirectLocation, renderProps) => {
        return validateTokenOnRequest(req, res).then(function (state) {
            return redirect(err, redirectLocation, renderProps, state);
        });
    });

    // redirect user to requested location
    var redirect = (err, redirectLocation, renderProps, reduxState = null) => {
        var data = {};
        // in case of error display the error message
        if (err) {
            return res.status(500).send(err.message);
        }

        // in case of redirect propagate the redirect to the browser
        if (redirectLocation) {
            return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }

        if (reduxState) {
            data = {
                isError: false,
                authUser: {
                    FirstName: reduxState.FirstName,
                    LastName: reduxState.LastName,
                    Email: reduxState.Email,
                    ContactId: reduxState.UUID,
                    AvatarField: reduxState['avatar.Path'],
                    CompanyId: reduxState['company.CompanyId'],
                    CountryId: reduxState['company.CountryId'],
                    CompanyName: reduxState['company.CompanyName'],
                    CompanyLogo: reduxState['company.companylogo.Path'],
                    IsSiteAdministrator: reduxState.IsSiteAdministrator,
                    IsAgliveSupportAdmin: reduxState['company.IsAgliveSupportAdmin'],
                    IsSuperUser: reduxState.IsSuperUser
                },
                topPIC: {
                    PropertyId: reduxState['property.PropertyId'],
                    PIC: reduxState['property.PIC'],
                    Name: reduxState['property.Name'],
                    LogoUrl: reduxState['property.propertylogo.Path'],
                    CompanyId: reduxState['property.company.regionId'] ? null : reduxState['property.company.companyId'],
                    CompanyName: reduxState['property.company.regionId'] ? null : reduxState['property.company.companyName'],
                    RegionId: reduxState['property.company.regionId'],
                    BusinessId: reduxState['property.company.regionId'] ? reduxState['property.company.companyId'] : null
                }
            }
        }

        return getModuleControlMenus(language).then(function (response) {

            // remove ' and " from property name
            if (data && data.topPIC && data.topPIC.Name) {
                data.topPIC.Name = data.topPIC.Name.replace(/\"/g, '').replace(/\'/g, '');
            }

            // push html and state to template 
            return res.render('index',
                {
                    ReduxState: JSON.stringify(data),
                    SiteUrl: process.env.SITE_URL,
                    Menus: JSON.stringify({
                        moduleMenu: response[0],
                        controlMenu: response[1]
                    }),
                    Firebase: JSON.stringify({
                        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
                        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
                        FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
                    })
                });

        });
    }
}