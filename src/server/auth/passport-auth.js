'use strict';

/*************************************
 * passport strategies implementation for
 * resctricted routes
 * *************************************/

import passport from 'passport';
import { getClientById } from '../repository/client';
import { createToken, removeToken, updateToken } from '../repository/token';
import { verifyToken, generateToken, decodeToken } from '../auth/jsonwebtoken';
import cache from '../lib/cache-manager';

// import strategies
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

// ClientPassword strategy of passport js
// it will check client pass by user while login
passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        getClientById(clientId).then(function (clientObj) {
            if (!clientObj) {
                return done(null, false);
            }

            if (clientObj.ClientSecret !== clientSecret) {
                return done(null, false);
            }

            return done(null, clientObj);
        }).catch(function (err) {
            return done(err);
        });
    }
));

// Bearer Strategy of passport js
// it will check token for every request from client
passport.use(new BearerStrategy(
    function (accessToken, done) {

        let tokenObj = verifyToken(accessToken);
        cache.getAsync(accessToken).then(function (res) {            
            
            var data = JSON.parse(res);
            var returnObj = {
                contactId: data.ContactId,
                companyId: data.CompanyId,
                isSiteAdministrator: data.IsSiteAdministrator,
                isSuperUser: data.IsSuperUser
            };

            if (tokenObj.isError) {
                if (tokenObj.errMsg.indexOf('expire') != -1) {
                    //call for regenerate token
                    var newToken = generateToken();
                    
                    // TODO: need to revise logic here
                    updateToken({ Token: newToken }, { Token: accessToken }).then(function () {

                        cache.setString(newToken, res);
                        returnObj.token = newToken;
                        returnObj.isTokenRenewed = true;

                        done(null, true, returnObj);
                    });
                }
                else {
                    done(tokenObj.errMsg);
                }
            }
            else {
                returnObj.token = accessToken;
                done(null, true, returnObj);
            }
        });
    }
));