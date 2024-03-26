const JWTService= require("../services/JWTservice.js");
const User = require("../models/user.js")
const UserDto=require("../dto/user.js")
const auth=async (req,res,next)=>{
try{

    
    const {refreshToken,accessToken}=req.cookies;
if(!refreshToken||!accessToken){
const error={
    status:401,
    message:"Unauthorized request"
}
return next(error)
}
let _id;
try{
    _id= JWTService.verifyAccessToken(accessToken)._id
}catch(error){
    return next(error)
}

let user;
 try{

      user= await User.findOne({_id:_id})
    }
    catch(err){
        return next(err)
    }
    const userDTO= new UserDto(user)
 
    req.user= userDTO;
    next()
}
catch(err){
    return next(err)
}
}


module.exports= auth;