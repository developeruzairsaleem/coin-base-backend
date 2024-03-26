"use strict";
const dotenv = require("dotenv").config();
const envObj = {
    PORT: process.env.PORT,
    MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    BACKEND_SERVER_PATH: process.env.BACKEND_SERVER_PATH,
    API_SECRET: process.env.API_SECRET,
    API_KEY: process.env.API_KEY,
    CLOUD_NAME: process.env.CLOUD_NAME,
};
module.exports = envObj;
