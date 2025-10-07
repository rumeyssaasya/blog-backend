import express from "express";
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./src/routes/authRoutes.js"
import adminRoutes from "./src/routes/adminRoutes.js";
import postRoutes from "./src/routes/postRoutes.js"
import commentRoutes from "./src/routes/commentRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
const corsOptions = {
  origin: [ "http://localhost:3000"], // izin verdiğimiz frontendler
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users",userRoutes);
app.use("/api/admin", adminRoutes);



app.get("/", (req, res) => res.send("Tarvina Blog Backend çalışıyor!"));

export default app();
