const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost, 
    like, 
    getLikes, 
    searchPosts, 
    getPostsByUser
} = require("../controllers/postController");
const uploadPost = require("../middleware/uploadPostMiddleware");

router.post("/create-post", protect, (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes("multipart/form-data")) {
    return uploadPost.single("image")(req, res, next);
  }
  next();
}, createPost);


router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, (req, res, next) => {

  if (req.is("multipart/form-data")) {
    return uploadPost.single("image")(req, res, next);
  }

  next();
}, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:postId/like", protect, like);
router.get("/:postId/likes", getLikes);
router.get("/user/:userId", getPostsByUser);

module.exports = router;
