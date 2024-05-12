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
const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog.js");
const Comment = require("../models/comment.js");
const BlogDto = require("../dto/blog.js");
const BlogDetailsDto = require("../dto/blog-detail.js");
const { BACKEND_SERVER_PATH, CLOUD_NAME, API_KEY, API_SECRET } = require("../config/index.js");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const blogController = {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1 validate req body
            // 2 handle photo storage, naming
            // 3 Add to db
            // 4 send a response back
            //client side -> base64 encoded string -> decode -> store-> add path to db
            const createBlogSchema = Joi.object({
                title: Joi.string().required(),
                content: Joi.string().required(),
                category: Joi.string().required(),
                author: Joi.string().regex(mongodbIdPattern).required(),
                photo: Joi.string().required()
            });
            console.log(req.body, "request body");
            const { error } = createBlogSchema.validate(req.body);
            if (error) {
                console.log(error, "validation error");
                return next();
            }
            const { title, author, content, photo, category } = req.body;
            // read photo as a buffer
            // const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,""),"base64");
            // allot a random number
            // const imagePath=`${Date.now()}-${author}.png`
            //save locally
            let response;
            try {
                response = yield cloudinary.uploader.upload(photo);
                // fs.writeFileSync(`storage/${imagePath}`,buffer)
                console.log("photo uploaded");
            }
            catch (error) {
                return next(error);
            }
            //save photopath in db
            let newBlog;
            try {
                newBlog = new Blog({
                    author,
                    category,
                    content,
                    title,
                    photoPath: response.url
                });
                console.log("saving to db");
                yield newBlog.save();
                console.log("saved to db");
            }
            catch (error) {
                console.log("error saving to db");
                return next(error);
            }
            const myBlogDto = new BlogDto(newBlog);
            console.log("Saved and will return to client");
            res.status(201).json({ blog: myBlogDto });
        });
    },
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const getByIdSchema = Joi.object({
                id: Joi.string().regex(mongodbIdPattern).required()
            });
            const { error } = getByIdSchema.validate(req.params);
            if (error) {
                return next(error);
            }
            let { id } = req.params;
            let blog;
            try {
                blog = yield Blog.findOne({ _id: id }).populate("author");
            }
            catch (error) {
                return next(error);
            }
            const blogDTO = new BlogDetailsDto(blog);
            return res.status(200).json({ blog: blogDTO });
        });
    },
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blogs = yield Blog.find({}).populate("author");
                const blogAll = [];
                for (let i = 0; i < blogs.length; i++) {
                    const blogDto = new BlogDto(blogs[i]);
                    blogAll.push(blogDto);
                }
                res.status(200).json({ blogs: blogAll });
            }
            catch (error) {
                return next(error);
            }
        });
    },
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // validate id
            // delete blog
            // delete comments on the blog
            const deleteBlogSchema = Joi.object({
                id: Joi.string().regex(mongodbIdPattern).required(),
            });
            const { error } = deleteBlogSchema.validate(req.params);
            if (error) {
                return next(error);
            }
            const { id } = req.params;
            try {
                yield Blog.deleteOne({ _id: id });
                yield Comment.deleteMany({ blog: id });
            }
            catch (error) {
                return next(error);
            }
            return res.status(200).json({ "message": "Deleted successfully" });
        });
    },
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateBlogSchema = Joi.object({
                title: Joi.string().required(),
                content: Joi.string().required(),
                author: Joi.string().regex(mongodbIdPattern).required(),
                blogId: Joi.string().regex(mongodbIdPattern).required(),
                photo: Joi.string()
            });
            const { error } = updateBlogSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const { title, content, author, blogId, photo } = req.body;
            let blog;
            try {
                blog = yield Blog.findOne({ _id: blogId });
            }
            catch (error) {
                return next();
            }
            //     delete previous photo
            //     save new photo
            if (photo) {
                // let previousPhoto= blog.photoPath;
                // previousPhoto= previousPhoto.split("/").at(-1);
                // //delete photo
                // fs.unlinkSync(`storage/${previousPhoto}`)
                // read photo as a buffer
                // const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,""),"base64");
                // allot a random number
                // const imagePath=`${Date.now()}-${author}.png`
                //save locally
                let response;
                try {
                    response = yield cloudinary.uploader.upload(photo);
                    // fs.writeFileSync(`storage/${imagePath}`,buffer)
                }
                catch (error) {
                    return next(error);
                }
                try {
                    yield Blog.updateOne({ _id: blogId }, { title, content, photoPath: response.url });
                }
                catch (err) {
                    console.log(err);
                    return next(err);
                }
            }
            else {
                try {
                    yield Blog.updateOne({ _id: blogId }, { title, content });
                }
                catch (err) {
                    console.log(err);
                    return next(err);
                }
            }
            res.status(200).json({ message: "Updated Successfully" });
        });
    }
};
module.exports = blogController;
