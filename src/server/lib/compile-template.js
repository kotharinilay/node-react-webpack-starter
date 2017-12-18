'use strict';

/********************************************
 * Compile handlebar template from html 
 * ************************************* */

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

module.exports = (relativePath, data) => {       
    var absPat = path.join(__dirname,"../../../", relativePath);    
    console.log(absPat);
    var content = fs.readFileSync(absPat, 'utf-8');
    var template = Handlebars.compile(content);
    return template(data);
}
