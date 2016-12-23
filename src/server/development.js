'use strict';

/**************************************
 * require hook will bind itself to node’s require
 * and automatically compile main.js at runtime 
 ************************************/

//Load css file from component
require('babel-register')({
    'plugins': [[
        'babel-plugin-transform-require-ignore',
        { extensions: ['.css'] }
    ]]
});
require('dotenv').config();     // set env variables

var app = require('./app'); // initiate server

// var Webpack = require('webpack');
// var WebpackConfig = require('../../webpack.config');
// var WebpackDevMiddleware = require('webpack-dev-middleware');
// var WebPackHotMiddleware = require('webpack-hot-middleware');

// // create a webpack instance from our dev config
// const webpackCompiler = Webpack(WebpackConfig);

// // Use webpack dev middleware to bundle our app on the fly and serve it 
// // on publicPath. Turn off verbose webpack output in our server console
// // by setting noInfo: true
// app.use(WebpackDevMiddleware(webpackCompiler, {
//     publicPath: WebpackConfig.output.publicPath,
//     noInfo: true
// }));

// // instruct our webpack instance to use webpack hot middleware
// app.use(WebPackHotMiddleware(webpackCompiler));

const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'production';
// start the server and listen specified port
app.listen(port, err => {
    if (err) { return console.error(err); }
    console.info("==> ✅ Express server is listening");
	console.info(`==> 🌎 Go to http://localhost:${port} [${env}]`);    
});   
