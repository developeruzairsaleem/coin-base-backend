"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require('mongoose');
const { MONGODB_CONNECTION_STRING } = require("../config/index.js");
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose.set("strictQuery", false);
        const conn = yield mongoose.connect(MONGODB_CONNECTION_STRING);
        console.log(`Database connected to host : ${conn.connection.host}`);
    }
    catch (error) {
        console.log(`Error on ${error}`);
    }
});
module.exports = dbConnect;
