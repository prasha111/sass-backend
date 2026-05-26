import express from "express";
import Cookie from "../models/Cookie.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// EXPORT CSV - keep this BEFORE /:siteId
router.get("/:siteId/export", authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    const cookies = await Cookie.find({ siteId }).sort({ name: 1 });

    if (!cookies.length) {
      return res.status(404).json({ message: "No cookies found for this site" });
    }

    const headers = ["Name", "Domain", "Category", "Path", "Expires"];
    const rows = cookies.map((cookie) => [
      `"${cookie.name || ""}"`,
      `"${cookie.domain || ""}"`,
      `"${cookie.category || "unknown"}"`,
      `"${cookie.path || "/"}"`,
      `"${cookie.expires ? new Date(cookie.expires).toISOString() : ""}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cookies_${siteId}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to export cookies",
    });
  }
});

// GET cookies by site
router.get("/:siteId", authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    const cookies = await Cookie.find({ siteId }).sort({ createdAt: -1 });

    return res.status(200).json(cookies);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch cookies",
    });
  }
});

// UPDATE cookie category
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    const allowedCategories = [
      "necessary",
      "preferences",
      "functional",
      "analytics",
      "marketing",
      "unknown",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const updatedCookie = await Cookie.findByIdAndUpdate(
      id,
      { category },
      { new: true, runValidators: true }
    );

    if (!updatedCookie) {
      return res.status(404).json({ message: "Cookie not found" });
    }

    return res.status(200).json(updatedCookie);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update cookie",
    });
  }
});

export default router;