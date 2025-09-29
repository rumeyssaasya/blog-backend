const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  like
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, createPost);
router.route("/").get(getPosts);
router.route("/:id").get(getPostById);
router.route("/:id").put(protect, updatePost).delete(protect, deletePost);
router.put("/:postId/like", protect, like);

module.exports = router;
