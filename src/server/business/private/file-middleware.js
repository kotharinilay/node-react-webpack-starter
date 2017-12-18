'use strict';

/**************************************
 * file middleware to manage upload files
 * using multer
 ************************************/

import path from 'path';
import Promise from 'bluebird';
import { getResponse, resMessages } from '../../lib/index';

var multer = require('multer');
let fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

// multer middleware to store uploaded files from client
// default storage location for all files "server/uploads"
var upload = multer({ storage: storage });

// delete file from server storage which is temporary stored by middleware
let deleteServerFile = (fileName, hasThumb) => {
    try {

        let filePath = path.join(__dirname, '../../../../uploads/', fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (hasThumb) {
            let thumbPath = path.join(__dirname, '../../../../uploads/thumbs/', fileName);
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
        }
        return getResponse();
    } catch (error) {
        return getResponse(500, error.toString());
    }
}

module.exports = {
    upload: upload,
    deleteServerFile: Promise.method(deleteServerFile)
}