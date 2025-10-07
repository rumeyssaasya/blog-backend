import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing admin token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.role !== "admin") {
      return res.status(403).json({ message: "Admin yetkisi yok" });
    }

    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token" });
  }
};