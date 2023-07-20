const Profile= require ("../models/profile.js")
const mongodbIdPattern= /^[0-9a-fA-F]{24}$/
const Joi = require("joi");
const {CLOUD_NAME,API_KEY,API_SECRET}= require("../config/index.js")
const cloudinary= require("cloudinary").v2
cloudinary.config({ 
   cloud_name: CLOUD_NAME, 
   api_key: API_KEY, 
   api_secret: API_SECRET 
 });


const profileController={
    async profile(req,res,next){
// 1 created the schema for validation of the profile picture in my app
        const profileSchema = Joi.object({
            photo:Joi.string().required(),
            author:Joi.string().regex(mongodbIdPattern).required()
        })
        
const{error}= profileSchema.validate(req.body)
if(error){
    console.log("here is the error of validation"+error)
    return next(error)
}
console.log("step 1 completed")
const {photo,author}= req.body;
let response;

try{
response= await cloudinary.uploader.upload(photo)

}
catch(error){
    console.log("here is the error of upload"+JSON.stringify(error,null,2))
    return next(error)
}

console.log("step 2 completed")
let newProfile;
try{
    
     newProfile= new Profile({
        photo:response.url ,
        author:author
    })
    
    await newProfile.save()
}
catch(error){
    console.log("here is the error of db"+error)
    return next(error)
}
console.log("step 3 completed")


res.status(201).json({newProfile})


    }
}

module.exports = profileController;