import express from "express";
import puppeteer from "puppeteer";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import Site from "../models/Site.js";
import Scan from "../models/Scan.js";
import Cookie from "../models/Cookie.js";

const router = express.Router();

const categorizeCookie = (cookie) => {
  const value = `${cookie.name || ""} ${cookie.domain || ""}`.toLowerCase();

  if (
    value.includes("session") ||
    value.includes("csrf") ||
    value.includes("auth") ||
    value.includes("login") ||
    value.includes("cart")
  ) {
    return "necessary";
  }

  if (
    value.includes("lang") ||
    value.includes("locale") ||
    value.includes("theme") ||
    value.includes("pref")
  ) {
    return "preferences";
  }

  if (
    value.includes("functional") ||
    value.includes("functionality")
  ) {
    return "functional";
  }

  if (
    value.includes("_ga") ||
    value.includes("_gid") ||
    value.includes("analytics") ||
    value.includes("gtag")
  ) {
    return "analytics";
  }

  if (
    value.includes("_fbp") ||
    value.includes("doubleclick") ||
    value.includes("ads") ||
    value.includes("marketing") ||
    value.includes("facebook")
  ) {
    return "marketing";
  }

  return "unknown";
};

// GET scan history for a site
router.get("/history/:siteId", authMiddleware, async (req, res) => {
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

    const scans = await Scan.find({ siteId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ scans });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch scan history",
    });
  }
});

// POST scan a site
router.post("/", authMiddleware, async (req, res) => {
  let browser = null;
  let scan = null;

  try {
    const { siteId } = req.body;

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

    const targetUrl = site.domain.startsWith("http")
      ? site.domain
      : `https://${site.domain}`;

    scan = await Scan.create({
      siteId,
      pageUrl: targetUrl,
      status: "pending",
      cookieCount: 0,
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const cookies = await page.cookies();

    const normalizedCookies = cookies.map((cookie) => ({
      siteId,
      scanId: scan._id,
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path || "/",
      expires:
        cookie.expires && cookie.expires !== -1
          ? new Date(cookie.expires * 1000)
          : null,
      category: categorizeCookie(cookie),
    }));

    await Cookie.deleteMany({ siteId });

    if (normalizedCookies.length > 0) {
      await Cookie.insertMany(normalizedCookies);
    }

    scan.status = "success";
    scan.cookieCount = normalizedCookies.length;
    scan.finishedAt = new Date();
    await scan.save();

    return res.status(200).json({
      message: "Scan completed successfully",
      scanId: scan._id,
      siteId,
      pageUrl: targetUrl,
      total: normalizedCookies.length,
      cookies: normalizedCookies,
    });
  } catch (error) {
    console.error("SCAN ERROR:", error);

    if (scan) {
      scan.status = "failed";
      scan.finishedAt = new Date();
      scan.error = error.message || "Scan failed";
      await scan.save();
    }

    return res.status(500).json({
      message: error.message || "Scan failed",
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;