'use strict';

/******************************************
 * log server exception to aws cloud watch service
 * using winston logging library [production]
 * *****************************************/

import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

// resolve relative path
var logPath = path.join(process.cwd(), 'log');

// create directory if not exist
if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

let consoleOptions = {
    colorize: true
};

// common logger accepting level args
let logger = function (level) {
    return new winston.Logger({
        transports: [
            new (winston.transports.Console)(consoleOptions),
            new (winston.transports.DailyRotateFile)({
                filename: path.join(process.cwd() + '/log', 'log'),
                datePattern: '.dd-MM-yyyy',
                level: level,
                prettyPrint: true,
                handleExceptions: true,
                colorize: true                
            })
        ]
    });
}

let error = logger('error').error;
let info = logger('info').info;
let warn = logger('warn').warn;

module.exports = { error, info, warn };