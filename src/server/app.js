'use strict';

/*************************************
 * main file to create server instance,
 * set views, singleton instances, api routes,
 * react router 
 * *************************************/

// load modules
import Express from 'express';
import path from 'path';
import Handlebars from 'handlebars';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import reactRouter from './middlewares/router';
import logging from './middlewares/logging';
import privateApi from './api/private';
import publicApi from './api/public';
import oauth2 from '../server/auth/oauth2';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { isTokenExpired, updateNewToken } from './middlewares/token';

// load redis configuration & start listening
require('./lib/cache-manager');

// Initialize passport strategies for routes
require('../server/auth/passport-auth');

// initialize our express app
const app = new Express();

app.use(cookieParser('ze@lous2012'));
app.use(compression());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set view path
app.set('views', path.join(__dirname, '../client/views'));
app.engine('handlebars', exphbs());
// setup handlebars for templating
app.set('view engine', 'handlebars');

// static assets
app.use("/static", Express.static(path.join(__dirname, '../../assets')));
app.use("/bower_components", Express.static(path.join(__dirname, '../../bower_components')));

// protect app from web vulnerabilities by setting HTTP headers appropriately
// Hide X-Powered-By
app.use(helmet.hidePoweredBy());

// server api routes 
app.use('/api/private',
    isTokenExpired, // check whether token is expired or not
    passport.authenticate('bearer', { session: false }), // re-issue token
    updateNewToken, // update new token to cookies
    privateApi);// allow access to private APIs

app.use('/api/public', publicApi);
app.use('/oauth/token', oauth2.token);
// universal routing and rendering
app.use(reactRouter);
// error logging
app.use(logging);

module.exports = app;