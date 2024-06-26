"use strict";
const { ValidationError } = require("joi");
const errorHandler = (err, req, res, next) => {
    // default error
    let status = 500;
    let data = {
        message: "Internal Server Error"
    };
    if (err instanceof ValidationError) {
        status = 401;
        data.message = err.message;
        return res.status(status).json(data);
    }
    if (err.status) {
        status = err.status;
    }
    if (err.message) {
        data.message = err.message;
    }
    console.log("status:", status, "data", data);
    return res.status(status).json(data);
};
module.exports = errorHandler;
