const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");


// Recursive helper: hedef ID'yi bul ve reply ekle
function addReplyRecursive(repliesArray, targetId, newReply) {
  for (let reply of repliesArray) {
    if (reply._id.toString() === targetId) {
      reply.replies.push(newReply);
      return true;
    }
    if (reply.replies.length > 0) {
      const added = addReplyRecursive(reply.replies, targetId, newReply);
      if (added) return true;
    }
  }
  return false;
}

// Recursive helper: replies içindeki author ObjectId'leri username ile değiştir
async function populateRepliesUsernames(repliesArray) {
  return Promise.all(
    repliesArray.map(async (reply) => {
      const user = await User.findById(reply.author).select("username");
      const nestedReplies = await populateRepliesUsernames(reply.replies);
      return {
        _id: reply._id,
        content: reply.content,
        author: user.username,
        createdAt: reply.createdAt,
        replies: nestedReplies
      };
    })
  );
}

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
    // Comment'leri çek ve yorum sahibinin username'ini populate et
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username")
      .lean(); // plain JS objesi

    // replies içindeki author ObjectId'leri username ile değiştir
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Promise.all(
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
  const { content, targetId } = req.body; // targetId: reply eklemek istediğin yorum/reply
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    const newReply = { content, author: req.user._id, replies: [] };

    if (targetId) {
      // Alt reply ekleme
      const added = addReplyRecursive(comment.replies, targetId, newReply);
      if (!added) return res.status(404).json({ message: "Hedef reply bulunamadı" });
    } else {
      // Direkt yorum altına ekleme
      comment.replies.push(newReply);
    }

    await comment.save();

    // username’leri populate et
    const repliesWithUsername = await populateRepliesUsernames(comment.replies);

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

