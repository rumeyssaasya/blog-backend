import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js"; // .js uzantısı önemli

dotenv.config();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB bağlantısı
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB bağlantısı başarılı");
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
    });
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err.message);
  });
