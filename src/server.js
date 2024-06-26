const express= require("express");
const dbConnect= require("./database/index.js")
const {PORT}= require('./config/index.js')
const router=require("./routes/index.js")
const errorHandler= require("./middlewares/errorHandler.js")
const cookieParser=require("cookie-parser")
const cors=require("cors");

dbConnect()
const app=express()
app.use(
    cors(
        {
            origin:function(origin,callback){
                return callback(null,true);
            },
            optionsSuccessStatus:200,
            credentials:true
        }
    )
)
// hello this is the text file for the update content of the new data
// so what we are doing 
// is very fun little exercise in vim
// app.use("/storage",express.static("storage"))
app.use(cookieParser())
app.use(express.json({limit:"50mb"}))
app.use(router)
app.use(errorHandler)
app.listen(PORT,console.log(`Server is listening on PORT :${PORT}`));
