import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

// 🔹 Tüm kullanıcılar
router.get("/users", verifyAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🔹 Kullanıcı sil
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Kullanıcı silindi" });
});

// 🔹 Tüm postlar
router.get("/posts", verifyAdmin, async (req, res) => {
  const posts = await Post.find().populate("user", "username email");
  res.json(posts);
});

// 🔹 Post sil
router.delete("/posts/:id", verifyAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post silindi" });
});

// 🔹 Yorumları getir
router.get("/comments", verifyAdmin, async (req, res) => {
  const comments = await Comment.find().populate("post user", "title username");
  res.json(comments);
});

// 🔹 Yorum sil
router.delete("/comments/:id", verifyAdmin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Yorum silindi" });
});
