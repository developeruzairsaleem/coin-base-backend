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
const Joi = require("joi");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user.js");
const JWTService = require("../services/JWTservice.js");
const RefreshToken = require("../models/token.js");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate user with express validator
            //validate user
            const userRegisterSchema = Joi.object({
                username: Joi.string().max(30).min(5).required(),
                name: Joi.string().max(30).required(),
                email: Joi.string().email().required(),
                password: Joi.string().pattern(passwordPattern).required(),
                confirmPassword: Joi.ref("password")
            });
            const { error } = userRegisterSchema.validate(req.body);
            // if error in validation return error via middleware
            if (error) {
                return next(error);
            }
            // check if email is already registered or not
            const { username, name, email, password } = req.body;
            const usernameInUse = yield User.exists({ username });
            const emailInUse = yield User.exists({ email });
            try {
                if (usernameInUse) {
                    const err = {
                        status: 409,
                        message: "Username already exists"
                    };
                    return next(err);
                }
                if (emailInUse) {
                    const err = {
                        status: 409,
                        message: "Email already exists"
                    };
                    return next(err);
                }
            }
            catch (err) {
                return next(err);
            }
            // passwordhash
            const hashedPassword = yield bcrypt.hash(password, 10);
            // Store user data in db
            let accessToken;
            let refreshToken;
            let user;
            try {
                const userToSave = new User({
                    name,
                    username,
                    email,
                    password: hashedPassword
                });
                user = yield userToSave.save();
                accessToken = JWTService.signAccessToken({ _id: user._id }, "20s");
                refreshToken = JWTService.signRefreshToken({ _id: user.id }, "5m");
            }
            catch (error) {
                return next(error);
            }
            // Store refresh token in db
            yield JWTService.storeRefreshToken(refreshToken, user._id);
            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                sameSite: "None",
                secure: true
            });
            res.cookie("refreshToken", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                sameSite: "None",
                secure: true
            });
            // response send
            const userToSend = new UserDto(user);
            res.status(201).json({ user: userToSend, auth: true });
        });
    },
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // validate user data
            const userLoginSchema = Joi.object({
                username: Joi.string().min(5).max(30).required(),
                password: Joi.string().pattern(passwordPattern)
            });
            // if validation error return error
            const { error } = userLoginSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            //match username and password
            const { username, password } = req.body;
            let user;
            try {
                user = yield User.findOne({ username });
                //match user
                if (!user) {
                    const error = {
                        status: 401,
                        message: "Invalid username"
                    };
                    return next(error);
                }
                //match password
                const passwordMatch = yield bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    const error = {
                        status: 401,
                        message: "Invalid Password"
                    };
                    return next(error);
                }
            }
            catch (error) {
                return next(error);
            }
            //tokens 
            const accessToken = JWTService.signAccessToken({ _id: user._id }, "20s");
            const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "5m");
            // store in db
            try {
                yield RefreshToken.updateOne({
                    _id: user._id
                }, {
                    token: refreshToken
                }, { upsert: true });
            }
            catch (err) {
                return next(err);
            }
            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                sameSite: "None",
                secure: true
            });
            res.cookie("refreshToken", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                sameSite: "None",
                secure: true
            });
            const userToSend = new UserDto(user);
            res.status(200).json({ user: userToSend, auth: true });
        });
    },
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // delete token in db
            const { refreshToken } = req.cookies;
            try {
                yield RefreshToken.deleteOne({ token: refreshToken });
            }
            catch (error) {
                return next(error);
            }
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ user: null, auth: false });
        });
    },
    refresh(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1  get refresh token from cookies
            const originalRefreshToken = req.cookies.refreshToken;
            // 2  verify refresh token
            let id;
            try {
                id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
            }
            catch (err) {
                return next(err);
            }
            try {
                const match = yield RefreshToken.findOne({ _id: id, token: originalRefreshToken });
                if (!match) {
                    const error = {
                        status: 401,
                        message: "Unauthorized user"
                    };
                    return next(error);
                }
            }
            catch (err) {
                return next(err);
            }
            // 3  generate new tokens
            try {
                const accessToken = JWTService.signAccessToken({ _id: id }, "20s");
                const refreshToken = JWTService.signRefreshToken({ _id: id }, "5m");
                yield RefreshToken.updateOne({ _id: id }, { token: refreshToken });
                res.cookie("accessToken", accessToken, {
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly: true,
                    sameSite: "None",
                    secure: true
                });
                res.cookie("refreshToken", refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly: true,
                    sameSite: "None",
                    secure: true
                });
            }
            catch (error) {
                return next(error);
            }
            let userDTO;
            try {
                const user = yield User.findOne({ _id: id });
                userDTO = new UserDto(user);
            }
            catch (err) {
                return next(err);
            }
            return res.status(200).json({ user: userDTO, auth: true });
            // 4  update db return response
        });
    }
};
module.exports = authController;
