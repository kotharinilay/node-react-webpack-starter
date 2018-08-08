'use strict';

/****************************************
 * middleware for private api routes
 * to check whether token is expired/eligible for renew
 * and also update new token to response cookies
 * ************************************** */

import Promise from 'bluebird';
import { verifyToken, generateToken } from '../auth/jsonwebtoken';
import { COOKIE } from '../../shared/cookie';
import { getContactById } from '../repository/contact';
import { updateToken, removeToken } from '../repository/token';
import { replaceAll, trim } from '../../shared/format/string';
import cache from './../lib/cache-manager';

// validate token if provided with request
// re-generate if expired and remember me has chosen 
let validateTokenOnRequest = (req, res) => {

    let token = req.cookies[COOKIE.ID_TOKEN];
    let rememberMe = req.cookies[COOKIE.REMEMBER_ME] == 'true' ? true : false;

    if (token) {
        let tokenStatus = verifyToken(token);

        return cache.getAsync(token).then(function (data) {
            var json = data != null ? JSON.parse(data) : {};

            if (tokenStatus.isError) {

                // token is expired/invalid

                if (tokenStatus.errMsg.indexOf('expire') != -1 && rememberMe) {
                    // renew token if user has chosen remember me
                    var newToken = generateToken();

                    updateToken({ Token: newToken }, { Token: token })
                        .then(function (res) { }).catch(function (err) { });

                    tokenStatus = verifyToken(newToken);
                    res.cookie(COOKIE.ID_TOKEN, newToken);

                    return getContactById(json.ContactId).then(function (state) {
                        return state;
                    });
                }
                else {
                    // delete existing expired token
                    removeToken({ Token: token }).then(function (res) { }).catch(function (err) { });
                }

                res.clearCookie(COOKIE.ID_TOKEN);
                res.clearCookie(COOKIE.REMEMBER_ME);
                req.url = '/login';
            }
            else {

                // token is valid
                return getContactById(json.ContactId).then(function (state) {
                    return state;
                });
            }
        });
    }

    return null;
}

// check token is expired or not
// if user has remember me as true then allow to generate new token
// if user does not have remember me then redirect to login
let isTokenExpired = (req, res, next) => {

    const token = extractToken(req.headers['authorization']);
    const rememberMe = req.headers['rememberme'] == 'true' ? true : false;
    // check whether token exist into cache or not
    cache.getAsync(token).then(function (resCache) {

        if (resCache == null) {
            res.sendStatus(401);
        }
        else {
            // if token is not provided
            if (!token) {
                res.sendStatus(401);
                return
            }

            let data = verifyToken(token);
            if (data.isError && rememberMe == false) {
                res.sendStatus(401);
                return;
            }

            next();
        }
    });
}

// update newly generated token to response cookies
let updateNewToken = (req, res, next) => {
    // update authInfo data here
    let authInfo = req.authInfo || {};
    authInfo['language'] = req.headers['accept-language'] || 'en';
    req['authInfo'] = authInfo;

    if (req.authInfo && req.authInfo.isTokenRenewed) {
        res.cookie(COOKIE.ID_TOKEN, req.authInfo.token);
    }

    next();
}

let extractToken = (bearer) => {
    if (bearer) {
        return trim(replaceAll(bearer, 'Bearer', ''));
    }
    return null;
}

module.exports = {
    isTokenExpired: isTokenExpired,
    updateNewToken: updateNewToken,
    validateTokenOnRequest: Promise.method(validateTokenOnRequest)
}