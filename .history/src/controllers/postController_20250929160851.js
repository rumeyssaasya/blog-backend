const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const newPost = new Post({
      title,
      content,
      tags: tags ? tags.split(",") : [],
      author: req.user._id,
      image: req.file ? req.file.path : ""
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message:"Post oluşturulamadı"+ err.message });
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
    const { q, authorId, tag, startDate, endDate, sort } = req.query;

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
    let sortOption = { createdAt: -1 }; 
    if (sort === "oldest") sortOption = { createdAt: 1 }; //  en yeni
    if (sort === "popular") sortOption = { likes: -1 }; // en çok beğeni
    if (req.query.sort === "unpopular") sortOption = { likes: 1 }; // en az popüler (az like)

    const posts = await Post.find(filter)
      .populate("author", "username")
      .sort(sortOption);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
