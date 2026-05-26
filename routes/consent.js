import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Site from "../models/Site.js";
import BannerConfig from "../models/BannerConfig.js";
import ConsentLog from "../models/ConsentLog.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      siteId,
      bannerId,
      visitorId,
      choices = {},
      action = "custom",
      userAgent,
      ip,
      url,
    } = req.body;

    if (!siteId || !mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Valid siteId is required" });
    }

    if (!bannerId || !mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({ message: "Valid bannerId is required" });
    }

    if (!visitorId) {
      return res.status(400).json({ message: "visitorId is required" });
    }


    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const banner = await BannerConfig.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ message: "Banner config not found" });
    }

    const consent = new ConsentLog({
      site: siteId,
      banner: bannerId,
      visitorId,
      consent: {
        acceptedAt: new Date(),
        choices,
        action,
      },
      userAgent: userAgent || "",
      ip: ip || "",
      url: url || "",
    });

    await consent.save();

    return res.status(201).json({
      message: "Consent recorded",
      consentId: consent._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to record consent",
    });
  }
});


router.get("/:siteId", authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    const site = await Site.findOne({ _id: siteId, userId: req.user.userId });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const logs = await ConsentLog.find({ site: siteId })
      .populate("banner", "version")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch consent logs",
    });
  }
});
router.post("/public", async (req, res) => {
    try {
      const {
        siteId,
        bannerId,
        visitorId,
        choices,
        action,
        userAgent,
        url,
      } = req.body;
  
      if (!siteId || !mongoose.Types.ObjectId.isValid(siteId)) {
        return res.status(400).json({ message: "Valid siteId is required" });
      }
  
      if (!bannerId || !mongoose.Types.ObjectId.isValid(bannerId)) {
        return res.status(400).json({ message: "Valid bannerId is required" });
      }
  
      const payload = {
        site: siteId,
        banner: bannerId,
        visitorId: visitorId || `guest_${Date.now()}`,
        consent: {
          acceptedAt: new Date(),
          action: action || "accept_all",
          choices: choices || {
            necessary: true,
            preferences: false,
            functional: false,
            analytics: false,
            marketing: false,
          },
        },
        userAgent: userAgent || "",
        url: url || "",
        ip:
          req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          "",
      };
  
      const log = await ConsentLog.create(payload);
  
      return res.status(201).json({
        message: "Consent recorded successfully",
        log,
      });
    } catch (error) {
      console.error("PUBLIC CONSENT ERROR:", error);
      return res.status(500).json({
        message: error.message || "Failed to record public consent",
        error: error.errors || null,
      });
    }
  });

export default router;