const User = require("../models/User");
const multer = require("multer");
const fs = require("fs");

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


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0) 
      return res.status(404).json({ message: "Hiç kullanıcı bulunamadı" });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Arama query'si gerekli" });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    })
    .select("username email profilePic")
    .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.updateUserProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    const { username, email, bio } = req.body;
    const updateData = { username, email, bio };

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

exports.deleteUserProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    if (user.profilePic && fs.existsSync(user.profilePic)) {
      fs.unlinkSync(user.profilePic);
    }

    await user.deleteOne();
    res.json({ message: "Kullanıcı silindi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadAvatar = upload.single("profilePic");
