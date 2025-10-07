import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

dotenv.config();
const router = express.Router();

// 🔹 ADMIN LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // Basit kontrol, gerçek projede bcrypt kullan
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Geçersiz admin bilgileri" });
  }
});

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

// 🔹 Tüm yorumlar
router.get("/comments", verifyAdmin, async (req, res) => {
  const comments = await Comment.find().populate("post user", "title username");
  res.json(comments);
});

// 🔹 Yorum sil
router.delete("/comments/:id", verifyAdmin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Yorum silindi" });
});

export default router;
