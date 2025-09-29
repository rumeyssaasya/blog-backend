const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config();

// ENV değişkenleri
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB bağlantısı
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
  });
