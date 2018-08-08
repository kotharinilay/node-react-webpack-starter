'use strict';

/**************************************
 * resize image to specific aspect ratio
 * jimp : https://github.com/oliver-moran/jimp
 ************************************/

import path from 'path';
import { getResponse, copyFile } from './index';
import Promise from 'bluebird';
var Jimp = require("jimp");

function resizeImage(file) {
    return new Promise((resolve, rej) => {
        if (file.mimetype == Jimp.MIME_PNG || file.mimetype == Jimp.MIME_JPEG || file.mimetype == Jimp.MIME_BMP)
            resolve(true);
        else {
            copyFile(path.join(__dirname, '../../../uploads/', file.filename), path.join(__dirname, '../../../uploads/thumbs/', file.filename));
            resolve(false);
        }
    }).then(function (res) {
        if (res)
            return Jimp.read(path.join(__dirname, '../../../uploads/', file.filename));
        else return false;
    }).then(function (img) {
        if (img)
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