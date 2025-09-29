const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Yorum ekle
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;    

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post bulunamadı" });

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: postId,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Post’a ait tüm yorumları getir
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username email");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yorum silme
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    // Yalnızca yorum sahibi veya admin silebilir
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    await comment.remove();
    res.json({ message: "Yorum silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yoruma Reply ekleme
exports.addReply = async (req, res) => {
  const { content } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    comment.replies.push({
      content,
      author: req.user._id,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
