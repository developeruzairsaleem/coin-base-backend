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
const JWTService = require("../services/JWTservice.js");
const User = require("../models/user.js");
const UserDto = require("../dto/user.js");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken, accessToken } = req.cookies;
        if (!refreshToken || !accessToken) {
            const error = {
                status: 401,
                message: "Unauthorized request",
            };
            return next(error);
        }
        let _id;
        try {
            _id = JWTService.verifyAccessToken(accessToken)._id;
        }
        catch (error) {
            return next(error);
        }
        let user;
        try {
            user = yield User.findOne({ _id: _id });
            console.log("User in the middleware:", user);
        }
        catch (err) {
            return next(err);
        }
        const userDTO = new UserDto(user);
        req.user = userDTO;
        req.body.author = _id;
        next();
    }
    catch (err) {
        return next(err);
    }
});
module.exports = auth;
