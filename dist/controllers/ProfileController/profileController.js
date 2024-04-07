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
Object.defineProperty(exports, "__esModule", { value: true });
const UserDto = require("../../dto/user");
const User = require("../../models/user.js");
const Joi = require("joi");
// -----------------------------------------
// cloudinary configuration for photo upload
// -----------------------------------------
const { CLOUD_NAME, API_KEY, API_SECRET } = require("../../config/index");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
});
//------------------------------------------
// is username available for the update in db or is already taken
//------------------------------------------
const usernameAvailable = (userId, username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ username, _id: { $ne: userId } });
    return !user;
});
// ------------------------------------------------------
// main controller object for profile related controllers
// ---------------------------------------------------
const profileController = {
    // ------------------------
    // update profile controller
    // ------------------------
    profileUpdate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilePhotoRegEx = /^data:image\/(png|jpg|jpeg|gif);base64,([A-Za-z0-9+/=])+$/;
            // -----------------------------------------
            // defining the steps to update the profile
            // ------------------------------------------
            // 1 - extract the user id as _id from the request object set by auth middleware
            // 2 - define the validation schema  for request body
            // 3 - validate the request body
            // 4 - validate the base 64 string of the profile photo
            // 5 - check if the updated username already exist in database
            // 5 - see if the user added the photo then update the photo as well
            // 6 - else just update the remaining req body
            // 7 - send the response to the client
            // 1 - extracted userid of user from auth middleware
            const extractedUserId = req.user._id.toString();
            // 2 - defining validation schema for request body for updating profile info
            const profileSchema = Joi.object({
                name: Joi.string().required(),
                username: Joi.string().required(),
                profilePhoto: Joi.string().allow("").regex(profilePhotoRegEx),
            });
            // 3 - validate the request body
            // 4 - validate the base 64 string
            const { error } = profileSchema.validate(req.body);
            if (error) {
                console.log("here is the error of validation " + error);
                return next(error);
            }
            // extract the data
            const { name, username, profilePhoto } = req.body;
            // 5 - check if the updated username already exists in the database
            try {
                const isAvailable = yield usernameAvailable(extractedUserId, username);
                if (!isAvailable) {
                    const error = {
                        status: 409,
                        message: "Username already exist"
                    };
                    return next(error);
                }
            }
            catch (error) {
                return next(error);
            }
            // 6 - if the user did not added the photo then just update the remaining request body
            if (profilePhoto !== "" && !profilePhoto) {
                try {
                    const updatedProfile = {
                        username, name
                    };
                    const updatedUser = yield User.findByIdAndUpdate(extractedUserId, updatedProfile, { new: true });
                    const userToSend = new UserDto(updatedUser);
                    return res.status(200).json({ data: userToSend });
                }
                catch (error) {
                    return next(error);
                }
            }
            // 7 - if profilephoto is not an empty string and is a valid image then upload it
            let updatedProfile = { name, username, profilePhoto: "" };
            if (profilePhoto) {
                try {
                    const response = yield cloudinary.uploader.upload(profilePhoto);
                    updatedProfile.profilePhoto = response.url;
                }
                catch (error) {
                    return next(error);
                }
            }
            const updatedUser = yield User.findByIdAndUpdate(extractedUserId, updatedProfile, { new: true });
            const userToSend = new UserDto(updatedUser);
            return res.status(200).json({ data: userToSend, auth: true });
        });
    },
};
module.exports = profileController;
