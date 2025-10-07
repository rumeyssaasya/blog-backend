const Post = require("../models/Post");

// Controller
exports.createPost = async (req, res) => {
  try {
    // JSON veya form-data fark etmez
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title ve content zorunludur." });
    }
    const tagsArray = Array.isArray(tags)
      ? tags.map(tag => tag.trim())
      : typeof tags === "string"
        ? tags.split(",").map(tag => tag.trim())
        : [];

    const newPost = new Post({
      title,
      content,
      tags: tags ? tagsArray : [],
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
    const posts = await Post.find()
      .populate("author", "username email"); // yazar bilgisi

    const userId = req.user ? req.user._id : null;

    const postsWithLikes = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      tags: post.tags || [] ,
      image: post.image,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likesCount: post.likes.length,
      likedByUser: userId ? post.likes.includes(userId) : false
    }));

    res.json(postsWithLikes);
  } catch (err) {
    res.status(500).json({ message: "Postlar getirilemedi. Hata: " + err.message });
  }
};

// Kullanıcıya ait postları getir
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId; // :userId route param
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (content) updateFields.content = content;

    // Eğer tags varsa, hem string hem array senaryosunu ele al
    if (tags) {
      if (Array.isArray(tags)) {
        updateFields.tags = tags.map(tag => tag.trim());
      } else if (typeof tags === "string") {
        updateFields.tags = tags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
    }

    if (req.file) {
      updateFields.image = req.file.path;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });

    if (!updatedPost) return res.status(404).json({ message: "Post bulunamadı" });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Post update error:", err);
    res.status(500).json({ message: "Post güncellenemedi", error: err.message });
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

