"use strict";
class BlogDetailDto {
    constructor(blog) {
        this._id = blog._id;
        this.createdAt = blog.createdAt;
        this.title = blog.title;
        this.category = blog.category;
        this.content = blog.content;
        this.authorName = blog.author.name;
        this.authorUsername = blog.author.username;
        this.photo = blog.photoPath;
    }
}
module.exports = BlogDetailDto;
