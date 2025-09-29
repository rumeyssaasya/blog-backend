const express = require("express");
const router = express.Router();
const { uploadPost } = require("../controllers/postController");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  like,
  getLikes,
  searchPosts,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, createPost);
router.post("/", protect, (req, res, next) => {
  // Eğer content-type multipart/form-data ise multer çalıştır
  if (req.is("multipart/form-data")) {
    return uploadPost.single("image")(req, res, next);
  }
  next();
}, createPost);

router.post("/", protect, uploadPost.single("image"), createPost);
router.route("/").get(getPosts);
router.get("/search", searchPosts);

router.route("/:id").get(getPostById);
router.route("/:id").put(protect, updatePost).delete(protect, deletePost);
router.put("/:postId/like", protect, like);
router.get("/:postId/likes", getLikes);


module.exports = router;
