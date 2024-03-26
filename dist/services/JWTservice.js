"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config/index.js");
const RefreshToken = require("../models/token.js");
class JWTService {
    //Sign access token
    static signAccessToken(payload, expiryTime) {
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
    }
    //Sign refresh token
    static signRefreshToken(payload, expiryTime) {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
    }
    //Verify access token
    static verifyAccessToken(token) {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
    //Verify refresh token
    static verifyRefreshToken(token) {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
    //Store refresh token
    static storeRefreshToken(token, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newToken = new RefreshToken({
                    token: token, userId: userId
                });
                yield newToken.save();
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
module.exports = JWTService;
