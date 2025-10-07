import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

dotenv.config();
const router = express.Router();

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Geçersiz admin bilgileri" });
});

// USERS
router.get("/users", verifyAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.put("/users/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // { username, email, role, ... } whitelist if needed
  const updated = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  res.json(updated);
});

router.delete("/users/:id", verifyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Kullanıcı silindi" });
});

// POSTS
router.get("/posts", verifyAdmin, async (req, res) => {
  const posts = await Post.find().populate("author", "username email"); // adjust field name if your model uses 'user'
  res.json(posts);
});

router.post("/posts", verifyAdmin, async (req, res) => {
  try {
    // Accept both JSON and multipart/form-data
    const isMultipart = req.is("multipart/form-data");
    const title = isMultipart ? req.body.title : req.body.title;
    const content = isMultipart ? req.body.content : req.body.content;
    let tags = isMultipart ? req.body.tags : req.body.tags;
    if (typeof tags === "string") tags = tags.split(",").map(t => t.trim()).filter(Boolean);

    const newPost = await Post.create({
      title,
      content,
      tags,
      // image: if you have upload middleware, attach file path here
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: "Post oluşturulamadı", error: err?.message });
  }
});

router.put("/posts/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const isMultipart = req.is("multipart/form-data");
    const updates = {};

    if (typeof req.body.title === "string") updates.title = req.body.title;
    if (typeof req.body.content === "string") updates.content = req.body.content;
    if (typeof req.body.tags === "string") {
      updates.tags = req.body.tags.split(",").map(t => t.trim()).filter(Boolean);
    }
    // if you use file upload middleware, set updates.image from req.file.path

    const updated = await Post.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Post bulunamadı" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Post güncellenemedi", error: err?.message });
  }
});

router.delete("/posts/:id", verifyAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post silindi" });
});

// COMMENTS
router.get("/comments", verifyAdmin, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("post", "title")
      .populate("user", "username email"); // ayrı ayrı populate daha güvenli
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Yorumlar alınamadı", error: err.message });
  }
});

router.delete("/comments/:id", verifyAdmin, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: "Yorum silindi" });
});

export default router;