'use strict';

/*************************************
 * main file to create server instance,
 * set views, singleton instances, api routes,
 * react router 
 * *************************************/

// load modules
import Express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import reactRouter from './middlewares/router';
import expressApi from './api';

dotenv.config();

// initialize our express app
const app = new Express();
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
app.set('port', (process.env.PORT || 3000));

// express middleware
// static assets

app.use("/static", Express.static(path.resolve(process.cwd(), 'assets')));
app.use("/bower_components", Express.static(path.resolve(process.cwd(), 'bower_components')));

// protect app from web vulnerabilities by setting HTTP headers appropriately
// Hide X-Powered-By
app.use(helmet.hidePoweredBy());

// server api routes 
app.use('/api', expressApi);

// universal routing and rendering
app.use(reactRouter);

// // Log all requests
// app.use(function(req, res, next) {
//     var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
//     logger.log('request', req.method, req.url, ip);
//     next();
// });
 
module.exports = app;