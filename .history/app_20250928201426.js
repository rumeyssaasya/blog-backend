const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

// Test endpoint
app.get("/", (req, res) => {
  res.send("Tarvina Blog Backend API çalışıyor");
});

module.exports = app;
