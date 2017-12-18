'use strict';

/************************************** 
 * operations related to json web token
 ***************************************/

import jwt from 'jsonwebtoken';

// variables
const SECRET_KEY = process.env.AUTH_SECRET_KEY;
const TOKEN_EXP = process.env.AUTH_TOKEN_EXP;

// generate new token with required data 
function generateToken() {
    return jwt.sign({}, SECRET_KEY, { expiresIn: TOKEN_EXP });
}

// verify whether provided token is formatted correct jwt
function verifyToken(token) {
    try {
        let ret = {
            isError: false,
            payload: jwt.verify(token, SECRET_KEY)
        }
        return ret;
    } catch (error) {
        return {
            isError: true,
            errMsg: error.message
        }
    }
}

// decode encrypted token for verification
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken
}

