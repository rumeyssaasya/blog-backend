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
      .populate("replies.author", "username")
      .lean();

    // replies içindeki author bilgisi zaten populate ile geldi, sadece username alıyoruz
    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: comment.replies.map(reply => ({
        _id: reply._id,
        content: reply.content,
        author: reply.author ? reply.author.username : "Deleted User",
        createdAt: reply.createdAt
      }))
    }));

    res.json(commentsWithReplies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Yorum silme
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });
    if (!req.user) return res.status(401).json({ message: "Token yok veya geçersiz" });

    // comment.user yerine comment.author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu yorumu silmeye yetkin yok" });
    }

    await comment.deleteOne();
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
          author: user.username, 
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
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });
    if (!req.user) return res.status(401).json({ message: "Token yok veya geçersiz" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Yanıt bulunamadı" });

    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu yanıtı silmeye yetkin yok" });
    }

    reply.deleteOne();
    await comment.save();

    res.status(200).json({ message: "Yanıt silindi", replyId });
  } catch (err) {
    console.error("DELETE REPLY ERROR:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};



