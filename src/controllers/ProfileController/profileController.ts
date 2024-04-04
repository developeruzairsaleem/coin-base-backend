import { Request, Response, NextFunction } from "express";
import UserInterface from "./UserInterface";
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
// ------------------------------------------------------------------
// extending Request interface with UserInterface from auth middleware
// ------------------------------------------------------------------
declare module "express" {
  interface Request {
    user: UserInterface;
  }
}
// ---------------------------------------------------
// defining the interface for current controller object
// ---------------------------------------------------
interface profileController {
  profileUpdate: Function;
}

// ------------------------------------------------------
// main controller object for profile related controllers
// ---------------------------------------------------

const profileController: profileController = {
  // ------------------------
  // update profile controller
  // ------------------------
  async profileUpdate(req: Request, res: Response, next: NextFunction) {
    const profilePhotoRegEx =
      /^data:image\/(png|jpg|jpeg|gif);base64,([A-Za-z0-9+/=])+$/;
    // -----------------------------------------
    // defining the steps to update the profile
    // ------------------------------------------

    // 1 - extract the user id as _id from the request object set by auth middleware
    // 2 - define the validation schema  for request body
    // 3 - validate the request body
    // 4 - validate the base 64 string of the profile photo
    // 5 - [interpreting]check if the updated username already exist in database
    // 5 - see if the user added the photo then update the photo as well
    // 6 - else just update the remaining req body
    // 7 - send the response to the client

    // 1 - extracted userid of user from auth middleware
    const extractedUserId: string = req.user._id.toString();

    // 2 - defining validation schema for request body for updating profile info
    const profileSchema = Joi.object({
      name: Joi.string().required(),
      username: Joi.string().required(),
      profilePhoto: Joi.string().regex(profilePhotoRegEx),
    });

    // 3 - validate the request body
    const { error } = profileSchema.validate(req.body);
    if (error) {
      console.log("here is the error of validation " + error);
      return next(error);
    }
    const { name, username, profilePhoto } = req.body;

    // 2
    console.log(req.user);
    console.log(req.user._id.toString());
    return res.status(200).json({ user: req.user });
    console.log("step 1 completed");
    let response;

    try {
      response = await cloudinary.uploader.upload(photo);
    } catch (error) {
      console.log("here is the error of upload");
      return next(error);
    }

    console.log("step 2 completed");

    // let newProfile;
    try {
      //  newProfile= new Profile({
      //     photo:response.url,
      //     author:author
      // })
      // await newProfile.save()
    } catch (error) {
      console.log("here is the error of db" + error);
      return next(error);
    }
    console.log("step 3 completed");

    res.status(201).json({ data: "nothing for now" });
  },
};

module.exports = profileController;

// bfs(g,node,visited):
//     visited.append node
//     queue.append node

//     while queue:
//         m = queue[0]
//     visited.append m
//         queue.pop

//         for(neighbor in g[q]){
//            if(neighbor not in visited)
//               queue.append neighbor
//         }