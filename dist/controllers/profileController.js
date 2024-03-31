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
const Profile = require("../models/profile.js");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const Joi = require("joi");
const { CLOUD_NAME, API_KEY, API_SECRET } = require("../config/index.js");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});
const profileController = {
    profile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1 created the schema for validation of the profile picture in my app
            const profileSchema = Joi.object({
                name: Joi.string().required,
                username: Joi.string().require(),
                author: Joi.string().regex(mongodbIdPattern).required()
            });
            const { error } = profileSchema.validate(req.body);
            if (error) {
                console.log("here is the error of validation" + error);
                return next(error);
            }
            console.log("step 1 completed");
            const { photo, author, name, username } = req.body;
            let response;
            try {
                response = yield cloudinary.uploader.upload(photo);
            }
            catch (error) {
                console.log("here is the error of upload");
                return next(error);
            }
            console.log("step 2 completed");
            let newProfile;
            try {
                newProfile = new Profile({
                    photo: response.url,
                    author: author
                });
                yield newProfile.save();
            }
            catch (error) {
                console.log("here is the error of db" + error);
                return next(error);
            }
            console.log("step 3 completed");
            res.status(201).json({ newProfile });
        });
    }
};
module.exports = profileController;
