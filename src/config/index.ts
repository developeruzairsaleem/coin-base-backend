const dotenv=require("dotenv").config()

interface envInterface{
    PORT:string|undefined;
    MONGODB_CONNECTION_STRING:string|undefined;
    ACCESS_TOKEN_SECRET:string|undefined;
    REFRESH_TOKEN_SECRET:string|undefined;
    BACKEND_SERVER_PATH:string|undefined;
    API_SECRET:string|undefined;
    API_KEY:string|undefined;
    CLOUD_NAME:string|undefined;
}


const envObj: envInterface = {
 PORT: process.env.PORT,
 MONGODB_CONNECTION_STRING:process.env.MONGODB_CONNECTION_STRING,
 ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET,
 REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET,
 BACKEND_SERVER_PATH:process.env.BACKEND_SERVER_PATH,
 API_SECRET :process.env.API_SECRET,
 API_KEY : process.env.API_KEY,
 CLOUD_NAME: process.env.CLOUD_NAME,
}

module.exports=envObj;