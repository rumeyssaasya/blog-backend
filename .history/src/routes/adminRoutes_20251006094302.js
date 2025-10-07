import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ENV’den alınan admin bilgileri
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({ message: "Admin login successful", token });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
});

export default router;
