'use strict';

/************************************** 
 * expose all api routes 
 ***************************************/

import Express from 'express';
import fs from 'fs';

// create router instance
var router = Express.Router();

// load all api files synchronously 
fs.readdirSync(__dirname).forEach(function (file) {
    if (file == "index.js" || file == "registration.js") return;

    var name = file.substr(0, file.indexOf('.'));
    require('./' + name).default(router);
});

// ADD ROUTING MIDDLEWARES HERE TO HANDLE 404/500

module.exports = router;    