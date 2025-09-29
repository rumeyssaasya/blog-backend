const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Token oluşturucu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Kullanıcı kaydı
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Kayıt sırasında hata: " + err.message });
  }
};

// Kullanıcı girişi
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Geçersiz email veya şifre" });
    }
  } catch (err) {
    res.status(500).json({ message: "Giriş sırasında hata: " + err.message });
  }
};
// Mevcut kullanıcı bilgilerini getir