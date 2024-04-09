class BlogDto{
    constructor(blog){
           
            this._id = blog._id;
            this.title = blog.title;
            this.createdAt = blog.createdAt;
            this.photo=blog.photoPath;
            this.authorUsername = blog.author.username;
            this.authorProfilePhoto = blog.author.profilePhoto;
        }



}


module.exports= BlogDto