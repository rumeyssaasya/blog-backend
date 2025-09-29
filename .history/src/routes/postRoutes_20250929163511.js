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
    uploadPost 
} = require("../controllers/postController");

// Tek post route: JSON veya form-data
router.post("/", protect, (req, res, next) => {
  if (req.is("multipart/form-data")) {
    return uploadPost.single("image")(req, res, next); // form-data ise multer çalıştır
  }
  next(); // JSON ise direkt controller
}, createPost);

// Diğer route’lar
router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:postId/like", protect, like);
router.get("/:postId/likes", getLikes);

module.exports = router;
