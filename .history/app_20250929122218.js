const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/posts", require("./src/routes/postRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));


app.get("/", (req, res) => res.send("Tarvina Blog Backend çalışıyor!"));

module.exports = app;
