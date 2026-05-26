// routes/sites.js
import express from "express";
import Site from "../models/Site.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { domain, displayName, region, status, banner } = req.body;

    if (!domain || !displayName) {
      return res.status(400).json({ message: "Domain and display name are required" });
    }

    const site = await Site.create({
      userId: req.user.userId,
      domain,
      displayName,
      region: region || "Global",
      status: status || "Healthy",
      banner: banner || "Draft",
    });

    return res.status(201).json(site);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sites = await Site.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json(sites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
