const User = require("../models/User");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, req.user._id + "." + ext);
  }
});
const upload = multer({ storage });

// GET /api/users/:id → Profil görüntüle
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id → Profil güncelle
exports.updateUserProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    const { username, email, bio } = req.body;
    const updateData = { username, email, bio };

    // Avatar dosyası yüklendiyse
    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id → Profil sil
exports.deleteUserProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    // Avatar dosyası varsa sil
    if (user.avatar && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }

    await user.deleteOne();
    res.json({ message: "Kullanıcı silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Multer upload middleware export
exports.uploadAvatar = upload.single("avatar");
