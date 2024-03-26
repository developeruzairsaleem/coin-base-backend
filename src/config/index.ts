const dotenv=require("dotenv").config()
const PORT:number = process.env.PORT;
const MONGODB_CONNECTION_STRING:string=process.env.MONGODB_CONNECTION_STRING;
const ACCESS_TOKEN_SECRET:string= process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET:string= process.env.REFRESH_TOKEN_SECRET;
const BACKEND_SERVER_PATH:number=process.env.BACKEND_SERVER_PATH;
const API_SECRET = process.env.API_SECRET
const API_KEY = process.env.API_KEY
const CLOUD_NAME = process.env.CLOUD_NAME
module.exports={
    PORT,
    MONGODB_CONNECTION_STRING,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    BACKEND_SERVER_PATH,API_KEY,API_SECRET,CLOUD_NAME
}
