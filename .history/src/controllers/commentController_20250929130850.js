const Comment = require("../models/Comment");
const User = require("../models/User");

// Recursive: nested reply ekle
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

// Recursive: replies içindeki author ObjectId'leri username ile değiştir
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

// Reply ekleme (nested support)
exports.addReply = async (req, res) => {
  const { content, targetId } = req.body; // targetId varsa o reply altına, yoksa direkt comment altına
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    const newReply = { content, author: req.user._id, replies: [] };

    if (targetId) {
      const added = addReplyRecursive(comment.replies, targetId, newReply);
      if (!added) return res.status(404).json({ message: "Hedef reply bulunamadı" });
    } else {
      comment.replies.push(newReply);
    }

    await comment.save();

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
