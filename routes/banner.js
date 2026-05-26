import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Site from "../models/Site.js";
import BannerConfig from "../models/BannerConfig.js";

const router = express.Router();

router.get("/public/:siteId", async (req, res) => {
  try {
    const { siteId } = req.params;
    const country = String(req.query.country || "").toUpperCase();

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    const banner = await BannerConfig.findOne({
      siteId,
      isActive: true,
      status: "published",
    }).sort({ version: -1, createdAt: -1 });

    if (!banner) {
      return res.status(404).json({ message: "No published banner found" });
    }

    const baseBanner = banner.toObject();

    const matchedRule = [...(baseBanner.regionRules || [])]
      .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
      .find((rule) => {
        if (!country) return false;
        return Array.isArray(rule.countries)
          ? rule.countries.map((c) => String(c).toUpperCase()).includes(country)
          : false;
      });

    const mergedBanner = matchedRule
      ? {
          ...baseBanner,
          showReject: matchedRule.showReject ?? baseBanner.showReject,
          showCustomize:
            matchedRule.showCustomize ?? baseBanner.showCustomize,
          regionScope: matchedRule.region || baseBanner.regionScope,
          autoShow: matchedRule.autoShow ?? true,
          requireOptIn: matchedRule.requireOptIn ?? true,
          appliedRule: matchedRule.region || null,
        }
      : {
          ...baseBanner,
          autoShow: true,
          requireOptIn: true,
          appliedRule: null,
        };

    return res.status(200).json({
      banner: mergedBanner,
      country: country || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch public banner",
    });
  }
});

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
      regionRules = [],
      publish = false,
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

    if (publish) {
      await BannerConfig.updateMany(
        { siteId },
        { isActive: false, status: "draft" }
      );
    }

    const banner = await BannerConfig.create({
      siteId,
      version: nextVersion,
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
      regionRules,
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
      "regionRules",
    ];

    allowedUpdates.forEach((field) => {
      if (field in req.body) {
        banner[field] = req.body[field];
      }
    });

    if (req.body.publish === true) {
      await BannerConfig.updateMany(
        { siteId: banner.siteId },
        { isActive: false, status: "draft" }
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
