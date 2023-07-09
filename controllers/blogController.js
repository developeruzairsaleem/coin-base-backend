 const Joi= require("joi");
 const fs= require("fs");
 const Blog= require("../models/blog.js")
 const Comment= require("../models/comment.js")
 const BlogDto= require("../dto/blog.js")
 const BlogDetailsDto=require("../dto/blog-detail.js")
 const {BACKEND_SERVER_PATH,CLOUD_NAME,API_KEY,API_SECRET}= require("../config/index.js")
 const cloudinary= require("cloudinary").v2
 cloudinary.config({ 
    cloud_name: CLOUD_NAME, 
    api_key: API_KEY, 
    api_secret: API_SECRET 
  });


 const mongodbIdPattern= /^[0-9a-fA-F]{24}$/
 const blogController={
async create(req,res,next){
// 1 validate req body
// 2 handle photo storage, naming
// 3 Add to db
// 4 send a response back


//client side -> base64 encoded string -> decode -> store-> add path to db
const createBlogSchema= Joi.object({
    title:Joi.string().required(),
    content:Joi.string().required(),
    author: Joi.string().regex(mongodbIdPattern).required(),
    photo: Joi.string().required()
})
const {error}= createBlogSchema.validate(req.body)
if(error){
    return next()
}
const {title,author,content,photo}=req.body

// read photo as a buffer
// const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,""),"base64");

// allot a random number
// const imagePath=`${Date.now()}-${author}.png`

//save locally
let response;
try{
response = await cloudinary.uploader.upload(photo)
    // fs.writeFileSync(`storage/${imagePath}`,buffer)

}catch(error){
    return next(error)
}


//save photopath in db

let newBlog;
try {

    newBlog= new Blog({
    author,
    content,
    title,
    photoPath:response.url
   })

 await newBlog.save()



} catch (error) {
    return next(error)
}

const myBlogDto= new BlogDto(newBlog)
res.status(201).json({blog:myBlogDto})


},
async getById(req,res,next){
const getByIdSchema = Joi.object({   
    id: Joi.string().regex(mongodbIdPattern).required()
})

const {error}= getByIdSchema.validate(req.params)

if (error){
    return next(error)
}

let {id}=req.params;
let blog;
try{

    blog= await Blog.findOne({_id:id}).populate("author");

}
catch(error){
    return next(error)
}

const blogDTO= new BlogDetailsDto( blog )
return res.status(200).json({blog:blogDTO})






},
async getAll(req,res,next){
try {
    const blogs = await Blog.find({});
    const blogAll= [];
    for(let i=0; i<blogs.length;i++){
    const blogDto= new BlogDto(blogs[i])
    blogAll.push(blogDto)
    }
res.status(200).json({blogs:blogAll})

} catch (error) {
    return next(error)
}



},
async delete(req,res,next){
    
    // validate id
    // delete blog
    // delete comments on the blog
    const deleteBlogSchema=Joi.object({
        id:Joi.string().regex(mongodbIdPattern).required(),


    })
const {error}= deleteBlogSchema.validate(req.params)
if(error){
    return next(error)
}

const {id}= req.params
try{

    await Blog.deleteOne({_id:id})
    
    await Comment.deleteMany({blog:id})


}
catch(error){
    return next(error)
}


return res.status(200).json({"message":"Deleted successfully"})






























},
async update(req,res,next){

    const updateBlogSchema= Joi.object({
        title:Joi.string().required(),
        content:Joi.string().required(),
        author:Joi.string().regex(mongodbIdPattern).required(),
        blogId:Joi.string().regex(mongodbIdPattern).required(),
        photo:Joi.string()
    })

    const {error}=updateBlogSchema.validate(req.body);
    
    if(error){
        return next(error)
    }
    const {title, content, author, blogId, photo}=req.body;
    
    


let blog;
try{
    blog= await Blog.findOne({_id:blogId})
}
catch(error){
return next()
}

//     delete previous photo
//     save new photo
if(photo){
    // let previousPhoto= blog.photoPath;
    // previousPhoto= previousPhoto.split("/").at(-1);
    //delete photo
    // fs.unlinkSync(`storage/${previousPhoto}`)
    

    
// read photo as a buffer
// const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,""),"base64");

// allot a random number
// const imagePath=`${Date.now()}-${author}.png`

//save locally
let response;
try{
response= await cloudinary.uploader.upload(photo)
    // fs.writeFileSync(`storage/${imagePath}`,buffer)

}catch(error){
    return next(error)
}

await Blog.updateOne({_id:blogId},{title,content,photoPath:response.url}    )



}
else{
    await Blog.updateOne({_id:blogId},{title,content})
}

res.status(200).json({message:"Updated Successfully"})



}



}


module.exports=blogController