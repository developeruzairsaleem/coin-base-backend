const jwt = require("jsonwebtoken")
const {ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET}=require("../config/index.js")
const RefreshToken= require("../models/token.js")
class JWTService {
    //Sign access token
    static signAccessToken(payload,expiryTime){
        return jwt.sign(payload,ACCESS_TOKEN_SECRET,{expiresIn: expiryTime});
    }
    //Sign refresh token

    static signRefreshToken(payload,expiryTime){
        return jwt.sign(payload,REFRESH_TOKEN_SECRET,{expiresIn:expiryTime});
    }
    //Verify access token
    static verifyAccessToken(token){
        return jwt.verify(token,ACCESS_TOKEN_SECRET);
    }
    //Verify refresh token
    static verifyRefreshToken(token){
        return jwt.verify(token,REFRESH_TOKEN_SECRET)
    }
    //Store refresh token
    static async storeRefreshToken(token,userId){
        try{

            const newToken= new RefreshToken({
                token:token, userId: userId
            })
            await newToken.save()
        }
        catch(err){
            console.log(err)
        }
    }

}





module.exports= JWTService;