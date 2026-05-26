import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Site from "../models/Site.js";
import BannerConfig from "../models/BannerConfig.js";

const router = express.Router();

router.get("/:siteId", authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    const site = await Site.findOne({
      _id: siteId,
      userId: req.user.userId,
    });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const banners = await BannerConfig.find({ siteId }).sort({
      version: -1,
      createdAt: -1,
    });

    const activeBanner = banners.find((b) => b.isActive) || null;

    return res.status(200).json({
      activeBanner,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch banner configs",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      siteId,
      title,
      message,
      layout,
      position,
      themeColor,
      textColor,
      showReject,
      showCustomize,
      overlayEnabled,
      regionScope,
      publish,
    } = req.body;

    if (!siteId) {
      return res.status(400).json({ message: "siteId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    const site = await Site.findOne({
      _id: siteId,
      userId: req.user.userId,
    });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const latestBanner = await BannerConfig.findOne({ siteId }).sort({
      version: -1,
    });

    const nextVersion = latestBanner ? latestBanner.version + 1 : 1;

    const payload = {
      title: title?.trim() || "Your privacy",
      message:
        message?.trim() ||
        "We use cookies to enhance your browsing experience and analyze traffic.",
      layout: ["bottom-bar", "modal"].includes(layout) ? layout : "bottom-bar",
      position: ["bottom", "top", "center"].includes(position)
        ? position
        : "bottom",
      themeColor: themeColor || "#0f766e",
      textColor: textColor || "#ffffff",
      showReject: showReject ?? true,
      showCustomize: showCustomize ?? true,
      overlayEnabled: overlayEnabled ?? false,
      regionScope: regionScope || "Global",
    };

    if (publish) {
      await BannerConfig.updateMany({ siteId }, { isActive: false });
    }

    const banner = await BannerConfig.create({
      siteId,
      version: nextVersion,
      ...payload,
      isActive: !!publish,
      status: publish ? "published" : "draft",
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: publish ? "Banner version published" : "Banner draft saved",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create banner config",
    });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid banner id" });
    }

    const banner = await BannerConfig.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const site = await Site.findOne({
      _id: banner.siteId,
      userId: req.user.userId,
    });

    if (!site) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const allowedUpdates = [
      "title",
      "message",
      "layout",
      "position",
      "themeColor",
      "textColor",
      "showReject",
      "showCustomize",
      "overlayEnabled",
      "regionScope",
    ];

    allowedUpdates.forEach((field) => {
      if (field in req.body) {
        banner[field] = req.body[field];
      }
    });

    if (req.body.publish === true) {
      await BannerConfig.updateMany(
        { siteId: banner.siteId },
        { isActive: false }
      );
      banner.isActive = true;
      banner.status = "published";
    }

    await banner.save();

    return res.status(200).json({
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update banner config",
    });
  }
});

export default router;