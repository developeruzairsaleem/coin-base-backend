const express= require("express");
const router = express.Router()
const authController=require("../controllers/authController.js")
const blogController=require("../controllers/blogController.js")
const commentController=require("../controllers/commentController.js")
const auth= require("../middlewares/auth.js")
router.get("/test",(req,res)=>res.json("Working"))

//register
router.post("/register", authController.register)
//login
router.post("/login", authController.login)
//logout
router.post("/logout",auth,authController.logout)
//refresh
router.get("/refresh",authController.refresh)
//create
router.post("/blog",auth,blogController.create)
//getAll
router.get("/blog/all",auth,blogController.getAll)
//get blog by id
router.get("/blog/:id",auth,blogController.getById)
// delete blog by id
router.delete("/blog/:id",auth,blogController.delete)
//update blog
router.put("/blog/:id",auth,blogController.update)

// create comment
router.post("/comment",auth,commentController.create)
// get comments by id
router.get("/comment/:id",auth,commentController.getById)


module.exports=router;

 