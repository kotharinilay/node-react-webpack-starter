'use strict';

/**************************************
 * resize image to specific aspect ratio
 * jimp : https://github.com/oliver-moran/jimp
 ************************************/

import path from 'path';
import { getResponse } from './index';
var Jimp = require("jimp");

function resizeImage(file) {    
    return Jimp.read(path.join(__dirname, '../../../uploads/', file.filename)).then(function (img) {       
        img.resize(75, 75)
            .write(path.join(__dirname, '../../../uploads/thumbs/', file.filename));
        return getResponse();
    }).catch(function (err) {
        return getResponse(500, err.toString());
    });
}

module.exports = {
    resizeImage: resizeImage
}