const Joi= require("joi")
const User= require("../models/user.js")
const bcrypt = require("bcryptjs")
const UserDto=require("../dto/user.js")
const JWTService= require("../services/JWTservice.js")
const RefreshToken= require("../models/token.js")

const passwordPattern=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController={
    async register(req,res,next){


        //------------------------------
        //validate user
        //--------------------------------
        const userRegisterSchema= Joi.object({
            username: Joi.string().max(30).min(5).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref("password")
        })

        //-----------------------------------------------
        // if error occurs while validating the user data
        //-----------------------------------------------
        const {error}=userRegisterSchema.validate(req.body); 



        //-----------------------------------------------
        // if error in validation return error via middleware
        //-----------------------------------------------
        if(error){
        return next(error)
        }

        // DESCTRUCTIRE USER PAYLOAD
        const{username,name,email,password}=req.body;





        //--------------------------------------------------------
        // check if EMAIL OR USERNAME is already registered or not
        //--------------------------------------------------------
        try{

            const usernameInUse = await User.exists({username});
            const emailInUse = await User.exists({email})

            if(usernameInUse){
                const err = {
                status : 409,
                message: "Username already exists"
                }    
                return next(err)
            }
            
            if(emailInUse){
                const err= {
                    status: 409,
                    message:"Email already exists"
                }
                return next(err)
            }
        }
        catch(err){
         return next (err)
        }




        let hashedPassword;

        //---------------------------------------
        // LET'S HASH THE PASSWORD TO STORE IN MONGO
        //---------------------------------------
        try{

             hashedPassword= await bcrypt.hash(password,10)    
        }
        catch(err){
            return next(err);
        }


        // ----------------------------------
        // Store user data in db
        // ----------------------------------

        let accessToken;
        let refreshToken;
        let user;
        try {
            
            const userToSave = new User({
                name,
                username,
                email,
                password: hashedPassword
            })
            user= await userToSave.save()
            accessToken= JWTService.signAccessToken({_id:user._id},"30m")
            refreshToken= JWTService.signRefreshToken({_id:user._id},"600m")
            




        } catch (error) {
            return next(error)
        }
        //--------------------------
        // Store refresh token in db
        //--------------------------  
        await JWTService.storeRefreshToken(refreshToken,user._id)

        res.cookie("accessToken",accessToken,{
            maxAge:1000*60*60*24, 
            httpOnly:true,
            sameSite:"None",
            secure:true
        })
        res.cookie("refreshToken",refreshToken,{
            maxAge:1000*60*60*24, 
            httpOnly:true, 
            sameSite:"None",
            secure:true
        })

        //----------------
        // response send
        //---------------

        const userToSend= new UserDto(user)
        return res.status(201).json({user:userToSend,auth:true})

},
async login(req,res,next){
    // validate user data
    const userLoginSchema= Joi.object({
        username: Joi.string().min(5).max(30).required(),
        password:Joi.string().pattern(passwordPattern)
    })
    // if validation error return error
    const {error}= userLoginSchema.validate(req.body)
    if(error){
        return next(error)
    }
    //match username and password
    const {username,password}=req.body;
    let user;
    try{
        user= await User.findOne({username});
        //match user
        if (!user){
            const error={
                status:401,
                message:"Invalid username"
            }
            return next(error)
        }
        //match password
        const passwordMatch= await bcrypt.compare(password,user.password)
        if(!passwordMatch){
            const error ={
                status: 401,
                message: "Invalid Password"
            }
            return next(error)
        }

    }
    catch(error){
        return next(error)
    }
    //tokens 
    const accessToken= JWTService.signAccessToken({_id:user._id},"30m");
    const refreshToken= JWTService.signRefreshToken({_id:user._id},"600m");
    // store in db
    try{

       await RefreshToken.updateOne({
            userid:user._id
    },
    {
        token: refreshToken
    },{upsert:true})

    }catch(err){
        return next(err)
    }
    res.cookie("accessToken",accessToken,{
        maxAge:1000*60*60*24,
        httpOnly:true,
        sameSite:"None",
        secure:true
        
    })
    res.cookie("refreshToken", refreshToken,{
        maxAge:1000*60*60*24,
        httpOnly:true,
        sameSite:"None",
        secure:true
    })


    const userToSend= new UserDto(user)
    res.status(200).json({user: userToSend,auth:true})


},
async logout(req,res,next){

    // delete token in db
    const{refreshToken}= req.cookies;
    try{

        await RefreshToken.deleteOne({token:refreshToken})
    }catch(error){
        return next(error)
    }

    res.clearCookie("accessToken") 
    res.clearCookie("refreshToken")


    res.status(200).json({user:null,auth:false})
},

async refresh(req,res,next){
 
    // 1  get refresh token from cookies
    const originalRefreshToken = req.cookies.refreshToken;
    // 2  verify refresh token
    let id;
    try{
       id = JWTService.verifyRefreshToken(originalRefreshToken)._id
    }
    catch(err){
        return next(err)
    }

    try{
        const tokenAvailable= await RefreshToken.findOne({userid:id})
        if(!tokenAvailable){
            const error={
                status: 401,
                message: "Unauthorized user"
            }
            return next(error)
        }


    }
    catch(err){
        return next(err)
    }
    // 3  generate new tokens
    try {
        const accessToken=JWTService.signAccessToken({_id:id},"30m");
        const refreshToken= JWTService.signRefreshToken({_id:id},"8h")

        await RefreshToken.updateOne({userid:id},{token:refreshToken})
        res.cookie("accessToken",accessToken,{
            maxAge:1000*60*60*24,
            httpOnly:true,
            sameSite:"None",
            secure:true
    })
    res.cookie("refreshToken",refreshToken,{
        maxAge:1000*60*60*24,
        httpOnly: true,
        sameSite:"None",
        secure:true
    })


    } catch (error) {
        return next(error)
    }

    let userDTO
    try{

        const user= await User.findOne({_id:id})
         userDTO= new UserDto(user)
    }catch(err){
            return next(err)
    }
    return res.status(200).json({user:userDTO,auth:true})






}



}


module.exports=authController
