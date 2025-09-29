const Post = require("../models/Post");

// Controller
exports.createPost = async (req, res) => {
  try {
    // JSON veya form-data fark etmez
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title ve content zorunludur." });
    }

    const newPost = new Post({
      title,
      content,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      author: req.user._id,
      image: req.file ? req.file.path : "", // Eğer form-data ile resim geldiyse
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Post oluşturulamadı: " + err.message });
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
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu postu güncelleyemezsiniz. Post size ait değil." });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.tags = req.body.tags ? post.tags.split(",") : post.tags;
    post.image = req.file ? req.file.path : post.image;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Post Güncellenemedi. Hata: " + err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: " Bu Post bulunamadı" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu postu silemezsiniz. Post size ait değil." });
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

// Post beğenme / beğeniyi kaldırma
exports.like = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post bulunamadı" });

    const userId = req.user._id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId); // beğen
    } else {
      post.likes.splice(index, 1); // beğeniyi kaldır
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      likedByUser: post.likes.includes(userId)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Tüm beğenileri getir
exports.getLikes = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate("likes", "username");
    if (!post) return res.status(404).json({ message: "Post bulunamadı" });

    res.json({
      likesCount: post.likes.length,
      likedByUsers: post.likes.map(user => user.username)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /api/posts/search → Arama ve filtreleme
exports.searchPosts = async (req, res) => {
  try {
    const { q, authorId, tag, startDate, endDate, sort, page, limit } = req.query;

    let filter = {};

    // Başlığa veya içeriğe göre arama
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ];
    }

    // Yazar filtresi
    if (authorId) filter.author = authorId;

    // Etiket filtresi
    if (tag) filter.tags = tag;

    // Tarih filtresi
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Sıralama
    let sortOption = { createdAt: -1 }; // default: en yeni
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { likes: -1 };
    if (sort === "unpopular") sortOption = { likes: 1 };

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find(filter)
      .select("title content tags author likes createdAt") // sadece gerekli alanlar
      .populate("author", "username") // sadece username
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(); // lean() → hafızayı verimli kullanır

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

