// server.js
import express, { json } from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";

config();
await connectDB();

const app = express();
app.use(json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Server running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));