const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const post = await Post.create({
      title,
      content,
      tags,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Post Oluşturulamadı. Hata: " + err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Postlar getirilemedi. Hata: " + err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Bu Post bulunamadı" });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.tags = req.body.tags || post.tags;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
      res.status(500).json({ message: "Post Güncellenemedi. Hata: " + err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: " Bu Post bulunamadı" });
    }
    const deletedPost = await post.deleteOne();
    res.json({message: "Post başarıyla silindi", post: post });
  } catch (err) {
      res.status(500).json({ message: "Post Silinemedi. Hata: " + err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "username email");
    if (!post) {
      return res.status(404).json({ message: "Bu Post bulunamadı" });
    }
    res.json(post);
  } catch (err) {
      res.status(500).json({ message: req.params.id +"li post bulunamadı. Hata: " + err.message });
  }
};

