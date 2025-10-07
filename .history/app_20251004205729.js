const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
const corsOptions = {
  origin: [ "http://localhost:3000"], // izin verdiğimiz frontendler
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization"],
  Credential
};

app.use(cors(corsOptions));

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/posts", require("./src/routes/postRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));


app.get("/", (req, res) => res.send("Tarvina Blog Backend çalışıyor!"));

module.exports = app;
