const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basit test endpoint
app.get("/", (req, res) => {
  res.send("Tarvina Blog Backend API çalışıyor 🚀");
});

// Buraya ileride routes eklenecek
// app.use("/api/users", require("./src/routes/userRoutes"));

module.exports = app;
