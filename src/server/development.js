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

require('../../load.env.js')();
var app = require('./app'); // initiate server

const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'development';
// start the server and listen specified port
app.listen(port, err => {
    // // to generate dummy initial data
    // var data = require('../shared/generate-data');
    // data();
    if (err) { return console.error(err); }
    console.info("==> ✅ Express server is listening");
    console.info(`==> 🌎 Go to http://localhost:${port} [${env}]`);
});   
    