const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Yorum ekle
exports.addComment = async (req, res) => {
  const { postId } = req.params;   // artık URL’den alıyoruz
  const { content } = req.body;    // içerik body’den geliyor

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
