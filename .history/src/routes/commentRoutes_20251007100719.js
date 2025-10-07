const express = require("express");
const { addComment, getComments,deleteComment,addReply,deleteReply } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/:postId", protect, addComment);

router.get("/:postId", getComments);


router.delete("/:id", protect, deleteComment);


router.post("/reply/:commentId", protect, addReply);

router.delete("/:commentId/replies/:replyId", protect, deleteReply);


module.exports = router;
