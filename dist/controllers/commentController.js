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
const Comment = require("../models/comment.js");
const commentsDTO = require("../dto/comment.js");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const commentController = {
    getById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const getByIdSchema = Joi.object({
                id: Joi.string().regex(mongodbIdPattern).required()
            });
            const { error } = getByIdSchema.validate(req.params);
            if (error) {
                return next(error);
            }
            const { id } = req.params;
            let comments;
            try {
                comments = yield Comment.find({ blog: id }).populate("author");
            }
            catch (error) {
                return next(error);
            }
            let commentDTO = [];
            for (let i = 0; i < comments.length; i++) {
                const obj = new commentsDTO(comments[i]);
                commentDTO.push(obj);
            }
            res.status(200).json({ data: commentDTO });
        });
    },
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const createCommentSchema = Joi.object({
                content: Joi.string().required(),
                author: Joi.string().regex(mongodbIdPattern).required(),
                blog: Joi.string().regex(mongodbIdPattern).required()
            });
            const { error } = createCommentSchema.validate(req.body);
            if (error) {
                return next(error);
            }
            const { content, author, blog } = req.body;
            try {
                const newComment = new Comment({
                    content, author, blog
                });
                yield newComment.save();
            }
            catch (error) {
                return next(error);
            }
            return res.status(201).json({ message: "Comment Created successfully" });
        });
    }
};
module.exports = commentController;
