"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const profileSchema = new Schema({
    photo: { type: String, required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});
module.exports = mongoose.model("Profile", profileSchema, "profiles");