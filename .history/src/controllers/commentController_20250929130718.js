const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

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
      replies: [] // Başlangıçta boş
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
      .populate("author", "username")
      .lean();

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Promise.all(
          comment.replies.map(async (reply) => {
            const user = await User.findById(reply.author).select("username");
            return {
              _id: reply._id,
              content: reply.content,
              author: user.username,
              createdAt: reply.createdAt
            };
          })
        );
        return { ...comment, replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yorum silme
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    await comment.remove();
    res.json({ message: "Yorum silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yoruma Reply ekleme (sadece comment altına)
exports.addReply = async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    comment.replies.push({
      content,
      author: req.user._id
    });

    await comment.save();

    // replies içindeki author’ları username ile dön
    const repliesWithUsername = await Promise.all(
      comment.replies.map(async (reply) => {
        const user = await User.findById(reply.author).select("username");
        return {
          _id: reply._id,
          content: reply.content,
          author: user.username,
          createdAt: reply.createdAt
        };
      })
    );

    res.status(201).json({
      _id: comment._id,
      content: comment.content,
      author: (await User.findById(comment.author)).username,
      post: comment.post,
      replies: repliesWithUsername,
      createdAt: comment.createdAt
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
