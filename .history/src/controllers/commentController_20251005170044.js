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
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    // Yorumları çek + yorum sahibinin username’ini populate et
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username")
      .lean();

    // replies içindeki author ObjectId'lerini username ile değiştir
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Promise.all(
          comment.replies.map(async (reply) => {
            const user = await User.findById(reply.author).select("username");
            return {
              _id: reply._id,
              content: reply.content,
              author: user ? user.username : "Deleted User", // güvenli kontrol
              createdAt: reply.createdAt
            };
          })
        );

        return {
          ...comment,
          replies
        };
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
    const comment = await Comment.findById(req.params.id).populate("user"); // user field populate edildi
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });
    if (!req.user) return res.status(401).json({ message: "Token yok veya geçersiz" });

    // comment.user populate edilmedi veya yoksa admin yetkisi veya direkt izin ver
    if (!comment.user || comment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu yorumu silmeye yetkin yok" });
    }

    await comment.remove();
    res.status(200).json({ message: "Yorum silindi", id: req.params.id });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};



// Yoruma Reply ekleme
exports.addReply = async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  try {
    // Comment'i bul ve yorum sahibinin username'ini getir
    const comment = await Comment.findById(commentId).populate("author", "username");
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    // Reply ekle
    comment.replies.push({
      content,
      author: req.user._id,
    });
    await comment.save();

    // replies içindeki author ObjectId'lerini username ile değiştir
    const repliesWithUsername = await Promise.all(
      comment.replies.map(async (reply) => {
        const user = await User.findById(reply.author).select("username");
        return {
          _id: reply._id,
          content: reply.content,
          author: user.username, // sadece username
          createdAt: reply.createdAt
        };
      })
    );

    // Son JSON çıktısı
    res.status(201).json({
      _id: comment._id,
      content: comment.content,
      author: comment.author.username,
      post: comment.post,
      replies: repliesWithUsername,
      createdAt: comment.createdAt
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply silme
exports.deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    // Yorumu bul
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    // Reply'i bul
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply bulunamadı" });

    // Yalnızca reply sahibi veya admin silebilir
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    // Reply'i array'den kaldır
    reply.deleteOne();
    await comment.save();

    res.json({ message: "Reply silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


