const User = require("../models/User");
const fs = require("fs");
const path = require("path");

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

    // Eğer avatar dosyası yüklenmişse
    if (req.file) {
      updateData.avatar = req.file.path;
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
    await User.remove();
    res.json({ message: "Kullanıcı silindi" });

    }catch (err) {
    res.status(500).json({ message: err.message });
  }
};