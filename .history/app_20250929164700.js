const express = require("express");
const cors = require("cors");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:3000", "https://myfrontend.com"], // izin verdiğin frontendler
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/posts", require("./src/routes/postRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));


app.get("/", (req, res) => res.send("Tarvina Blog Backend çalışıyor!"));

module.exports = app;
