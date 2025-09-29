const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
     
      /*Token → decoded.id
      DB’den bul → req.user = User
      Controller → req.user.id*/ 

      if (!req.user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token" });
    }
  } else {
    return res.status(401).json({ message: "Token bulunamadı" });
  }
};
