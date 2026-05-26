import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import siteRoutes from "./routes/sites.js";
import scanRoutes from "./routes/scan.js";
import cookieRoutes from "./routes/cookies.js";
import consentRoutes from "./routes/consent.js";
import authMiddleware from "./middleware/authMiddleware.js";
import bannerRoutes from "./routes/banner.js";
import embedRoutes from "./routes/embed.js";



dotenv.config();
await connectDB();

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/cookies", cookieRoutes);
app.use("/api/consent",  consentRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/embed", embedRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});