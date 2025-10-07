const express = require("express");
const { addComment, getComments,deleteComment,addReply,deleteReply } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Yorum ekleme: token gerekli
router.post("/:postId", protect, addComment);

// Post’a ait yorumları listeleme: token gerekli değil
router.get("/:postId", getComments);

// DELETE /api/comments/:id → token gerekli
router.delete("/:id", protect, deleteComment);

// POST /api/comments/reply/:commentId → token gerekli
router.post("/reply/:commentId", protect, addReply);

// DELETE /api/comments/reply/:commentId/:id → token gerekli
router.delete("/:commentId/replies/:replyId", protect, deleteReply);


module.exports = router;
