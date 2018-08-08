'use strict';

/********************************************
 * Compile handlebar template from html 
 * ************************************* */

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

module.exports = (relativePath, data) => {
    var absPath = path.join(__dirname, "../templates/", relativePath);
    var content = fs.readFileSync(absPath, 'utf-8');
    var template = Handlebars.compile(content);
    return template(data);
}
