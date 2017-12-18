'use strict';

/*************************************
 * oauth2 functions for various grant types
 * generates new token
 * *************************************/

import oauth2orize from 'oauth2orize';
import passport from 'passport';
import { createToken, removeToken } from '../repository/token';
import { getContactByCondition } from '../repository/contact';
import { checkPassword } from '../auth/password-auth';
import { generateToken } from '../auth/jsonwebtoken';
import cache from './../lib/cache-manager';

// create OAuth 2.0 server
var authServer = oauth2orize.createServer();

// destroy old tokens and generates a new access and refresh token
var generateTokens = function (tokenObj, user, done) {

	let token = generateToken();
	// this data obj will be returned for client storage
	let returnObj = {
		FirstName: user.FirstName,
		LastName: user.LastName,
		Email: user.Email,
		AvatarField: user['avatar.Path'],
		CompanyId: user['company.UUID'],
		CompanyName: user['company.Name'],
		CompanyLogo: user['company.companylogo.Path'],
		IsSiteAdministrator: user.IsSiteAdministrator == undefined || user.IsSiteAdministrator == null ? false : user.IsSiteAdministrator,
		IsSuperUser: user.IsSuperUser == undefined || user.IsSuperUser == null ? false : user.IsSuperUser,
		TopPIC: {
			PropertyId: user['property.PropertyId'],
			Name: user['property.Name'],
			PIC: user['property.PIC'],
			LogoUrl: user['property.propertylogo.Path']
		}
	}

	// claims will stored at server cache storage per token
	var claims = {
		ContactId: user.UUID,
		CompanyId: user['company.UUID'],
		IsSiteAdministrator: returnObj.IsSiteAdministrator,
		IsSuperUser: returnObj.IsSuperUser
	};
	cache.setString(token, JSON.stringify(claims));

	tokenObj.Token = token;
	return createToken(tokenObj).then(function (res) {
		return done(null, true, { Token: tokenObj.Token, userInfo: returnObj });
	}).catch(function (err) {
		return done(err);
	});
};

// exchange username & password for access token.
authServer.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {

	return getContactByCondition({ Email: username }).then(function (user) {
		if (!user || !checkPassword(password, user.PasswordSalt, user.PasswordHash)) {
			return done({ message: 'Email or Password is incorrect.' }, true, { iscustom: true });
		}

		let obj = {
			ClientId: client.Id,
			ContactId: user.Id
		}

		return generateTokens(obj, user, done);
	}).catch(function (err) {
		return done(err);
	});
}));

exports.token = [
	passport.authenticate(['oauth2-client-password'], { session: false }),
	authServer.token(),
	authServer.errorHandler()
];
