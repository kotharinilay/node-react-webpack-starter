'use strict';

/*************************************
 * defined api calls here  
 * *************************************/

import Promise from 'bluebird';
import request from './../lib/http/request';

var getData= function getData() {
    return new Promise(function (resolve, reject) {
        return request.get('api/test').then(function (res) {
            resolve(res);
        }).catch(function (err) {
            reject(err);
        })     
    });
}

module.exports = { getData };