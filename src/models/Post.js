const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [String],
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// Text indeks: başlık ve içerik araması için
postSchema.index({ title: "text", content: "text" });

// Filtreleme ve sıralama indeksleri
postSchema.index({ author: 1, createdAt: -1 }); // yazar ve tarih
postSchema.index({ tags: 1 }); // etiket

module.exports = mongoose.model("Post", postSchema);

