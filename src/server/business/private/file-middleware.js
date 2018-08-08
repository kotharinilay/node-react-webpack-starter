'use strict';

/**************************************
 * file middleware to manage upload files
 * using multer
 ************************************/

import path from 'path';
import { getFileExtension } from '../../../shared';
import Promise from 'bluebird';
import { getResponse, resMessages } from '../../lib/index';
import { deleteObjects as s3_delete, getSignedUrl } from '../../../../aws/s3';

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

let getSignedRequest = (files, uploadFolder) => {
    let signedObj = [];
    Object.keys(files).map(function (i) {
        let file = JSON.parse(files[i]);
        signedObj.push(getSignedUrl(file.filename, file.filetype, uploadFolder));
    })
    return getResponse(200, null, { data: signedObj });
}

module.exports = {
    upload: upload,
    deleteServerFile: Promise.method(deleteServerFile),
    getSignedRequest: Promise.method(getSignedRequest)
}